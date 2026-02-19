from rag.pdf_loader import load_pdf_text
from rag.text_chunks import split_text_into_chunks
from rag.retriever import retrieve_relevant_chunks
from rag.answer_generator import generate_answer

text = load_pdf_text("data/rag1.pdf")
chunks = split_text_into_chunks(text)

query = "What constitutes ragging according to university rules?"

relevant_chunks = retrieve_relevant_chunks(query, chunks)

answer = generate_answer(query, relevant_chunks)

print("\nFINAL ANSWER:\n")
print(answer)
