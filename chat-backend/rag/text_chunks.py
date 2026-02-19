def split_text_into_chunks(text: str, chunk_size: int = 600, overlap: int = 120):
    """
    Split a single text into overlapping chunks.

    Input:
        text (str): extracted text from ONE PDF

    Output:
        List[str]: list of text chunks
    """

    chunks = []
    start = 0
    length = len(text)

    while start < length:
        end = start + chunk_size
        chunk = text[start:end].strip()

        if chunk:
            chunks.append(chunk)

        start = end - overlap
        if start < 0:
            start = 0

    return chunks
