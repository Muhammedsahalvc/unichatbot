from fastapi import APIRouter, Depends, HTTPException
from database.connect import get_connection
from auth.jwt_handler import get_current_user
from models.complaints import (
    ComplaintCreate,
    ComplaintUpdate,
    ComplaintDraftRequest,
    ComplaintSendRequest,
    ComplaintFinalizeRequest,
    ComplaintDraftUpdate,

)

from utils.pdf_generator import generate_complaint_pdf
from datetime import datetime



from datetime import datetime
from config.email_config import mail_config
from fastapi_mail import FastMail, MessageSchema
from pathlib import Path

from fastapi.responses import FileResponse


from config.constants import  CALICUT_UNIVERSITY_EMAIL



# Initialize Groq client
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found in environment variables")

client = Groq(api_key=GROQ_API_KEY)



router = APIRouter(prefix="/complaints", tags=["Complaints"])


# ---------------------------------------------------
# CREATE COMPLAINT (DRAFT)
# -----------------------------------------------

@router.post("/create")
def create_complaint(data: ComplaintCreate, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        INSERT INTO complaints (user_id, title, description, category, status)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id;
    """, (user_id, data.title, data.description, data.category, "Draft"))

    complaint_id = cur.fetchone()[0]
    conn.commit()
    conn.close()

    return {"message": "Complaint draft created", "complaint_id": complaint_id}


# -------------------------------------------------
# GET ALL COMPLAINTS FOR USER
# ---------------------------------------------------

@router.get("/all")
def get_complaints(user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, title, description, category, status, created_at, draft_text ,
               final_text, submitted_at, sent_content, sent_at , pdf_path
        FROM complaints 
        WHERE user_id = %s 
        ORDER BY created_at DESC
    """, (user_id,))

    rows = cur.fetchall()
    conn.close()

    complaints = []
    for r in rows:
        complaints.append({
            "id": r[0],
            "title": r[1],
            "description": r[2],
            "category": r[3],
            "status": r[4],
            "created_at": r[5],
            "draft_text":r[6],
            "final_text": r[7],
            "submitted_at": r[8],
            "sent_content": r[9],
            "sent_at": r[10],
            "pdf_path": r[11]
        })

    return {"complaints": complaints}


# ---------------------------------------------------
# GET SINGLE COMPLAINT
# ---------------------------------------------------
@router.get("/{complaint_id}")
def get_single_complaint(complaint_id: int, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, title, description, category, status, created_at, draft_text ,
               final_text, submitted_at, sent_content, sent_at , pdf_path
        FROM complaints 
        WHERE id = %s AND user_id = %s
    """, (complaint_id, user_id))

    r = cur.fetchone()
    conn.close()

    if not r:
        raise HTTPException(status_code=404, detail="Complaint not found")

    return {
        "id": r[0],
        "title": r[1],
        "description": r[2],
        "category": r[3],
        "status": r[4],
        "created_at": r[5],
        "draft_text":r[6],
        "final_text": r[7],
        "submitted_at": r[8],
        "sent_content": r[9],
        "sent_at": r[10],
        "pdf_path": r[11]
    }


# -------------------------------------------
# UPDATE COMPLAINT
# ------------------------------------------------
@router.put("/{complaint_id}")
def update_complaint(complaint_id: int, data: ComplaintUpdate, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    fields = []
    values = []

    if data.title is not None:
        fields.append("title = %s")
        values.append(data.title)

    if data.description is not None:
        fields.append("description = %s")
        values.append(data.description)

    if data.category is not None:
        fields.append("category = %s")
        values.append(data.category)

    if data.status is not None:
        fields.append("status = %s")
        values.append(data.status)

    if not fields:
        raise HTTPException(status_code=400, detail="No changes provided")

    values.append(complaint_id)
    values.append(user_id)

    query = f"""
        UPDATE complaints SET {', '.join(fields)}
        WHERE id = %s AND user_id = %s
    """

    cur.execute(query, tuple(values))
    conn.commit()
    conn.close()

    return {"message": "Complaint updated successfully"}


# ----------------------------------------------
# DELETE COMPLAINT
# ---------------------------------------------
@router.delete("/{complaint_id}")
def delete_complaint(complaint_id: int, user_id: int = Depends(get_current_user)):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("DELETE FROM complaints WHERE id = %s AND user_id = %s",
                (complaint_id, user_id))

    conn.commit()
    conn.close()

    return {"message": "Complaint deleted successfully"}


# ---------------------------------------------------
# GENERATE AI DRAFT
# ------------------------------------------------------

@router.post("/generate-draft/{complaint_id}")
def generate_draft(
    complaint_id:int ,
    data: ComplaintDraftRequest,
    user_id: int = Depends(get_current_user)
):
    conn = get_connection()
    cur = conn.cursor()

    # Auto-fetch logged-in user details
    cur.execute("""
        SELECT name, register_no, college, email
        FROM users
        WHERE id = %s
    """, (user_id,))

    user = cur.fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")

    name, register_no, college, email = user

    today = datetime.now().strftime("%d %B %Y")

    prompt = f"""
Write a formal university complaint letter.

Student Details:
Name: {name}
Register Number: {register_no}
College: {college}
Email: {email}
Date: {today}

Complaint Category: {data.category}
Issue Description: {data.description}

Instructions:
- Do NOT use placeholders like [Your Name]
- Use the provided student details directly
- Include subject, address block, body, and signature
- Keep tone professional and respectful
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}]
    )

    draft = response.choices[0].message.content

    #save draft to db
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE complaints
        SET draft_text = %s,
            status = 'Draft Generated'
        WHERE id = %s AND user_id = %s
    """, (draft, complaint_id, user_id))

    conn.commit()
    conn.close()



    return {
        "message": "Draft generated successfully",
        "draft": draft
    }



#-------------------------------------
#edit draft
#----------------------------------------

@router.put("/edit-draft/{complaint_id}")
def edit_draft(
    complaint_id: int,
    data: ComplaintDraftUpdate,
    user_id: int = Depends(get_current_user)
):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE complaints
        SET draft_text = %s
        WHERE id = %s AND user_id = %s
    """, (data.draft_text, complaint_id, user_id))

    conn.commit()
    conn.close()

    return {"message": "Draft updated successfully"}


# --------------------------------
# FINALIZE COMPLAINT
# --------------------------------

@router.post("/finalize/{complaint_id}")
def finalize_complaint(
    complaint_id: int,
    data: ComplaintFinalizeRequest,
    user_id: int = Depends(get_current_user)
):
    if not data.confirm:
        raise HTTPException(status_code=400, detail="Finalization not confirmed")

    conn = get_connection()
    cur = conn.cursor()

    # Fetch draft from DB (single source of truth)
    cur.execute("""
        SELECT draft_text 
        FROM complaints
        WHERE id = %s AND user_id = %s
    """, (complaint_id, user_id))

    row = cur.fetchone()
    if not row or not row[0]:
        conn.close()
        raise HTTPException(status_code=400, detail="Draft not found")

    final_text = row[0]

    # Generate PDF using final_text
    pdf_path = generate_complaint_pdf(complaint_id, final_text)

    # Lock complaint
    cur.execute("""
        UPDATE complaints
        SET final_text = %s,
            submitted_at = NOW(),
            status = 'Finalized',
            pdf_path = %s
        WHERE id = %s AND user_id = %s
    """, (final_text, pdf_path, complaint_id, user_id))

    conn.commit()
    conn.close()

    return {
        "message": "Complaint finalized successfully",
        "final_text": final_text,
        "pdf_path": pdf_path
    }


# ---------------------------------------------------
# SUBMIT COMPLAINT (Finalize)
# ---------------------------------------------------
# @router.post("/submit/{complaint_id}")
# def submit_complaint(complaint_id: int, user_id: int = Depends(get_current_user)):
#     conn = get_connection()
#     cur = conn.cursor()

#     cur.execute("""
#         SELECT title, description, category FROM complaints 
#         WHERE id = %s AND user_id = %s
#     """, (complaint_id, user_id))

#     data = cur.fetchone()

#     if not data:
#         raise HTTPException(status_code=404, detail="Complaint not found")

#     title, description, category = data

#     prompt = f"""
# Write a FINAL, highly professional complaint letter.

# Title: {title}
# Category: {category}
# Description: {description}
# """

#     response = client.chat.completions.create(
#         model="llama-3.1-8b-instant",
#         messages=[{"role": "user", "content": prompt}]
#     )

#     final_text = response.choices[0].message.content

#     cur.execute("""
#         UPDATE complaints
#         SET final_text = %s, submitted_at = NOW(), status = 'Finalized'
#         WHERE id = %s AND user_id = %s
#     """, (final_text, complaint_id, user_id))

#     conn.commit()
#     conn.close()

#     return {"message": "Finalized successfully", "final_text": final_text}



# #--------------------------------
# #finalize complaint
# #---------------------------------

# @router.post("/finalize/{complaint_id}")
# def finalize_complaint(
#     complaint_id: int,
#     data: ComplaintFinalizeRequest,
#     user_id: int = Depends(get_current_user)
# ):
#     conn = get_connection()
#     cur = conn.cursor()

#      # Generate PDF
#     pdf_path = generate_complaint_pdf(complaint_id, data.final_text)

#     cur.execute("""
#         UPDATE complaints
#         SET final_text = %s,
#             submitted_at = NOW(),
#             status = 'Finalized'
#         WHERE id = %s AND user_id = %s
#     """, (data.final_text, complaint_id, user_id))

#     if cur.rowcount == 0:
#         conn.close()
#         raise HTTPException(status_code=404, detail="Complaint not found")

#     conn.commit()
#     conn.close()

#     return {"message": "Complaint finalized successfully",
#             "pdf_path":pdf_path
#             }




# ---------------------------------------------------
# SEND COMPLAINT AS EMAIL
# ------------------------------------------------

@router.post("/send/{complaint_id}")
async def send_complaint(
    complaint_id: int,
    user_id: int = Depends(get_current_user)
):
    conn = get_connection()
    cur = conn.cursor()

    # Fetch finalized complaint
    cur.execute("""
        SELECT final_text, status, pdf_path FROM complaints
        WHERE id = %s AND user_id = %s
    """, (complaint_id, user_id))

    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Complaint not found")

    final_text, status, pdf_path = row

    if status != "Finalized":
        raise HTTPException(
            status_code=400,
            detail="Complaint must be finalized before sending"
        )

    if not final_text:
        raise HTTPException(
            status_code=400,
            detail="Final complaint text missing"
        )
    
    if not pdf_path:
        raise HTTPException(
            status_code=400,
            detail="PDF not generated yet"
        )
            
    
    

    

#email with pdf

    message = MessageSchema(
        subject="University Complaint Submission",
        recipients=[CALICUT_UNIVERSITY_EMAIL],
        body=final_text,
        subtype="plain",
        attachments=[str(pdf_path)]
    )

    fm = FastMail(mail_config)
    await fm.send_message(message)

    cur.execute("""
        UPDATE complaints
        SET sent_content = %s,
            sent_at = NOW(),
            status = 'Sent'
        WHERE id = %s AND user_id = %s
    """, (final_text, complaint_id, user_id))

    conn.commit()
    conn.close()

    return {"message": "Complaint emailed successfully"}


#-------------------------------------------------
#download pdf

@router.get("/{complaint_id}/download-pdf")
def download_complaint_pdf(
    complaint_id: int,
    user_id: int = Depends(get_current_user)
):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT pdf_path
        FROM complaints
        WHERE id = %s AND user_id = %s
        """,
        (complaint_id, user_id)
    )

    row = cur.fetchone()
    conn.close()

    if not row or not row[0]:
        raise HTTPException(status_code=404, detail="PDF not found")

    pdf_path = row[0]

    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF file missing")

    return FileResponse(
        path=pdf_path,
        filename=f"complaint_{complaint_id}.pdf",
        media_type="application/pdf"
    )
