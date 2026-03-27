from fastapi import APIRouter, UploadFile
import shutil

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile):
    file_path = f"temp/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {"filename": file.filename}