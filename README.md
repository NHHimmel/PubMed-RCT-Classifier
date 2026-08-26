# PubMed RCT 20k - BERT Inference Web App

A Next.js web application for real-time sequential sentence classification on clinical randomized controlled trial (RCT) abstracts, using fine-tuned **BERT-base** on the **PubMed 200k/20k RCT** dataset.

## ✨ Features
- **Smart Sentence Tokenization**: Accurately splits unstructured medical abstract paragraphs into individual sentences without breaking on medical abbreviations, decimals, or p-values.
- **5-Class RCT Tagging**: Predicts and color-codes each sentence into:
  - 🟡 **BACKGROUND**
  - 🔵 **OBJECTIVE**
  - 🟣 **METHODS**
  - 🟢 **RESULTS**
  - 🔴 **CONCLUSIONS**
- **Dual View Modes**:
  - **Sentence Cards**: Detailed view with confidence percentages and class probability distributions.
  - **Structured Abstract**: Formatted clinical paper view with one-click Markdown export.
- **Preset Clinical Samples**: Pre-loaded RCT abstracts from NEJM, Lancet, and JAMA.
- **Vercel Serverless Architecture**: Secure API route proxying calls to Hugging Face Serverless Inference API without exposing your Hugging Face API token to the client browser.

---

## 🚀 Quick Start Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Create `.env.local`:
```env
# Your uploaded model repository ID on Hugging Face
NEXT_PUBLIC_DEFAULT_MODEL_ID=your-username/pubmed-20k-bert

# Hugging Face Access Token (Required if model is private)
HF_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxx
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

### Option 1: Deploy via GitHub (Recommended)
1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of PubMed RCT BERT app"
   git branch -M main
   git remote add origin https://github.com/your-username/pubmed-rct-bert-inference.git
   git push -u origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import your GitHub repository.
4. In **Environment Variables**, add:
   - `NEXT_PUBLIC_DEFAULT_MODEL_ID`: `your-username/your-model-name`
   - `HF_API_TOKEN`: `hf_xxxxxxxxxxxxxxxx` *(if private repository)*
5. Click **Deploy**!

### Option 2: Deploy via Vercel CLI
```bash
npx vercel
```

---

## 🔬 Dataset & Model Details
- **Dataset**: PubMed 200k RCT (Franck Dernoncourt & Ji Young Lee)
- **Subset**: PubMed 20k RCT
- **Task**: Sequential sentence classification for biomedical abstracts
