from dotenv import load_dotenv
import os

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from routers.user_router import router as user_router
from database.connect import get_connection

from routers.complaint_router import router as complaint_router
from routers.chat_router import router as chat_router
from fastapi.staticfiles import StaticFiles




app = FastAPI()

app.mount(
    "/documents",
    StaticFiles(directory="data/pdfs"),
    name="documents"
)


# ------------------ CUSTOM OPENAPI (ENABLE BEARER AUTH IN SWAGGER) ------------------
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Law Chatbot Backend API",
        version="1.0.0",
        routes=app.routes,
    )

    # Ensure "components" exists
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}

    # Ensure "securitySchemes" exists
    if "securitySchemes" not in openapi_schema["components"]:
        openapi_schema["components"]["securitySchemes"] = {}

    # Add BearerAuth
    openapi_schema["components"]["securitySchemes"]["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT"
    }

    # Apply BearerAuth globally
    openapi_schema["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


# Apply OpenAPI override BEFORE including router
app.openapi = custom_openapi


# ------------------ CORS ------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ------------------ ROUTES ------------------
app.include_router(user_router)


# ------------------ BASIC TEST ENDPOINTS ------------------
@app.get("/")
def home():
    return {"message": "Backend running!"}


@app.get("/db-test")
def test_db():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT version();")
    version = cur.fetchone()
    conn.close()
    return {"postgres_version": version}

#Add complaint router

app.include_router(complaint_router)

#chat router

app.include_router(chat_router)

