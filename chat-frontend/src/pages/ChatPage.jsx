import { useState, useRef, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import ReactMarkdown from "react-markdown";

const styles = {
  container: {
    maxWidth: "960px",
    margin: "40px auto",
    display: "flex",
    flexDirection: "column",
    height: "85vh",
    background: "#ffffff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
  },

  chatBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "20px",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    overflowY: "auto",
    background: "#ffffff",
  },

  message: {
    maxWidth: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #e5e7eb",
    lineHeight: "1.7",
    fontSize: "14px",
    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
  },

  badge: {
    marginTop: "8px",
    fontSize: "12px",
    padding: "4px 8px",
    borderRadius: "6px",
    display: "inline-block",
    fontWeight: "500",
  },

  inputArea: {
    display: "flex",
    marginTop: "12px",
    gap: "10px",
  },

  input: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
  },

  sendBtn: {
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    background: "#1e3a8a",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "500",
  },

  micBtn: {
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#111827",
    color: "#ffffff",
    cursor: "pointer",
    fontWeight: "500",
  },

  header: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#1e3a8a",
    marginBottom: "16px",
    borderBottom: "1px solid #e5e7eb",
    paddingBottom: "10px",
  },
};

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await axiosInstance.get("/chat/history?offset=0");
        const formatted = res.data.history.map((msg) => ({
          sender: msg.role === "user" ? "user" : "bot",
          text: msg.message,
          source: msg.source,
        }));
        setMessages(formatted);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    };
    loadHistory();
  }, []);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const question = input;

    setMessages((prev) => [...prev, { sender: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/chat/ask", {
        message: question,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: res.data.reply,
          source: res.data.source,
          documents: res.data.documents || [],
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I couldn’t answer this right now.",
          source: "system",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getBadge = (source) => {
    if (source === "kb")
      return (
        <span
          style={{
            ...styles.badge,
            background: "#dbeafe",
            color: "#1e3a8a",
          }}
        >
          📘 From University Regulations
        </span>
      );

    if (source === "kb_partial")
      return (
        <span
          style={{
            ...styles.badge,
            background: "#fef3c7",
            color: "#92400e",
          }}
        >
          📙 Partial University Reference
        </span>
      );

    if (source === "general")
      return (
        <span
          style={{
            ...styles.badge,
            background: "#e5e7eb",
            color: "#374151",
          }}
        >
          ⚠ General AI Response
        </span>
      );

    return null;
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        UniGuide AI – Student Academic Assistant
      </div>

      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              marginLeft: msg.sender === "user" ? "auto" : "0",
              background: msg.sender === "user" ? "#dbeafe" : "#f8fafc",
            }}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>

{msg.sender === "bot" && (
  <>
    {getBadge(msg.source)}

    {/* Show PDF Sources */}
    {msg.documents && msg.documents.length > 0 && (
      <div style={{ marginTop: "6px", fontSize: "12px" }}>
        {msg.documents.map((doc, i) => (
          <div key={i}>
            📄{" "}
            <a
              href={doc}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#1e3a8a",
                textDecoration: "underline",
              }}
            >
              View Source Document
            </a>
          </div>
        ))}
      </div>
    )}
  </>
)}

          </div>
        ))}

        {loading && (
          <div style={{ fontStyle: "italic", color: "#666" }}>
            UniGuide AI is preparing an answer...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputArea}>
        <input
          style={styles.input}
          placeholder="Ask about exams, rules, complaints..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button style={styles.micBtn} onClick={toggleListening}>
          {listening ? "🎙 Listening..." : "🎤"}
        </button>

        <button style={styles.sendBtn} onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPage;
