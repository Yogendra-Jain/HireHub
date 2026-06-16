const groq        = require("../config/groq");
const Job         = require("../models/job.model");
const Application = require("../models/application.model"); // needed for applicant count

/**
 * AI-powered job data extraction using Groq
 * Extracts:
 * - Required skills
 * - Responsibilities
 * - Requirements/Qualifications
 * - Benefits
 */
const extractJobData = async (title, description) => {
  const prompt = `
You are an expert HR recruiter and job description writer.

Analyze this job posting and extract structured data.

Job Title: ${title}

Job Description:
${description}

Extract and return ONLY valid JSON. No markdown, no backticks, no explanation.

{
  "requiredSkills": ["skill1", "skill2"],
  "responsibilities": [
    "Responsibility 1",
    "Responsibility 2"
  ],
  "requirements": [
    "Requirement 1",
    "Requirement 2"
  ],
  "benefits": [
    "Benefit 1",
    "Benefit 2"
  ]
}

Rules:
- Extract 5-8 technical skills (languages, frameworks, tools)
- List 4-6 key responsibilities (what the candidate will do)
- List 3-5 requirements/qualifications (education, experience, skills)
- List 3-5 benefits (perks, compensation, culture, growth)
- Each item should be 1-2 sentences max, clear and specific
- Format as bullet points (no bullet symbols in the JSON, just text)
`;

  const chat = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 1000,
  });

  let raw = chat.choices[0].message.content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) raw = jsonMatch[0];

  const result = JSON.parse(raw);

  return {
    requiredSkills: Array.isArray(result.requiredSkills) ? result.requiredSkills : [],
    responsibilities: Array.isArray(result.responsibilities) ? result.responsibilities : [],
    requirements: Array.isArray(result.requirements) ? result.requirements : [],
    benefits: Array.isArray(result.benefits) ? result.benefits : [],
  };
};

const createJob = async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ message: "Recruiter only" });
    }

    const { title, company, location, salary, description, jobType, experienceLevel } = req.body;

    if (!title || !company || !description) {
      return res.status(400).json({ message: "Title, company, and description are required" });
    }

    // Extract job data using Groq
    const extractedData = await extractJobData(title, description);

    const newJob = await Job.create({
      title,
      company,
      location,
      salary,
      description,
      jobType: jobType || "Full-time",
      experienceLevel: experienceLevel || "Mid Level",
      requiredSkills: extractedData.requiredSkills,
      responsibilities: extractedData.responsibilities,
      requirements: extractedData.requirements,
      benefits: extractedData.benefits,
      recruiter: req.user.id,
    });

    res.status(201).json({
      message: "Job created successfully",
      job: newJob,
    });

  } catch (error) {
    console.error("createJob error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const { search, jobType, experienceLevel } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { requiredSkills: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (jobType && jobType !== "All") {
      // FIX: case-insensitive regex so "Full-time" matches "full-time" stored in DB
      query.jobType = { $regex: "^" + jobType + "$", $options: "i" };
    }

    if (experienceLevel && experienceLevel !== "All") {
      // FIX: same for experience level
      query.experienceLevel = { $regex: "^" + experienceLevel + "$", $options: "i" };
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });

    res.status(200).json(jobs);

  } catch (error) {
    console.error("getAllJobs error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate("recruiter", "name email");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.status(200).json(job);

  } catch (error) {
    console.error("getJobById error:", error);
    res.status(500).json({ message: error.message });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 });

    // FIX: count applications per job so recruiter can see total applicants
    const jobsWithCount = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ job: job._id });
        return { ...job.toObject(), applicantCount };
      })
    );

    res.status(200).json(jobsWithCount);

  } catch (error) {
    console.error("getMyJobs error:", error);
    res.status(500).json({ message: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only edit your own jobs" });
    }

    const { title, company, location, salary, description, jobType, experienceLevel, responsibilities, requirements, benefits } = req.body;

    // If description changed, re-extract job data
    if (description && description !== job.description) {
      const extractedData = await extractJobData(title || job.title, description);
      job.requiredSkills = extractedData.requiredSkills;
      job.responsibilities = extractedData.responsibilities;
      job.requirements = extractedData.requirements;
      job.benefits = extractedData.benefits;
    }

    // Update other fields
    if (title) job.title = title;
    if (company) job.company = company;
    if (location) job.location = location;
    if (salary) job.salary = salary;
    if (description) job.description = description;
    if (jobType) job.jobType = jobType;
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (responsibilities) job.responsibilities = responsibilities;
    if (requirements) job.requirements = requirements;
    if (benefits) job.benefits = benefits;

    await job.save();

    res.status(200).json({
      message: "Job updated successfully",
      job,
    });

  } catch (error) {
    console.error("updateJob error:", error);
    res.status(500).json({ message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can only delete your own jobs" });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Job deleted successfully" });

  } catch (error) {
    console.error("deleteJob error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
  updateJob,
  deleteJob,
};