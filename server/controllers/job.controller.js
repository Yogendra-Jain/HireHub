const groq = require("../config/groq");
const Job = require("../models/job.model");

const createJob = async (req, res) => {
  try {

    if (req.user.role !== "recruiter") {
      return res.status(403).json({
        message: "Recruiter only",
      });
    }

    const {
      title,
      company,
      location,
      salary,
      description,
    } = req.body;

    const prompt = `
    You are an expert technical recruiter.

    Analyze this job.

    Job Title:
    ${title}

    Job Description:
    ${description}

    Return ONLY valid JSON.

    {
      "requiredSkills": []
    }

    Rules:
    - Extract technical skills
    - Extract tools
    - Extract frameworks
    - Extract technologies
    - Do not include explanations
    `;

    const chat =
      await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
      });

    const responseText =
      chat.choices[0].message.content;

    const cleanedText =
      responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const extractedSkills =
      JSON.parse(cleanedText);

    const newJob = await Job.create({
      title,
      company,
      location,
      salary,
      description,

      requiredSkills:
        extractedSkills.requiredSkills || [],

      recruiter: req.user.id,
    });

    res.status(201).json({
      message: "Job created successfully",
      job: newJob,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({
      recruiter: req.user.id,
    });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  getMyJobs,
};