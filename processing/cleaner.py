import re

def clean_text(text):
    # 1. Normalize whitespace
    text = re.sub(r'\s+', ' ', text)

    # 2. Keep useful medical characters
    # Allow letters, numbers, punctuation, and common medical symbols
    text = re.sub(r'[^a-zA-Z0-9.,:/\-%()+= ]', '', text)

    # 3. Remove very short/noisy words (optional safety)
    words = text.split()
    filtered_words = [w for w in words if len(w) > 1]
    text = " ".join(filtered_words)

    # 4. Remove common footer phrases (safe)
    for end_marker in ["for clinical correlation", "end of report", "thanks for referral"]:
        if end_marker in text.lower():
            text = re.split(end_marker, text, flags=re.IGNORECASE)[0]
            break

    return text.strip()