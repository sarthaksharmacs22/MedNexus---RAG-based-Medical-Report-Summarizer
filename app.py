# import time
# import os
# # Ensure these match your folder names exactly
# from ocr.extract_text import extract_text
# from processing.cleaner import clean_text
# from ai.simplifier import simplify

# def process_report(image_path):
#     # Start the timer
#     start_time = time.time()
    
#     # Check if file exists before crashing
#     if not os.path.exists(image_path):
#         return f"❌ Error: File not found at {image_path}"

#     # --- STEP 1: OCR ---
#     print(f"\n👁️  [1/3] Scanning image...")
#     try:
#         raw_text = extract_text(image_path)
#     except Exception as e:
#         return f"❌ OCR Crashed: {str(e)}"

#     if not raw_text or not raw_text.strip():
#         return "⚠️ OCR Failed: No readable text found in image."
    
#     print(f"    -> Extracted {len(raw_text)} characters.")

#     # --- STEP 2: CLEANING ---
#     print("🧹 [2/3] Cleaning text (removing doctor names/footers)...")
#     cleaned = clean_text(raw_text)
    
#     if not cleaned.strip():
#         return "⚠️ Cleaning Error: All text was removed. Check cleaner logic."
    
#     print(f"    -> Cleaned text size: {len(cleaned)} chars")

#     # --- STEP 3: AI SIMPLIFICATION ---
#     print("🧠 [3/3] AI is thinking (this may take 10-30s on CPU)...")
#     try:
#         simple = simplify(cleaned)
#     except Exception as e:
#         return f"❌ AI Model Crashed: {str(e)}"

#     # Stop timer
#     elapsed = time.time() - start_time
#     print(f"✅ Finished in {elapsed:.1f} seconds!")
    
#     return simple


# if __name__ == "__main__":
#     # UPDATE THIS PATH to your actual file
#     file_path = r"S:\medical_ai\sample_report.jpeg"

#     print("\n" + "="*50)
#     print("       🏥 MEDICAL REPORT SIMPLIFIER v2.0")
#     print("="*50)
    
#     result = process_report(file_path)

#     print("\n" + "-"*50)
#     print("📄 SIMPLE SUMMARY:")
#     print("-" * 50)
#     print(result)
#     print("-" * 50 + "\n")




import time
import os
import traceback  # <--- Added to see the exact error details
from ocr.extract_text import extract_text
from processing.cleaner import clean_text
from ai.simplifier import simplify

def process_report(image_path):
    # Start the timer
    start_time = time.time()
    
    # Check if file exists before crashing
    if not os.path.exists(image_path):
        return f"❌ Error: File not found at {image_path}"

    # --- STEP 1: OCR ---
    print(f"\n👁️  [1/3] Scanning image...")
    try:
        raw_text = extract_text(image_path)
    except Exception as e:
        print("\n❌ OCR ERROR TRACEBACK:")
        traceback.print_exc()
        return f"❌ OCR Crashed: {str(e)}"

    if not raw_text or not raw_text.strip():
        return "⚠️ OCR Failed: No readable text found in image."
    
    print(f"    -> Extracted {len(raw_text)} characters.")

    # --- STEP 2: CLEANING ---
    print("🧹 [2/3] Cleaning text (removing doctor names/footers)...")
    cleaned = clean_text(raw_text)
    
    if not cleaned.strip():
        return "⚠️ Cleaning Error: All text was removed. Check cleaner logic."
    
    print(f"    -> Cleaned text size: {len(cleaned)} chars")

    # --- STEP 3: AI SIMPLIFICATION ---
    print("🧠 [3/3] AI is thinking...")
    try:
        simple = simplify(cleaned)
    except Exception as e:
        print("\n❌ AI ERROR TRACEBACK:")
        traceback.print_exc()  # <--- This prints the REAL error in red text
        return f"❌ AI Model Crashed: {str(e)}"

    # Stop timer
    elapsed = time.time() - start_time
    print(f"✅ Finished in {elapsed:.1f} seconds!")
    
    return simple


if __name__ == "__main__":
    print("\n" + "="*50)
    print("       🏥 MEDICAL REPORT SIMPLIFIER v2.0")
    print("       (Type 'exit' to quit)")
    print("="*50)

    # Infinite loop to keep the model loaded in memory
    while True:
        # 1. Get input from user
        user_input = input("\n🖼️  Enter path to image (or 'exit'): ").strip()
        
        # 2. Check for exit command
        if user_input.lower() in ["exit", "quit", "q"]:
            print("Goodbye! 👋")
            break
        
        # 3. Handle quoted paths (Windows drag-and-drop fix)
        image_path = user_input.replace('"', '').replace("'", "")

        if not image_path:
            continue

        # 4. Process the report
        result = process_report(image_path)

        print("\n" + "-"*50)
        print("📄 SIMPLE SUMMARY:")
        print("-" * 50)
        print(result)
        print("-" * 50)