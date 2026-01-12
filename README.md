# 🎓 UniChatBot (UniGuide AI)
An Intelligent University Assistance & Complaint Management Chatbot

---

## 📌 Project Overview

UniChatBot (also called UniGuide AI) is a web-based academic chatbot system designed
to help university students understand university rules, ask academic queries,
and manage official complaints digitally.

The system combines:
- Knowledge-based answering (RAG)
- AI-based answering (LLM)
- Secure authentication
- Real-world complaint workflow

This project is developed as an academic project under the Computer Science domain.

---

## 🚀 Features

### 🔐 Authentication
- JWT-based login & registration
- Protected routes
- Token-based authorization

---

### 💬 Chat Module
- User ↔ Bot conversation
- Chat history per user
- Hybrid answering:
  - Knowledge base (PDF rules via RAG)
  - AI model fallback (Groq – LLaMA 3.1)
- Source labeling (KB / AI)

---

### 📝 Complaint Module
- Create complaint drafts
- AI-powered draft generation
- Edit draft manually
- Finalize complaint
- Auto-generate PDF
- Email complaint to university
- Status tracking:
  - Draft
  - Draft Generated
  - Finalized
  - Sent

---

### 👤 Profile Module
- View & update profile details:
  - Name
  - Register number
  - College
  - Password
- Email is fixed (non-editable)

---

## 🧠 System Architecture (High Level)

Frontend (React)
→ JWT Token
→ Backend (FastAPI)
→ PostgreSQL Database

Chat flow:
User → Knowledge Base (RAG) → AI Model (if needed) → Response

---

## 📚 RAG (Retrieval Augmented Generation)

1. User asks a question
2. System searches university rule PDF
3. Relevant text chunks are retrieved
4. If answer found → returned from knowledge base
5. Else → forwarded to AI model (Groq LLaMA 3.1)

⚠️ The model is NOT fine-tuned.
This project uses prompt-based inference with RAG (industry standard).

---

## 🛠️ Technology Stack

### Backend
- FastAPI
- PostgreSQL
- JWT Authentication
- Groq API (LLaMA 3.1)
- FastMail (Email)
- RAG (PDF-based)

### Frontend
- React.js
- Axios
- React Router
- CSS-in-JS styling

---

## 📂 Project Structure

project/
├── chat-backend/
│ ├── main.py
│ ├── routers/
│ ├── rag/
│ ├── models/
│ ├── utils/
│ ├── database/
│ └── .env
│
├── chat-frontend/
│ ├── src/
│ └── api/
│
└── README.md


## ▶️ How to Run (Quick)

Backend:
- Create `.env`
- Run: `uvicorn main:app --reload`

Frontend:
- Run: `npm install`
- Run: `npm run dev`

## 📌 Project Status
- Backend: Completed
- Frontend: UI completed
- Chat RAG: Demo implemented
- Complaint workflow: Fully functional

