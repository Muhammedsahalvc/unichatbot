
##loading one pdf
# def load_pdf_text(pdf_path: str) -> str:
#     """
#     Load PDF and return extracted text
#     """
#     pdf_file = Path(pdf_path)

#     if not pdf_file.exists():
#         raise FileNotFoundError(f"PDF not found: {pdf_path}")

#     reader = PdfReader(pdf_file)
#     text = ""

#     for page in reader.pages:
#         page_text = page.extract_text()
#         if page_text:
#             text += page_text + "\n"

#     return text


from pypdf import PdfReader
from pathlib import Path


def load_all_pdfs(folder_path: str):
    """
    Load all PDFs from a folder.
    Returns a list of tuples:
    (pdf_name, extracted_text)
    """

    folder = Path(folder_path)

    if not folder.exists() or not folder.is_dir():
        raise FileNotFoundError(f"PDF folder not found: {folder_path}")

    pdf_texts = []

    for pdf_file in folder.rglob("*.pdf"):
        reader = PdfReader(pdf_file)
        text = ""

        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

        pdf_texts.append((pdf_file.name, text))

        #to view loaded pdfs

        print(f"[PDF LOADER] Found {len(pdf_texts)} PDFs")
        for name, _ in pdf_texts:
         print(" -", name)


    return pdf_texts
