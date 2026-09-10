from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import torch
import re
import os
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

# =======================================================
#  CONFIGURATION
# =======================================================
BASE        = os.path.dirname(__file__)
FRONTEND    = os.path.join(BASE, "..", "frontend")
TASK_PREFIX = "transliterate cmrs to sinhala: "
MAX_INPUT   = 256
MAX_OUTPUT  = 600
NUM_BEAMS   = 4
DEVICE      = "cuda" if torch.cuda.is_available() else "cpu"

# Local folder vs Hugging Face Hub repository
LOCAL_MODEL_DIR = os.path.join(BASE, "model")
HF_REPO_ID = os.getenv("HF_REPO_ID", "ravirush/cmrs-byt5-model")

# Use local directory if weights exist, otherwise fall back to HF Hub
if os.path.exists(os.path.join(LOCAL_MODEL_DIR, "model.safetensors")):
    MODEL_SOURCE = LOCAL_MODEL_DIR
    SOURCE_TYPE = "Local Directory"
else:
    MODEL_SOURCE = HF_REPO_ID
    SOURCE_TYPE = "Hugging Face Hub"


# =======================================================
#  LOAD MODEL AT STARTUP
# =======================================================
print(f"Device       : {DEVICE}")
print(f"Source Type  : {SOURCE_TYPE}")
print(f"Model Source : {MODEL_SOURCE}")
print("Loading ByT5-base model...")

tokenizer = AutoTokenizer.from_pretrained(MODEL_SOURCE)
model     = AutoModelForSeq2SeqLM.from_pretrained(MODEL_SOURCE).to(DEVICE)
model.eval()

print("Model loaded and ready.\n")


# =======================================================
#  CHUNKING
#  Split input into sentence-level chunks so long or
#  multi-line inputs are not silently truncated by the
#  model's max_input limit.
# =======================================================
def split_into_chunks(text: str) -> list:
    parts = re.split(r'(?<=[.!?])\s+|\n+', text.strip())
    return [p.strip() for p in parts if p.strip()]


# =======================================================
#  INFERENCE
# =======================================================
def run_inference(text: str) -> str:
    chunks  = split_into_chunks(text)
    outputs = []

    for chunk in chunks:
        inputs = tokenizer(
            TASK_PREFIX + chunk,
            return_tensors="pt",
            max_length=MAX_INPUT,
            truncation=True
        ).to(DEVICE)

        with torch.no_grad():
            gen_out = model.generate(
                **inputs,
                max_length=MAX_OUTPUT,
                num_beams=NUM_BEAMS,
                early_stopping=True
            )

        decoded = tokenizer.decode(gen_out[0], skip_special_tokens=True).strip()
        outputs.append(decoded)

    return " ".join(outputs)


# =======================================================
#  FASTAPI APP
# =======================================================
app = FastAPI(title="CMRS Transliterator")
app.mount("/static", StaticFiles(directory=FRONTEND), name="static")

# root endpoint
@app.get("/")
def root():
    return FileResponse(os.path.join(FRONTEND, "index.html"))

class TransliterateRequest(BaseModel):
    text: str

class TransliterateResponse(BaseModel):
    input:  str
    output: str

# transliteration endpoint
@app.post("/transliterate", response_model=TransliterateResponse)
def transliterate(req: TransliterateRequest):
    text = req.text.strip()

    if not text:
        raise HTTPException(status_code=400, detail="Input text is empty.")
    if len(text) > 1000:
        raise HTTPException(status_code=400, detail="Input too long. Max 1000 characters.")

    output = run_inference(text)
    return TransliterateResponse(input=text, output=output)

@app.get("/health")
def health():
    return {
        "status": "ok", 
        "device": DEVICE, 
        "model": "ByT5-base",
        "source": SOURCE_TYPE
    }