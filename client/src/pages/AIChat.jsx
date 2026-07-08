import { useState, useRef, useEffect } from "react";
import axios from "axios";

// ─────────────────────────────────────────────────────────────
// AIChat Page — Career Assistant Chat
//
// THE KEY FIX: Conversation Memory
//
// The old version sent only the current message to Groq.
// So every reply was independent — Groq had no memory.
//
// The fix: We keep a `messages` array in state.
// Every time the user sends a message, we send the FULL
// conversation history to Groq — not just the latest message.
//
// Groq accepts an array of { role, content } objects:
//   role "user"      = message from the user
//   role "assistant" = reply from Groq
//   role "system"    = instructions we give to Groq
//
// By sending the full history, Groq can "remember" what was
// said earlier in the conversation.
// ─────────────────────────────────────────────────────────────

function AIChat() {
  // Array of { role: "user" | "assistant", content: string }
  // This is the full conversation history
  const [messages, setMessages] = useState([]);

  // The text currently typed in the input box
  const [input, setInput] = useState("");

  // True while waiting for Groq to reply
  const [loading, setLoading] = useState(false);

  // Ref to the bottom of the chat — used to auto-scroll down
  const bottomRef = useRef(null);

  // Auto-scroll to bottom every time messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ──────────────────────────────────────────
  const sendMessage = async () => {
    // Do nothing if input is empty or already waiting
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");

    // Add user message to the conversation history
    const updatedMessages = [
      ...messages,
      { role: "user", content: userText },
    ];
    setMessages(updatedMessages);

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Send the FULL conversation history to our backend
      // The backend will forward it to Groq with the system prompt
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/chat`,
        {
          // Send all messages so the backend can pass history to Groq
          messages: updatedMessages,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Add Groq's reply to the conversation history
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: response.data.reply },
      ]);

    } catch (error) {
      // Show error as a system message in chat
      const errText = error.response?.data?.message || "Something went wrong. Please try again.";
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: `⚠️ ${errText}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Send on Enter key (Shift+Enter = new line) ────────────
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // prevent newline in textarea
      sendMessage();
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div
      style={{ background: "#0f1117", minHeight: "100vh", color: "white" }}
      className="flex flex-col"
    >
      <div className="max-w-3xl mx-auto w-full px-6 py-10 flex flex-col flex-1">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-1">AI Career Assistant</h1>
          <p style={{ color: "#94a3b8" }} className="text-sm">
            Ask me anything about your career, resume, interview prep, or job search.
          </p>
        </div>

        {/* Chat Window */}
        <div
          className="flex-1 rounded-xl p-5 overflow-y-auto mb-4"
          style={{
            background: "#13151c",
            border:     "1px solid #1e2130",
            minHeight:  "400px",
            maxHeight:  "60vh",
          }}
        >

          {/* Empty state — shown when no messages yet */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-4xl mb-4">🤖</div>
              <p className="font-semibold mb-2">Your AI Career Assistant</p>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Ask me about your resume, job search, interview tips, or salary negotiation.
              </p>

              {/* Suggested prompts */}
              <div className="mt-6 flex flex-col gap-2 w-full max-w-sm">
                {[
                  "What skills should I add to my resume?",
                  "How do I prepare for a React interview?",
                  "What salary should I ask for?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="px-4 py-2 rounded-lg text-sm text-left transition-colors"
                    style={{
                      background: "#1a1f2e",
                      color:      "#94a3b8",
                      border:     "1px solid #1e2130",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = "#22c55e";
                      e.currentTarget.style.color = "#22c55e";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = "#1e2130";
                      e.currentTarget.style.color = "#94a3b8";
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* AI avatar — shown on the left for assistant messages */}
              {msg.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mr-2 mt-1"
                  style={{ background: "#1a2f1a", color: "#22c55e" }}
                >
                  AI
                </div>
              )}

              {/* Message bubble */}
              <div
                className="max-w-[75%] px-4 py-3 rounded-2xl text-sm"
                style={{
                  background:   msg.role === "user" ? "#22c55e" : "#1a1f2e",
                  color:        msg.role === "user" ? "#0f1117" : "#e2e8f0",
                  borderRadius: msg.role === "user"
                    ? "18px 18px 4px 18px"  // user bubble: flat bottom-right
                    : "18px 18px 18px 4px", // AI bubble: flat bottom-left
                  lineHeight: "1.6",
                  whiteSpace: "pre-wrap",   // preserves line breaks in AI responses
                }}
              >
                {msg.content}
              </div>

              {/* User avatar — shown on the right for user messages */}
              {msg.role === "user" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ml-2 mt-1"
                  style={{ background: "#1a2f1a", color: "#22c55e" }}
                >
                  {JSON.parse(localStorage.getItem("user"))?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator — shown while waiting for Groq */}
          {loading && (
            <div className="flex justify-start mb-4">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mr-2"
                style={{ background: "#1a2f1a", color: "#22c55e" }}
              >
                AI
              </div>
              <div
                className="px-4 py-3 rounded-2xl text-sm flex items-center gap-1"
                style={{ background: "#1a1f2e", borderRadius: "18px 18px 18px 4px" }}
              >
                {/* Three animated dots to indicate typing */}
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      background:       "#22c55e",
                      animationDelay:   `${i * 0.15}s`,
                      display:          "inline-block",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Invisible div at the bottom — we scroll here on new messages */}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div
          className="flex gap-3 items-end p-3 rounded-xl"
          style={{ background: "#13151c", border: "1px solid #1e2130" }}
        >
          {/* Textarea — grows with content, Enter sends */}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your career… (Enter to send)"
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none text-sm py-2"
            style={{ color: "white", lineHeight: "1.5" }}
          />

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-lg font-semibold text-sm flex-shrink-0 transition-all"
            style={{
              background: loading || !input.trim() ? "#1e2130" : "#22c55e",
              color:      loading || !input.trim() ? "#64748b"  : "#0f1117",
              cursor:     loading || !input.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>

        {/* Hint text */}
        <p className="text-xs mt-2 text-center" style={{ color: "#475569" }}>
          Press Enter to send · Shift+Enter for new line
        </p>

      </div>
    </div>
  );
}

export default AIChat;