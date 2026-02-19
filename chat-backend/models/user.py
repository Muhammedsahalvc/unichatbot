from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel): #for user create
    name: str
    email: EmailStr    #automatic validates user format
    password: str
    college: str
    register_no:str


class UserLogin(BaseModel): #for user login
    email: EmailStr
    password: str


## profile api
from pydantic import BaseModel                                                                                                 #BaseModel, the main class from Pydantic used to define data models with automatic validation and serialization.
from typing import Optional
                                                                                                                               #Optional[T] means “this value can be of type T or None”, i.e., T | None. 

class UserUpdate(BaseModel):                                                                                                   #define new class that inherit from BaseModel
    name: Optional[str] = None                                                                                          #Declares a field name on the model.name: Optional[str] means the value can be a string or None, and = None sets the default to None,
    college: Optional[str] = None
    register_no: Optional[str] = None

#email update
class EmailUpdate(BaseModel):
    new_email: EmailStr

#password update
class PasswordUpdate(BaseModel):
    old_password: str
    new_password: str
