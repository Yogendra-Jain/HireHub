const genAI = require("../config/gemini");
const User = require("../models/user.model");
const Job = require("../models/job.model");

const getJobMatch = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const user = await User.findById(req.user.id);

    const job = await Job.findById(jobId);

    if (!user || !job) {
      return res.status(404).json({
        message: "User or Job not found",
      });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
Compare this candidate with the job.

Candidate Resume Analysis:

${JSON.stringify(user.resumeAnalysis)}

Job Title:
${job.title}

Job Description:
${job.description}

Return ONLY valid JSON.

{
  "matchScore": 0,
  "matchedSkills": [],
  "missingSkills": [],
  "recommendation": ""
}

IMPORTANT:
- matchScore must be between 0 and 100
- Return only JSON
`;

    const result = await model.generateContent(prompt);

    const responseText = result.response.text();

    const cleanedText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const matchData = JSON.parse(cleanedText);

    res.status(200).json(matchData);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getJobMatch,
};