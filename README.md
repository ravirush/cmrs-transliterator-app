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

1. **Presentation Tier** — Web-based frontend (HTML, CSS, JavaScript)
2. **Logic Tier** — FastAPI backend with ByT5-base inference engine
3. **Data Tier** — SECM Sinhala parallel corpus (4,444 samples)

### Key Features
- **Sentence-Level Chunking** — Handles multi-sentence inputs without truncation
- **Dynamic Padding** — Memory-efficient batch processing
- **Beam Search Decoding** — Higher quality output than greedy decoding
- **Real-Time Inference** — Immediate feedback to users

## Installation and Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Local Setup

1. **Clone the repository:**
```bash
cd cmrs-transliterator-app
```

2. **Create and activate virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate
# On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Place the trained model:**
   - Download the fine-tuned ByT5-base model
   - Extract into `backend/model/` folder
   - Ensure the folder contains: `model.safetensors`, `config.json`, `tokenizer_config.json`, etc.

### Running the Application

1. **Start the backend server:**
```bash
cd backend
uvicorn main:app --reload
```
**or**

1. **Open a new terminal:**
2. **Create and activate virtual environment:**
source venv/bin/activate
3. **Start the backend server:**
uvicorn backend.main:app --reload
4. **You are good to go:**

The server will start at `http://127.0.0.1:8000`

2. **Open in browser:**
   - Navigate to `http://127.0.0.1:8000`
   - The frontend loads automatically

3. **Using the application:**
   - Type code-mixed Romanized Sinhala text in the input panel
   - Click "Transliterate" or press Ctrl+Enter
   - Native Sinhala script appears in the output panel
   - Use "Copy" button to copy output to clipboard
   - Use "Clear" button to reset both panels

### Example Inputs

| Romanized Sinhala | Native Sinhala |
|---|---|
| mama gena yanawa | මම ගෙන යනවා |
| koheda yanne | කොහෙද යන්නේ |
| food rasai | ෆුඩ් රසයි |
| api wage karanna one | අපි වාගේ කරන්න ඕනේ |

## Technology Stack

### Backend
- **Python** — Core language
- **FastAPI** — Web framework
- **Uvicorn** — ASGI server
- **PyTorch** — Deep learning framework
- **HuggingFace Transformers** — Model loading and inference
- **ByT5-base** — Fine-tuned sequence-to-sequence model

### Frontend
- **HTML5** — Page structure
- **CSS3** — Styling and animations
- **JavaScript** — User interaction and API communication

### Development & Training
- **Kaggle** — GPU training environment (NVIDIA P100)
- **HuggingFace Datasets** — Dataset processing
- **HuggingFace Evaluate** — Evaluation metrics (BLEU, CER, WER)
- **Matplotlib** — Visualization of training curves