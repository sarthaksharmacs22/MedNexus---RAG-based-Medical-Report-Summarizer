from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ✅ Step 1: Create app FIRST
app = FastAPI()

# ✅ Step 2: Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Step 3: Import routes AFTER app creation
from ai.app.routes import upload   # adjust path if needed

# ✅ Step 4: Register routes
app.include_router(upload.router)


from ai.app.routes import summarize
app.include_router(summarize.router)

@app.get("/")
def home():
    return {"message": "MedNexus Backend Running"}