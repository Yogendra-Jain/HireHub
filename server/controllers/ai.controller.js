const groq = require("../config/groq");
const User = require("../models/user.model");
const JobMatch = require("../models/jobMatch.model");
const axios = require("axios");
const pdfParse = require("pdf-parse");

const analyzeResume = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user.resume) {
      return res.status(400).json({
        message: "No resume uploaded",
      });
    }

    const pdfResponse = await axios.get(user.resume, {
      responseType: "arraybuffer",
    });

    const pdfData = await pdfParse(pdfResponse.data);

    const prompt = `
Analyze this resume and return ONLY valid JSON.

IMPORTANT:
- score must be an integer from 0 to 100
- do NOT use 0-10 scale

Format:

{
  "score": 0,
  "skills": [],
  "missingSkills": [],
  "strengths": [],
  "suggestions": []
}

Resume:

${pdfData.text}
    `;

    const chat = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
    });

    const analysisText = chat.choices[0].message.content;

    const cleanedText = analysisText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const analysis = JSON.parse(cleanedText);

    // Save new analysis to user
    user.resumeAnalysis = analysis;
    await user.save();

    // ── Invalidate all cached job match scores for this user ──
    // They'll be recomputed fresh on next match request
    const deleted = await JobMatch.deleteMany({ candidate: user._id });
    console.log(`[Cache] Cleared ${deleted.deletedCount} cached job matches for user ${user._id}`);

    res.status(200).json(analysis);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  analyzeResume,
};