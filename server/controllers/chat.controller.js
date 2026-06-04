const genAI = require("../config/gemini");

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    const model =
      genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

    const User = require("../models/user.model");

    const user = await User.findById(req.user.id);

    const prompt = `
    You are an AI Career Assistant.

    This is the user's resume analysis:

    ${user.resumeAnalysis}

    Answer the user's question based on their resume.

    Question:
    ${message}
    `;

    const result = await model.generateContent(prompt);

    const reply =
      result.response.text();

    res.json({
      reply,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  chatWithAI,
};