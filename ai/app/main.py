import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
    "https://your-frontend-app.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from ai.app.routes import upload
from ai.app.routes import summarize

app.include_router(upload.router)
app.include_router(summarize.router)

@app.get("/")
def home():
    return {"message": "MedNexus Backend Running"}