from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
import os
from datetime import datetime


def generate_complaint_pdf(complaint_id: int, content: str):
    # Ensure folder exists
    folder = "generated_pdfs"
    os.makedirs(folder, exist_ok=True)

    file_path = f"{folder}/complaint_{complaint_id}.pdf"

    c = canvas.Canvas(file_path, pagesize=A4)
    width, height = A4

    x = 50
    y = height - 50

    c.setFont("Times-Roman", 12)

    for line in content.split("\n"):
        if y < 50:
            c.showPage()
            c.setFont("Times-Roman", 12)
            y = height - 50

        c.drawString(x, y, line)
        y -= 18

    c.showPage()
    c.save()

    return file_path
