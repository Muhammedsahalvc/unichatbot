from pydantic import BaseModel


#Add, update, delete complaints- used for internal tr̥ācking
class ComplaintCreate(BaseModel):
    title: str
    description: str
    category: str

class ComplaintUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    status: str | None = None



# New AI Draft Generator Model

class ComplaintDraftRequest(BaseModel):
    category: str
    description: str
    # student_name: str
    # register_no: str
    # college: str

#edit and save

class ComplaintDraftUpdate(BaseModel):
    draft_text: str

#complaint finalize 9cant edit after)

class ComplaintFinalizeRequest(BaseModel):
    confirm: bool = True  # user confirms final submission




# Sending Complaint as Email (coming next)

class ComplaintSendRequest(BaseModel):
    email: str  # University email address

#for store edited
# class ComplaintFinalizeRequest(BaseModel):
#     final_text: str
