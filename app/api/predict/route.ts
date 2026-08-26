import { NextRequest, NextResponse } from 'next/server';
import { SentencePrediction, LabelScore } from '@/lib/types';

const DEFAULT_LABEL_MAP: Record<string, string> = {
  'label_0': 'BACKGROUND',
  'label_1': 'OBJECTIVE',
  'label_2': 'METHODS',
  'label_3': 'RESULTS',
  'label_4': 'CONCLUSIONS',
  '0': 'BACKGROUND',
  '1': 'OBJECTIVE',
  '2': 'METHODS',
  '3': 'RESULTS',
  '4': 'CONCLUSIONS',
  'background': 'BACKGROUND',
  'objective': 'OBJECTIVE',
  'methods': 'METHODS',
  'method': 'METHODS',
  'results': 'RESULTS',
  'result': 'RESULTS',
  'conclusions': 'CONCLUSIONS',
  'conclusion': 'CONCLUSIONS',
};

function normalizeLabel(rawLabel: string): string {
  const clean = String(rawLabel).trim().toLowerCase();
  if (DEFAULT_LABEL_MAP[clean]) {
    return DEFAULT_LABEL_MAP[clean];
  }
  return String(rawLabel).toUpperCase();
}

async function queryEndpoint(url: string, body: any, headers: Record<string, string>) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { sentences, modelId: userModelId, hfToken: userHfToken } = body;

    if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input. Please provide a non-empty array of sentences.' },
        { status: 400 }
      );
    }

    const modelId = userModelId?.trim() || process.env.NEXT_PUBLIC_DEFAULT_MODEL_ID?.trim();
    if (!modelId) {
      return NextResponse.json(
        { error: 'Model ID or Hugging Face Space URL is missing.' },
        { status: 400 }
      );
    }

    const hfToken = userHfToken?.trim() || process.env.HF_API_TOKEN?.trim() || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (hfToken) {
      headers['Authorization'] = `Bearer ${hfToken}`;
    }

    let hfResponse: Response | null = null;
    let lastNetworkError: any = null;

    // If it's a Hugging Face Space URL (e.g. https://himux-pubmed-rct-api.hf.space)
    if (modelId.startsWith('http://') || modelId.startsWith('https://')) {
      const baseUrl = modelId.endsWith('/') ? modelId.slice(0, -1) : modelId;
      
      // Try 1: Gradio native /api/predict endpoint
      try {
        const textPayload = sentences.join('\n');
        hfResponse = await queryEndpoint(`${baseUrl}/api/predict`, { data: [textPayload] }, headers);
      } catch (e) {
        lastNetworkError = e;
      }

      // Try 2: Direct /predict endpoint if /api/predict failed
      if (!hfResponse || !hfResponse.ok) {
        try {
          hfResponse = await queryEndpoint(`${baseUrl}/predict`, { sentences, inputs: sentences }, headers);
        } catch (e) {
          lastNetworkError = e;
        }
      }
    } else {
      // Direct HF Hub Model ID
      headers['x-wait-for-model'] = 'true';
      const requestPayload = {
        inputs: sentences,
        options: { wait_for_model: true, use_cache: false },
      };

      const candidateEndpoints = [
        `https://api-inference.huggingface.co/models/${modelId}`,
        `https://router.huggingface.co/hf-inference/models/${modelId}`,
      ];

      for (const endpoint of candidateEndpoints) {
        try {
          hfResponse = await queryEndpoint(endpoint, requestPayload, headers);
          if (hfResponse && hfResponse.ok) break;
        } catch (err: any) {
          lastNetworkError = err;
        }
      }
    }

    if (!hfResponse) {
      return NextResponse.json(
        {
          error: `Could not connect to Space/API (${lastNetworkError?.message || 'Connection refused'}). Please verify your Space URL is running.`,
        },
        { status: 502 }
      );
    }

    const latencyMs = Date.now() - startTime;

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      return NextResponse.json(
        { error: `Backend API error (${hfResponse.status}): ${errorText}` },
        { status: hfResponse.status }
      );
    }

    const data = await hfResponse.json();
    let sentenceResults: SentencePrediction[] = [];

    // Format A: Gradio response { data: [ [ { sentenceNumber, ... } ] ] } or { data: [ [...] ] }
    if (data.data && Array.isArray(data.data)) {
      const payload = data.data[0];
      if (Array.isArray(payload)) {
        sentenceResults = payload.map((item: any, idx: number) => ({
          sentenceNumber: idx + 1,
          totalSentences: payload.length,
          text: item.text || sentences[idx] || '',
          predictedLabel: normalizeLabel(item.predictedLabel || item.label || 'UNKNOWN'),
          confidence: typeof item.confidence === 'number' ? item.confidence : (item.score || 1.0),
          allScores: item.allScores || [],
        }));
      }
    } else if (data.results && Array.isArray(data.results)) {
      // Format B: FastAPI custom response { results: [...] }
      sentenceResults = data.results.map((item: any, idx: number) => ({
        sentenceNumber: idx + 1,
        totalSentences: data.results.length,
        text: item.text || sentences[idx] || '',
        predictedLabel: normalizeLabel(item.predictedLabel || item.label || 'UNKNOWN'),
        confidence: typeof item.confidence === 'number' ? item.confidence : (item.score || 1.0),
        allScores: item.allScores || [],
      }));
    } else if (Array.isArray(data)) {
      // Format C: Standard HF Inference API
      if (Array.isArray(data[0])) {
        sentenceResults = sentences.map((text, idx) => {
          const scoresArray = (data[idx] || []) as Array<{ label: string; score: number }>;
          const sortedScores: LabelScore[] = scoresArray
            .map((s) => ({ label: normalizeLabel(s.label), score: s.score }))
            .sort((a, b) => b.score - a.score);

          const top = sortedScores[0] || { label: 'UNKNOWN', score: 0 };
          return {
            sentenceNumber: idx + 1,
            totalSentences: sentences.length,
            text,
            predictedLabel: top.label,
            confidence: top.score,
            allScores: sortedScores,
          };
        });
      }
    }

    if (sentenceResults.length === 0) {
      return NextResponse.json(
        { error: 'Unexpected response format from Space.', raw: data },
        { status: 502 }
      );
    }

    return NextResponse.json({
      results: sentenceResults,
      latencyMs,
      modelId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error during inference.' },
      { status: 500 }
    );
  }
}
