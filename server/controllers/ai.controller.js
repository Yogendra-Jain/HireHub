const genAI = require("../config/gemini");
const User = require("../models/user.model");
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

        const pdfResponse = await axios.get(
            user.resume,
            {
                responseType: "arraybuffer",
            }
        );

        const pdfData = await pdfParse(
            pdfResponse.data
        );

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

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

        const result = await model.generateContent(prompt);

        const analysisText = result.response.text();

        const cleanedText = analysisText
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();

        const analysis = JSON.parse(cleanedText);

        res.status(200).json(analysis);

        user.resumeAnalysis = analysis;

        await user.save();
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: error.message,
        });
    }
};

module.exports = {
    analyzeResume,
};