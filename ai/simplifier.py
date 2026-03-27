import requests
import os

HF_TOKEN = os.getenv("HF_TOKEN")

API_URL = "https://api-inference.huggingface.co/models/microsoft/phi-3-mini-4k-instruct"

headers = {
    "Authorization": f"Bearer {HF_TOKEN}"
}

def simplify(text):
    prompt = f"""
You are a medical expert.

TASK:
- Summarize the medical report clearly
- Do NOT assume missing information
- Only use information present

REPORT:
{text}

SUMMARY:
"""

    try:
        response = requests.post(
            API_URL,
            headers=headers,
            json={"inputs": prompt}
        )

        result = response.json()

        if isinstance(result, list):
            return result[0]["generated_text"]

        return "Error generating summary"

    except Exception as e:
        return f"Error: {str(e)}"