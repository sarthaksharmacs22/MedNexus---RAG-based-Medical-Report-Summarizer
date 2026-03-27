from fastapi import APIRouter, UploadFile
import shutil
import os
from pathlib import Path
from ai.services.pipeline import process_report

router = APIRouter()

@router.post("/summarize")
async def summarize(file: UploadFile):

    temp_dir = Path("temp")
    temp_dir.mkdir(exist_ok=True)

    file_path = temp_dir / file.filename

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"File saved: {file_path}")

        # 🔥 IMPORTANT: ensure file is fully closed before processing
        summary = process_report(str(file_path))

        return {
            "summary": summary,
            "file_id": file.filename   # 🔥 ADD THIS
        }

    except Exception as e:
        print(f"Error processing {file.filename}: {str(e)}")
        return {"error": str(e)}

    finally:
        # ✅ SAFE CLEANUP
        if file_path.exists():
            os.remove(file_path)