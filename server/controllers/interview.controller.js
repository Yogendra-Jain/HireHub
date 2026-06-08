const groq = require("../config/groq");
const User = require("../models/user.model");
const Job = require("../models/job.model");

const generateInterviewQuestions = async (req, res) => {
  try {
    const jobId = req.params.jobId;

    const user = await User.findById(req.user.id);

    const job = await Job.findById(jobId);

    if (!user || !job) {
      return res.status(404).json({
        message: "User or Job not found",
      });
    }
    if (!user.resumeAnalysis) {
      return res.status(400).json({
        message:
          "Please analyze your resume first",
      });
    }
    const prompt = `
    You are an expert technical interviewer.

    Candidate Resume Analysis:

    ${JSON.stringify(user.resumeAnalysis)}

    Job Title:
    ${job.title}

    Job Description:
    ${job.description}

    Generate interview questions.

    Return ONLY valid JSON.

    {
    "technicalQuestions": [],
    "hrQuestions": [],
    "codingQuestions": []
    }

    Requirements:
    - 5 technical questions
    - 5 HR questions
    - 5 coding questions
    - Questions should be based on candidate skills and job requirements
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
        temperature: 0.5,
      });

    const responseText =
      chat.choices[0].message.content;

    const cleanedText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const questions = JSON.parse(cleanedText);

    res.status(200).json(questions);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const evaluateAnswer = async (req, res) => {
  try {
    const {
      question,
      answer,
    } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        message:
          "Question and answer are required",
      });
    }

    const prompt = `
    You are a professional technical interviewer.

    Question:
    ${question}

    Candidate Answer:
    ${answer}

    Evaluate the answer and return ONLY valid JSON.

    Format:

    {
      "score": 0,
      "strengths": [],
      "weaknesses": [],
      "improvedAnswer": ""
    }
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
        temperature: 0.3,
      });

    const responseText =
      chat.choices[0].message.content;

    const cleanedText =
      responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

    const evaluation =
      JSON.parse(cleanedText);

    res.status(200).json(
      evaluation
    );
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  generateInterviewQuestions,
  evaluateAnswer,
};