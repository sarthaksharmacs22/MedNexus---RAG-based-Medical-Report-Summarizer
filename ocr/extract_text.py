import cv2
import easyocr
import numpy as np

# Initialize reader once

try:
    reader = easyocr.Reader(['en'], gpu=True)
    print("✅ Using GPU for OCR")
except Exception as e:
    print(f"⚠️ GPU not available: {e}")
    reader = easyocr.Reader(['en'], gpu=False)

def preprocess_medical(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # CLAHE for better contrast (medical docs love this)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    
    # Milder denoising
    blurred = cv2.GaussianBlur(enhanced, (3, 3), 0)
    
    # Softer threshold
    thresh = cv2.adaptiveThreshold(blurred, 255, 
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
    cv2.THRESH_BINARY, 15, 3)
    return thresh



def is_medical_text(text):
    stripped = ''.join(c for c in text.replace(" ", "") if c.isalnum())
    if len(stripped) < 10:  # Minimum length
        return False
    
    # Medical reports: more digits/special chars OK
    letters = sum(c.isalpha() for c in stripped)
    return letters / len(stripped) > 0.2


def extract_text(image_path):
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Image not found: {image_path}")

    print("\n--- MEDICAL OCR START ---")
    
    strategies = [
        ("CLAHE+Threshold", preprocess_medical(img)),
        ("Raw RGB", img),
        ("Gray only", cv2.cvtColor(img, cv2.COLOR_BGR2GRAY))
    ]
    
    best_text = ""
    best_score = 0

    for name, processed in strategies:
        results = reader.readtext(processed, detail=1, paragraph=False)

        results = sorted(results, key=lambda x: x[0][0][1])

        filtered = [r for r in results if r[2] > 0.3]
        text = "\n".join([r[1] for r in filtered])

        score = sum(r[2] for r in filtered)

        print(f"[{name}] Score: {score:.2f}, Length: {len(text)}")

        if score > best_score and is_medical_text(text):
            best_text = text
            best_score = score

    # 🔥 AFTER LOOP → decision
    if best_score < 5:
        print("⚠️ Low OCR confidence, using fallback")
        fallback = reader.readtext(img, detail=0, paragraph=True)

        if not fallback:
            raise Exception("No readable medical text found.")

        return " ".join(fallback)

    if not best_text:
        print("⚠️ No valid OCR text, using fallback")
        fallback = reader.readtext(img, detail=0, paragraph=True)

        if not fallback:
            raise Exception("No readable medical text found.")

        return " ".join(fallback)

    best_text = best_text.replace("  ", " ").strip()

    print("✅ MEDICAL OCR SUCCESS")
    return best_text

# Add medical term correction (5 lines)
MEDICAL_FIXES = {
    "PANKAV": "PANKAJ", "WHQLE": "WHOLE", "ABDQMEN": "ABDOMEN",
    "Lver": "Liver", "REFF": "REF", "22YTM": "22Y/M"
}

def postprocess_ocr(text):
    for wrong, right in MEDICAL_FIXES.items():
        text = text.replace(wrong, right)
    return text
