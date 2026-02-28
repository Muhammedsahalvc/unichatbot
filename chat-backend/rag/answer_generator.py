from groq import Groq
import os

HIGH_CONFIDENCE = 0.6
LOW_CONFIDENCE = 0.35


def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY not loaded from environment")
    return Groq(api_key=api_key)


def generate_answer(
    query: str,
    retrieved_text: str,
    confidence: float,
    force_kb: bool = False,
    context: list | None = None
):
    client = get_groq_client()

    # ------------------ CONTEXT BLOCK ------------------

    context_block = ""
    if context:
        context_block = "Previous conversation:\n"
        for msg in context[-4:]:
            speaker = "Student" if msg["role"] == "user" else "UniGuide AI"
            context_block += f"{speaker}: {msg['content']}\n"

    # ------------------ PROMPT SELECTION ------------------

    if force_kb or confidence >= HIGH_CONFIDENCE:

        source = "kb"

        prompt = f"""
You are UniGuide AI, a university academic support chatbot.

Use the previous conversation ONLY for understanding the question.
Do NOT repeat or mention it.

Structure:

TITLE:
Short clear heading

OVERVIEW:
1–2 simple sentences

DETAILS:
Bullet points
One idea per line

IMPORTANT NOTES:
Only if applicable

{context_block}

University Reference:
{retrieved_text}

Question:
{query}

Answer:
"""

    elif confidence >= LOW_CONFIDENCE:

        source = "kb_partial"

        prompt = f"""
You are UniGuide AI.

Answer structure:

TITLE:

WHAT IS CONFIRMED:
Bullet points

WHAT IS UNCLEAR:
Bullet points

GENERAL GUIDANCE:
Simple advice

{context_block}

Reference:
{retrieved_text}

Question:
{query}

Answer:
"""

    else:

        source = "general"

        prompt = f"""
You are UniGuide AI.

OVERVIEW:
2–3 simple sentences

NOTE:
One disclaimer sentence

{context_block}

Question:
{query}

Answer:
"""

    # ------------------ CALL LLM ------------------

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3
    )

    final_answer = response.choices[0].message.content.strip()

    # ------------------ COMPLAINT SUGGESTION ------------------

    complaint_keywords = [
        "complaint",
        "report",
        "ragging",
        "harassment",
        "bullying",
        "grievance",
        "mental harassment",
        "fee issue",
        "exam issue",
    ]

    if any(word in query.lower() for word in complaint_keywords):
        final_answer += (
            "\n\n💡 You can generate an official complaint draft "
            "from the 'Complaints' section in your dashboard."
        )

    return final_answer, source




# "file a complaint",
#         "make a complaint",
#         "submit complaint",
#         "how to complain",
#         "how to report",
#         "generate complaint"