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

  // 🔹 Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Load history
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

  // 🎤 Setup Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onend = () => {
      setListening(false);
    };

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

  // 🔹 Send message
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
          documents: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
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
          </div>
        ))}

        {loading && (
          <div style={{ fontStyle: "italic", color: "#666" }}>
            UniGuide AI is preparing an answer...
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
