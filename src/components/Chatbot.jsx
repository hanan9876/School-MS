import { useState } from "react";
import "./Chatbot.css";
import { IoIosChatboxes } from "react-icons/io";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // popup open/close

  const canSend = Boolean(input.trim()) && !loading;

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages([...messages, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, role: "student" }),
      });

      const data = await res.json();
      const reply = data.reply || "No response";

      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Error contacting chatbot" },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="chatbot-toggle-btn"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        <IoIosChatboxes className="chatbot-toggle-icon" />
      </button>

      {/* Chat Popup */}
      {open && (
        <div className="chatbot-popup">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <span className="chatbot-header-icon" aria-hidden="true">
                <IoIosChatboxes />
              </span>
              <div className="chatbot-header-titles">
                <div className="chatbot-title">AI Assistant</div>
                <div className="chatbot-subtitle">
                  {loading ? "Typing…" : "Online"}
                </div>
              </div>
            </div>
            <button
              className="chatbot-close-btn"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✖
            </button>
          </div>

          <div className="chat-window">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`message ${m.role === "user" ? "user" : "bot"}`}
              >
                <span className="message-text">{m.text}</span>
              </div>
            ))}
            {loading && (
              <div className="message bot typing">
                <span className="message-text">Typing…</span>
              </div>
            )}
          </div>

          <div className="input-area">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSend && sendMessage()}
              placeholder="Ask anything..."
              aria-label="Chat message"
            />
            <button onClick={sendMessage} disabled={!canSend}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}