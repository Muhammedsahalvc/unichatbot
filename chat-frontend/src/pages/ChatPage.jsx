const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    height: "85vh",
    background: "#f8fafc",
    padding: "10px",
  },

  chatBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "16px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflowY: "auto",
    background: "#ffffff",
  },

  message: {
    maxWidth: "70%",
    padding: "10px 12px",
    borderRadius: "10px",
    color: "#1f2937",
    lineHeight: "1.5",
    fontSize: "14px",
  },

  inputArea: {
    display: "flex",
    marginTop: "12px",
    gap: "10px",
  },

  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
  },

  sendBtn: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    background: "#1e3a8a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "500",
  },
};


import { useState, useRef, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

function ChatPage() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello 👋 I am UniGuide AI. How can I help you today?",
      source: "system",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 1️⃣ Add user message to UI
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    const question = input;
    setInput("");
    setLoading(true);

    try {
      // 2️⃣ Call backend chat API
      const res = await axiosInstance.post("/chat/ask", {
        message: question,   // MUST be "message"
      });

      // 3️⃣ Add bot reply from backend
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: res.data.reply,
          source: res.data.source,
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I couldn't process your request.",
          source: "system",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={styles.container}>
      <h2>💬 UniGuide Chat</h2>

      {/* Chat Window */}
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
              background:
                msg.sender === "user" ? "#DCF8C6" : "#F1F0F0",
            }}
          >
            <p style={{ margin: 0 }}>{msg.text}</p>

            {msg.source && msg.sender === "bot" && (
              <small style={{ fontSize: "10px", color: "#666" }}>
                {msg.source === "kb"
                  ? "From University Rules"
                  : msg.source === "ai"
                    ? "AI Generated"
                    : ""}
              </small>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ fontStyle: "italic", color: "#666" }}>
            UniGuide AI is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={styles.inputArea}>
        <input
          style={styles.input}
          placeholder="Ask about exams, rules, complaints..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button style={styles.sendBtn} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPage;
