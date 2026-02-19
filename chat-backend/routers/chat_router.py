from fastapi import APIRouter, Depends, Query
from auth.jwt_handler import get_current_user
from models.chat import ChatRequest
from database.connect import get_connection

from rag.pdf_loader import load_all_pdfs
from rag.text_chunks import split_text_into_chunks
from rag.retriever import retrieve_relevant_chunks, init_chunk_embeddings
from rag.answer_generator import generate_answer

# ------------------ ROUTER ------------------

router = APIRouter(
    prefix="/chat",
    tags=["Chat"]
)

# ------------------ LOAD KNOWLEDGE BASE ------------------

DATA_DIR = "data"
CHUNKS = []

pdf_texts = load_all_pdfs(DATA_DIR)

for pdf_name, pdf_text in pdf_texts:
    text_chunks = split_text_into_chunks(pdf_text)

    for chunk in text_chunks:
        CHUNKS.append({
            "text": chunk,
            "source": pdf_name
        })

print(f"[RAG] Loaded {len(CHUNKS)} chunks from {len(pdf_texts)} PDFs")

# Initialize embeddings once
init_chunk_embeddings(CHUNKS)
print("[RAG] Chunk embeddings initialized")

# ------------------ ASK CHAT ------------------

@router.post("/ask")
def ask_chat(
    data: ChatRequest,
    user_id: int = Depends(get_current_user)
):
    user_query = data.message

    conn = get_connection()
    cur = conn.cursor()

    # 1️⃣ Save user message
    cur.execute("""
        INSERT INTO chat_messages (user_id, role, message)
        VALUES (%s, %s, %s)
    """, (user_id, "user", user_query))
    conn.commit()

    # 2️⃣ Retrieve RAG chunks
    retrieved_text, confidence, sources = retrieve_relevant_chunks(
        user_query,
        CHUNKS
    )

    # 3️⃣ Fetch recent conversation context (last 3 turns)
    cur.execute("""
        SELECT role, message
        FROM chat_messages
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 6
    """, (user_id,))

    rows = cur.fetchall()
    rows.reverse()

    conversation_context = [
        {"role": r[0], "content": r[1]}
        for r in rows
        if r[0] in ("user", "assistant")
    ]

    # Determine strong KB case
    is_strong_kb = (
        confidence >= 0.45 and
        retrieved_text.strip() != "" and
        len(sources) > 0
    )

    # 4️⃣ Generate answer
    bot_reply, source_label = generate_answer(
        user_query,
        retrieved_text,
        confidence,
        force_kb=is_strong_kb,
        context=conversation_context
    )

    BASE_DOC_URL = "http://127.0.0.1:8000/documents"

    # Attach documents only for strong KB
    if source_label == "kb":
        document_links = [
            f"{BASE_DOC_URL}/{doc}" for doc in sources
        ]
    else:
        document_links = []

    # 5️⃣ Save assistant reply
    cur.execute("""
        INSERT INTO chat_messages (user_id, role, message, source)
        VALUES (%s, %s, %s, %s)
    """, (user_id, "assistant", bot_reply, source_label))

    conn.commit()
    conn.close()

    return {
        "reply": bot_reply,
        "source": source_label,
        "confidence": round(confidence, 2),
        "documents": document_links
    }

# ------------------ CHAT HISTORY ------------------

CHAT_HISTORY_LIMIT = 20

@router.get("/history")
def get_chat_history(
    user_id: int = Depends(get_current_user),
    offset: int = Query(0, ge=0)
):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT role, message, source, created_at
        FROM chat_messages
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT %s OFFSET %s
    """, (user_id, CHAT_HISTORY_LIMIT, offset))

    rows = cur.fetchall()
    conn.close()

    rows.reverse()

    history = [
        {
            "role": r[0],
            "message": r[1],
            "source": r[2],
            "time": r[3]
        }
        for r in rows
    ]

    return {
        "history": history,
        "limit": CHAT_HISTORY_LIMIT,
        "offset": offset,
        "has_more": len(history) == CHAT_HISTORY_LIMIT
    }
