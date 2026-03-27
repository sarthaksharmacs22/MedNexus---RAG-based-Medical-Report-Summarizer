import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig, TextStreamer
from retriever import get_rag_context

MODEL = "microsoft/phi-3-mini-4k-instruct"

    # --- SPEED HACK: 4-BIT LOADING ---
bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
)

print(f"Loading {MODEL} in 4-bit mode (Speed Optimized)...")

    # Load Tokenizer & Model
try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL)
        model = AutoModelForCausalLM.from_pretrained(
            MODEL,
            quantization_config=bnb_config,
            device_map="cuda:0"  # Forces model to GPU
    )
except Exception as e:
        print(f"❌ Error loading model: {e}")
        raise e

def simplify(text):
    # 🔥 Step 0: Pre-correct common OCR errors (VERY IMPORTANT)
    COMMON_FIXES = {
        "uycr": "liver",
        "skze": "size",
        "mlld": "mild",
        "dilfuso": "diffuse",
        "innitratlon": "infiltration"
    }

    for wrong, correct in COMMON_FIXES.items():
        text = text.replace(wrong, correct).replace(wrong.capitalize(), correct.capitalize())

    rag_context = get_rag_context(text)

    prompt = f"""
You are a medical expert.

The text below is extracted using OCR and may contain spelling errors.

Instructions:
- Correct OCR errors mentally
- Do NOT show corrected text
- Only give final explanation
- Do NOT guess organs
- If unclear, say "unclear"

MEDICAL REPORT:
{text}

Answer:
"""

    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")

    print("🧠 Generating response...")

    with torch.no_grad():
        output = model.generate(
        **inputs,
        max_new_tokens=200,
        do_sample=False,
        eos_token_id=tokenizer.eos_token_id,
        pad_token_id=tokenizer.eos_token_id,
        repetition_penalty=1.1
    )

    decoded = tokenizer.decode(output[0], skip_special_tokens=True)

    print("\n🔍 FULL MODEL OUTPUT:\n", decoded)

    # 🔥 Extract only final answer
    if "Answer:" in decoded:
        result = decoded.split("Answer:")[-1]

        # STOP unwanted continuation
        if "Instruction" in result:
            result = result.split("Instruction")[0]

        return result.strip()

    return decoded.strip()