# CMRS Transliterator

A transformer-based back-transliteration system for Code-Mixed Romanized Sinhala (CMRS) text. This application converts informal Romanized Sinhala (Singlish) commonly used on social media into native Sinhala script.

## Problem

Sri Lankans frequently write Sinhala using English letters mixed with English words on digital platforms (e.g., "mama office eka hadanawa"). Existing NLP tools cannot process this code-mixed informal text effectively, creating a barrier for Sinhala language processing on social media and messaging applications.

## Solution

This research fine-tunes two pretrained transformer-based sequence-to-sequence models (mT5-base and ByT5-base) on a parallel corpus of code-mixed Romanized Sinhala and native Sinhala script pairs. ByT5-base was selected as the final model based on superior performance across all evaluation metrics.

## Key Results

- **ByT5-base Performance:**
  - BLEU Score: 48.82
  - Character Error Rate (CER): 20.30%
  - Word Error Rate (WER): 36.06%

- **mT5-base Performance (baseline comparison):**
  - BLEU Score: 44.46
  - CER: 22.05%
  - WER: 40.06%

## System Architecture

The application uses a three-tier architecture:

1. **Presentation Tier** — Lightweight web frontend (HTML5, CSS3, JavaScript)
2. **Logic Tier** — FastAPI backend with ByT5-base inference engine
3. **Data Tier** — SECM Sinhala parallel corpus (4,444 samples)

### Key Features
- **Sentence-Level Chunking** — Handles multi-sentence inputs without truncation
- **Dynamic Padding** — Memory-efficient batch processing
- **Beam Search Decoding** — Higher quality output than greedy decoding
- **Real-Time Inference** — Immediate feedback to users

---

## Installation and Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Local Setup

1. **Clone the repository:**
```bash
git clone [https://github.com/ravirush/cmrs-transliterator-app.git](https://github.com/ravirush/cmrs-transliterator-app.git)
cd cmrs-transliterator-app
```

2. **Create and activate virtual environment:**
**macOS/ Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```
**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

4. **Model Weights Configuration:**
You do not need to manually download weights to run this application:
   - Default (Cloud): The application will automatically stream and cache the model from Hugging Face Hub (ravirush/cmrs-byt5-model) on first run.
   - Local (Optional): If you already have weights locally, place them in backend/model/ (model.safetensors, config.json, etc.), and the application will detect and load them directly from disk.

### Running the Application

1. **Start the FastAPI server:**
```bash
uvicorn backend.main:app --reload
```

2. **Access the App:**
   - Open your browser and navigate to: `http://127.0.0.1:8000`
   - The web frontend will load automatically.
   - API documentation (Swagger UI) is available at: `http://127.0.0.1:8000/docs`

3. **Using the Interface:**
   - Type code-mixed Romanized Sinhala text in the input panel.
   - Click Transliterate (or press Ctrl + Enter / Cmd + Enter).
   - Copy the native Sinhala output or clear both panels using the interface buttons.

### Example Inputs

| Romanized Sinhala (Input) | Native Sinhala (Output) |
|---|---|
| mama gena yanawa | මම ගෙන යනවා |
| koheda yanne | කොහෙද යන්නේ |
| food rasai | ෆුඩ් රසයි |
| api wage karanna one | අපි වාගේ කරන්න ඕනේ |

---

## Technology Stack

- **Framework:** FastAPI, Uvicorn
- **Deep Learning:** PyTorch, Hugging Face Transformers
- **Architecture:** ByT5-base (Token-free byte-level sequence-to-sequence model)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (Fetch API)
- **Model Registry:** Hugging Face Hub (ravirush/cmrs-byt5-model)