from ocr.extract_text import extract_text
from processing.cleaner import clean_text
from ai.simplifier import simplify
import os

def process_report(image_path):
    print("\n--- PIPELINE START ---")

    if not os.path.exists(image_path):
        raise Exception("File not found")

    print("Step 1: OCR")
    raw_text = extract_text(image_path)
    print("OCR OUTPUT:", raw_text[:200])  # preview

    if not raw_text.strip():
        raise Exception("OCR failed")

    print("Step 2: Cleaning")
    cleaned = clean_text(raw_text)
    print("CLEANED OUTPUT:", cleaned[:200])

    if not cleaned.strip():
        raise Exception("Cleaning failed")

    print("Step 3: Simplifier")
    simple = simplify(cleaned)
    print("FINAL OUTPUT:", simple)
    print("\nRAW TEXT:\n", raw_text[:300])
    print("\nCLEANED TEXT:\n", cleaned[:300])

    return simple