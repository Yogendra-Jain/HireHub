const groq = require("../config/groq");
const User = require("../models/user.model");

// ─────────────────────────────────────────────────────────────
// chatWithAI Controller
//
// THE KEY FIX: Conversation Memory
//
// Old version: received only `message` (single string)
//   → sent only 1 message to Groq → no memory
//
// New version: receives `messages` (full history array)
//   → passes the entire history to Groq
//   → Groq can now "remember" previous messages
//
// The system prompt is added as the FIRST message with
// role "system" — this tells Groq who it is and what context
// it has (the user's resume analysis from MongoDB).
//
// Groq message format:
//   { role: "system",    content: "You are..." }
//   { role: "user",      content: "What skills do I have?" }
//   { role: "assistant", content: "Based on your resume..." }
//   { role: "user",      content: "How can I improve them?" }
// ─────────────────────────────────────────────────────────────

const chatWithAI = async (req, res) => {
  try {
    // Get full conversation history from request body
    // Array of { role: "user" | "assistant", content: string }
    const { messages } = req.body;

    // Validate that messages were sent
    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: "No messages provided" });
    }

    // Load user from database to get their resume analysis
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build the system prompt — this gives Groq context about the user
    // If they have a resume analysis, include it so Groq can give
    // personalized advice. If not, still allow the chat.
    let systemContent = `You are an expert AI Career Assistant for HireHub, a job portal.
You help candidates with:
- Resume improvement and skill gaps
- Job search strategy
- Interview preparation
- Salary negotiation
- Career path advice

Be concise, friendly, and actionable. Give specific advice, not generic tips.`;

    // Add resume context if the user has analyzed their resume
    if (user.resumeAnalysis) {
      systemContent += `

The user's resume has been analyzed. Here is their profile:
${JSON.stringify(user.resumeAnalysis, null, 2)}

Use this to give personalized advice. Reference their specific skills and gaps.`;
    }

    // Build the full messages array to send to Groq:
    // 1. System message (our instructions + user context)
    // 2. All previous messages (conversation history)
    const groqMessages = [
      { role: "system", content: systemContent },
      ...messages, // spread the full conversation history
    ];

    // Call Groq with the full conversation history
    const chat = await groq.chat.completions.create({
      messages: groqMessages,
      model:    "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens:  800,
    });

    // Extract Groq's reply text
    const reply = chat.choices[0].message.content;

    res.status(200).json({ reply });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { chatWithAI };