const groq = require("../config/groq");

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;


    const User = require("../models/user.model");

    const user = await User.findById(req.user.id);

    const prompt = `
    You are an AI Career Assistant.

    This is the user's resume analysis:

    ${JSON.stringify(
      user.resumeAnalysis,
      null,
      2
    )}

    Answer the user's question based on their resume.

    Question:
    ${message}
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
        temperature: 0.7,
      });

    const reply =
      chat.choices[0].message.content;

    res.status(200).json({
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