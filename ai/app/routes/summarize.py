from fastapi import APIRouter, UploadFile
import shutil
import os

from ai.services.pipeline import process_report

router = APIRouter()

@router.post("/summarize")
async def summarize(file: UploadFile):
    file_path = f"temp/{file.filename}"

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        summary = process_report(file_path)
        return {"summary": summary}
    
    except Exception as e:
        return {"error": str(e)}