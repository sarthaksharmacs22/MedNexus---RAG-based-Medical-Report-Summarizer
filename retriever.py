import json
import os

# Load database relative to this file
DB_PATH = os.path.join(os.path.dirname(__file__), "medical_db.json")

def get_rag_context(text):
    """Scans report for keywords and retrieves definitions."""
    if not os.path.exists(DB_PATH):
        return ""

    with open(DB_PATH, "r") as f:
        kb = json.load(f)

    text_lower = text.lower()
    found_info = []

    for term, definition in kb.items():
        if term in text_lower:
            found_info.append(f"- {term.upper()}: {definition}")

    return "\n".join(found_info)