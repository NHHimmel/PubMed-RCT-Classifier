"""
Helper script to push Tokenizer files and README.md with pipeline metadata
to your Hugging Face model repository.
"""

from huggingface_hub import HfApi, login
from transformers import AutoTokenizer

# ==========================================
# 1. Fill in your details:
# ==========================================
HF_WRITE_TOKEN = "YOUR_HF_WRITE_TOKEN_HERE"  # Get from https://huggingface.co/settings/tokens (Must have WRITE permission)
REPO_ID = "YOUR_USERNAME/YOUR_MODEL_REPO_NAME"  # e.g., "john/pubmed-20k-bert"
BASE_TOKENIZER = "bert-base-uncased"  # Or "bert-base-cased" depending on what you trained with

print(f"Logging in to Hugging Face...")
login(token=HF_WRITE_TOKEN)

# ==========================================
# 2. Push the Tokenizer files
# ==========================================
print(f"Loading base tokenizer '{BASE_TOKENIZER}'...")
tokenizer = AutoTokenizer.from_pretrained(BASE_TOKENIZER)

print(f"Pushing tokenizer to repository '{REPO_ID}'...")
tokenizer.push_to_hub(REPO_ID, token=HF_WRITE_TOKEN)
print("✅ Tokenizer files uploaded successfully!")

# ==========================================
# 3. Create and upload README.md (Model Card)
# ==========================================
readme_content = """---
pipeline_tag: text-classification
library_name: transformers
language:
  - en
tags:
  - medical
  - pubmed-rct
  - bert
---

# PubMed 20k RCT - BERT Base Classifier

Fine-tuned BERT-base model for sequential sentence classification on randomized controlled trial (RCT) abstracts.

## Label Mapping
- `0`: BACKGROUND
- `1`: OBJECTIVE
- `2`: METHODS
- `3`: RESULTS
- `4`: CONCLUSIONS
"""

print("Uploading README.md with pipeline_tag metadata...")
api = HfApi()
api.upload_file(
    path_or_fileobj=readme_content.encode("utf-8"),
    path_in_repo="README.md",
    repo_id=REPO_ID,
    repo_type="model",
    token=HF_WRITE_TOKEN
)

print(f"🎉 All done! Your model '{REPO_ID}' is now ready for Serverless Inference!")
