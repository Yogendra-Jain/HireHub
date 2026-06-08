const express = require("express");
const router = express.Router();

const groq = require("../config/groq");

router.get("/test", async (req, res) => {
  try {
    const chat =
      await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: "Say Hello",
          },
        ],
        model: "llama-3.3-70b-versatile",
      });

    res.json({
      reply:
        chat.choices[0].message.content,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;