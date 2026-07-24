import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Bot, Send, AlertTriangle, MessageSquare } from "lucide-react";

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
        { role: "assistant", content: errText },
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
    <div className="page-container-narrow flex flex-col" style={{ minHeight: 'calc(100vh - var(--navbar-height))' }}>

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">AI Career Assistant</h1>
        <p className="page-subtitle">
          Ask me anything about your career, resume, interview prep, or job search.
        </p>
      </div>

      {/* Chat Window */}
      <div
        className="card flex-1 overflow-y-auto mb-4"
        style={{ minHeight: "400px", maxHeight: "60vh" }}
      >
        <div className="card-body">

          {/* Empty state — shown when no messages yet */}
          {messages.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Bot size={28} />
              </div>
              <p className="empty-state-title">Your AI Career Assistant</p>
              <p className="empty-state-text">
                Ask me about your resume, job search, interview tips, or salary negotiation.
              </p>

              {/* Suggested prompts */}
              <div className="mt-6 flex flex-col gap-2 w-full max-w-sm mx-auto">
                {[
                  "What skills should I add to my resume?",
                  "How do I prepare for a React interview?",
                  "What salary should I ask for?",
                ].map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="tag text-left cursor-pointer px-4 py-2 text-sm"
                  >
                    <MessageSquare size={14} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                    <span className="ml-2">{prompt}</span>
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
                <div className="avatar avatar-sm mr-2 mt-1" style={{ background: 'var(--primary)' }}>
                  <Bot size={16} />
                </div>
              )}

              {/* Message bubble */}
              <div
                className={msg.role === "user" ? "chat-bubble-user" : "chat-bubble-ai"}
                style={{ whiteSpace: "pre-wrap" }}
              >
                {msg.content}
              </div>

              {/* User avatar — shown on the right for user messages */}
              {msg.role === "user" && (
                <div className="avatar avatar-sm ml-2 mt-1">
                  {JSON.parse(localStorage.getItem("user"))?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator — shown while waiting for Groq */}
          {loading && (
            <div className="flex justify-start mb-4">
              <div className="avatar avatar-sm mr-2" style={{ background: 'var(--primary)' }}>
                <Bot size={16} />
              </div>
              <div className="chat-bubble-ai flex items-center gap-1">
                {/* Three animated dots to indicate typing */}
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce inline-block"
                    style={{
                      background:     'var(--primary)',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Invisible div at the bottom — we scroll here on new messages */}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="card">
        <div className="flex gap-3 items-end p-3">
          {/* Textarea — grows with content, Enter sends */}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your career… (Enter to send)"
            rows={1}
            className="input-field flex-1 resize-none"
            style={{ border: 'none', boxShadow: 'none' }}
          />

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="btn btn-primary btn-icon flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Hint text */}
      <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
        Press Enter to send · Shift+Enter for new line
      </p>

    </div>
  );
}

export default AIChat;