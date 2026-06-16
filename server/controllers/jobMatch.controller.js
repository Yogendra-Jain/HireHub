const User = require("../models/user.model");
const Job = require("../models/job.model");
const Application = require("../models/application.model");
const JobMatch = require("../models/jobMatch.model");
const groq = require("../config/groq");

// ─── Helper: Call Groq to compute match score ─────────────────────────────────
const computeMatchWithGroq = async ({ candidateSkills, candidateResumeAnalysis, requiredSkills, jobTitle, jobDescription }) => {

  const candidateSection = candidateSkills.length > 0
    ? `Candidate Skills (extracted): ${candidateSkills.join(", ")}`
    : `Candidate Resume Analysis (raw JSON — extract skills from this):\n${JSON.stringify(candidateResumeAnalysis, null, 2)}`;

  const jobSection = requiredSkills.length > 0
    ? `Job Required Skills (extracted): ${requiredSkills.join(", ")}`
    : `Job Title: ${jobTitle}\nJob Description (extract required skills from this):\n${jobDescription}`;

  const prompt = `
You are a senior technical recruiter with deep knowledge of tech stacks.

Analyze the match between this candidate and job opening.

--- JOB ---
${jobSection}
Full Job Description: ${jobDescription}

--- CANDIDATE ---
${candidateSection}

--- YOUR TASK ---
1. If required skills were not explicitly provided, extract them from the job description
2. If candidate skills were not explicitly provided, extract them from the resume analysis JSON
3. Compare using SEMANTIC understanding:
   - "React" = "ReactJS" = "React.js"
   - "Node" = "NodeJS" = "Node.js"
   - "ML" = "Machine Learning"
   - "Postgres" = "PostgreSQL"
   - "JS" = "JavaScript"
   - Consider related/transferable skills
4. Give a realistic match score — do NOT return 0 unless the candidate truly has zero relevant skills

Return ONLY a raw valid JSON object. No markdown, no backticks, no explanation.

{
  "matchScore": <integer 0-100>,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "recommendation": "<one of: Excellent Match | Good Match | Potential Candidate | Needs Skill Improvement>",
  "aiInsight": "<2-3 sentence honest assessment of the candidate's fit for this specific role>"
}
`;

  const chat = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    max_tokens: 600,
  });

  let raw = chat.choices[0].message.content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) raw = jsonMatch[0];

  const result = JSON.parse(raw);
  result.matchScore = Math.min(100, Math.max(0, parseInt(result.matchScore) || 0));

  return result;
};

// ─── Helper: Get or compute match (cache logic lives here) ────────────────────
const getOrComputeMatch = async (candidateId, job, candidateUser) => {

  // A snapshot string to detect if resume was re-analyzed since last cache
  const currentSnapshot = JSON.stringify(candidateUser.resumeAnalysis?.skills || []);

  // 1. Check cache
  const cached = await JobMatch.findOne({ candidate: candidateId, job: job._id });

  if (cached && cached.resumeAnalysisSnapshot === currentSnapshot) {
    // Cache HIT — return stored result instantly, no Groq call
    console.log(`[JobMatch] Cache HIT for candidate ${candidateId} job ${job._id}`);
    return { ...cached.toObject(), fromCache: true };
  }

  // 2. Cache MISS or resume was re-analyzed — call Groq
  console.log(`[JobMatch] Cache MISS for candidate ${candidateId} job ${job._id} — calling Groq`);

  const result = await computeMatchWithGroq({
    candidateSkills: candidateUser.resumeAnalysis?.skills || [],
    candidateResumeAnalysis: candidateUser.resumeAnalysis || {},
    requiredSkills: job.requiredSkills || [],
    jobTitle: job.title,
    jobDescription: job.description,
  });

  // 3. Save/update cache in MongoDB
  await JobMatch.findOneAndUpdate(
    { candidate: candidateId, job: job._id },
    {
      candidate: candidateId,
      job: job._id,
      matchScore: result.matchScore,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      recommendation: result.recommendation,
      aiInsight: result.aiInsight,
      resumeAnalysisSnapshot: currentSnapshot,
    },
    { upsert: true, new: true }
  );

  return { ...result, fromCache: false };
};


// ─── GET /api/job-match/:jobId  (Candidate checks their own match) ─────────────
const getJobMatch = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const job = await Job.findById(req.params.jobId);

    if (!user || !job) {
      return res.status(404).json({ message: "User or Job not found" });
    }

    if (!user.resume && !user.resumeAnalysis) {
      return res.status(200).json({
        matchScore: 0,
        matchedSkills: [],
        missingSkills: job.requiredSkills || [],
        recommendation: "No Resume Found",
        aiInsight: "Please upload and analyze your resume first to get a match score.",
        fromCache: false,
      });
    }

    const result = await getOrComputeMatch(user._id, job, user);

    res.status(200).json(result);

  } catch (error) {
    console.error("getJobMatch error:", error.message);
    res.status(500).json({ message: error.message });
  }
};


// ─── GET /api/job-match/applicants-match/:jobId  (Recruiter sees ranked applicants) ──
const getApplicantsMatch = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Recruiter only" });
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only view your own jobs" });
    }

    const applications = await Application.find({ job: req.params.jobId }).populate("candidate");

    const applicantsWithScore = [];

    for (const application of applications) {
      const candidate = application.candidate;
      if (!candidate) continue;

      let result;

      if (!candidate.resume && !candidate.resumeAnalysis) {
        result = {
          matchScore: 0,
          matchedSkills: [],
          missingSkills: job.requiredSkills || [],
          recommendation: "No Resume Analyzed",
          aiInsight: "This candidate has not uploaded or analyzed their resume yet.",
          fromCache: false,
        };
      } else {
        result = await getOrComputeMatch(candidate._id, job, candidate);
      }

      applicantsWithScore.push({
        applicationId: application._id,
        candidateId: candidate._id,
        name: candidate.name,
        email: candidate.email,
        status: application.status,
        matchScore: result.matchScore,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        recommendation: result.recommendation,
        aiInsight: result.aiInsight,
        fromCache: result.fromCache,
      });
    }

    applicantsWithScore.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(applicantsWithScore);

  } catch (error) {
    console.error("getApplicantsMatch error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getJobMatch,
  getApplicantsMatch,
};