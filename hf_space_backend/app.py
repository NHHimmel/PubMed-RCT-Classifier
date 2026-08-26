from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

app = FastAPI(title="PubMed 20k RCT BERT Inference API")

# Update with your HF Model Repository ID:
MODEL_ID = "YOUR_USERNAME/YOUR_MODEL_NAME"

print(f"Loading model and tokenizer for {MODEL_ID}...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_ID).to(device)
model.eval()

# Standard label mapping
DEFAULT_LABELS = {
    0: "BACKGROUND",
    1: "OBJECTIVE",
    2: "METHODS",
    3: "RESULTS",
    4: "CONCLUSIONS"
}

class PredictRequest(BaseModel):
    sentences: List[str]

@app.get("/")
def read_root():
    return {"status": "online", "model": MODEL_ID}

@app.post("/predict")
def predict(req: PredictRequest):
    if not req.sentences:
        raise HTTPException(status_code=400, detail="No sentences provided")

    results = []
    with torch.no_grad():
        for idx, sentence in enumerate(req.sentences):
            inputs = tokenizer(
                sentence,
                return_tensors="pt",
                truncation=True,
                max_length=512,
                padding=True
            ).to(device)

            outputs = model(**inputs)
            probs = F.softmax(outputs.logits, dim=-1).squeeze(0)

            all_scores = []
            for class_idx, score in enumerate(probs):
                label_name = model.config.id2label.get(class_idx, DEFAULT_LABELS.get(class_idx, f"LABEL_{class_idx}"))
                all_scores.append({
                    "label": str(label_name).upper(),
                    "score": float(score.item())
                })

            all_scores = sorted(all_scores, key=lambda x: x["score"], reverse=True)
            top_score = all_scores[0]

            results.append({
                "sentenceNumber": idx + 1,
                "text": sentence,
                "predictedLabel": top_score["label"],
                "confidence": top_score["score"],
                "allScores": all_scores
            })

    return {"results": results}
