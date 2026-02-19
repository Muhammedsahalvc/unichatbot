from sentence_transformers import SentenceTransformer, util
from functools import lru_cache

model = SentenceTransformer("all-MiniLM-L6-v2")

HIGH_CONFIDENCE = 0.5
LOW_CONFIDENCE = 0.25

# 🔹 Global cached chunk embeddings
CHUNK_TEXTS = []
CHUNK_EMBEDDINGS = None


def init_chunk_embeddings(chunks):
    """
    Initialize embeddings ONCE at server startup
    """
    global CHUNK_TEXTS, CHUNK_EMBEDDINGS

    CHUNK_TEXTS = [c["text"] for c in chunks]
    CHUNK_EMBEDDINGS = model.encode(
        CHUNK_TEXTS,
        convert_to_tensor=True,
        show_progress_bar=True
    )


@lru_cache(maxsize=256)
def _encode_query(query: str):
    """
    Cache query embeddings (Option B)
    """
    return model.encode(query, convert_to_tensor=True)


def retrieve_relevant_chunks(query, chunks, top_k=3):
    """
    Input:
        query: str
        chunks: list of dicts { "text": ..., "source": ... }

    Returns:
        retrieved_text (str)
        confidence (float)
        sources (list[str])
    """

    if CHUNK_EMBEDDINGS is None:
        return "", 0.0, []

    # 🔹 Cached query embedding
    query_embedding = _encode_query(query)

    similarities = util.cos_sim(query_embedding, CHUNK_EMBEDDINGS)[0]

    scored = list(zip(chunks, similarities))
    scored.sort(key=lambda x: float(x[1]), reverse=True)

    top_chunks = scored[:top_k]

    best_score = max(float(score) for _, score in top_chunks)

    retrieved_text = ""
    sources = set()

    for chunk, score in top_chunks:
        retrieved_text += chunk["text"] + "\n\n"
        sources.add(chunk["source"])

    return retrieved_text.strip(), best_score, list(sources)
