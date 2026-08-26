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

/**
 * Normalizes Space URL:
 * e.g. "https://huggingface.co/spaces/HimuX/pubmed-rct-api" -> "https://himux-pubmed-rct-api.hf.space"
 */
function normalizeSpaceUrl(rawUrl: string): string {
  let url = rawUrl.trim();
  if (url.includes('huggingface.co/spaces/')) {
    const parts = url.split('huggingface.co/spaces/')[1].split('/');
    if (parts.length >= 2) {
      const user = parts[0].toLowerCase();
      const space = parts[1].toLowerCase().replace(/\/$/, '');
      url = `https://${user}-${space}.hf.space`;
    }
  }
  return url.replace(/\/+$/, '');
}

async function callGradioApi(baseUrl: string, textPayload: string, headers: Record<string, string>) {
  // Gradio 4+ uses /call/predict (with event id) or /run/predict or /api/predict
  const endpoints = [
    `${baseUrl}/run/predict`,
    `${baseUrl}/api/predict`,
    `${baseUrl}/gradio_api/call/predict`,
    `${baseUrl}/call/predict`,
    `${baseUrl}/predict`,
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ data: [textPayload], sentences: textPayload.split('\n') }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        // If Gradio /call/predict returned an event_id, fetch the event stream
        if (json.event_id) {
          const eventUrl = `${endpoint}/${json.event_id}`;
          const eventRes = await fetch(eventUrl, { headers });
          if (eventRes.ok) {
            const eventText = await eventRes.text();
            // Parse SSE data: ...
            const lines = eventText.split('\n');
            for (const line of lines) {
              if (line.startsWith('data:')) {
                try {
                  const eventData = JSON.parse(line.replace(/^data:\s*/, ''));
                  return { ok: true, data: { data: eventData } };
                } catch (_) {}
              }
            }
          }
        }
        return { ok: true, data: json };
      }
    } catch (_) {
      // Try next endpoint candidate
    }
  }

  return { ok: false };
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await req.json();
    const { sentences, modelId: rawModelId, hfToken: userHfToken } = body;

    if (!sentences || !Array.isArray(sentences) || sentences.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input. Please provide a non-empty array of sentences.' },
        { status: 400 }
      );
    }

    const rawId = rawModelId?.trim() || process.env.NEXT_PUBLIC_DEFAULT_MODEL_ID?.trim();
    if (!rawId) {
      return NextResponse.json(
        { error: 'Model ID or Hugging Face Space URL is missing.' },
        { status: 400 }
      );
    }

    const modelId = normalizeSpaceUrl(rawId);
    const hfToken = userHfToken?.trim() || process.env.HF_API_TOKEN?.trim() || '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (hfToken) {
      headers['Authorization'] = `Bearer ${hfToken}`;
    }

    let parsedData: any = null;

    if (modelId.startsWith('http://') || modelId.startsWith('https://')) {
      const textPayload = sentences.join('\n');
      const gradioRes = await callGradioApi(modelId, textPayload, headers);
      if (gradioRes.ok) {
        parsedData = gradioRes.data;
      }
    } else {
      // Direct HF Hub Model ID
      headers['x-wait-for-model'] = 'true';
      const requestPayload = {
        inputs: sentences,
        options: { wait_for_model: true, use_cache: false },
      };

      const candidateEndpoints = [
        `https://router.huggingface.co/hf-inference/models/${modelId}`,
        `https://api-inference.huggingface.co/models/${modelId}`,
      ];

      for (const endpoint of candidateEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(requestPayload),
          });
          if (res.ok) {
            parsedData = await res.json();
            break;
          }
        } catch (_) {}
      }
    }

    if (!parsedData) {
      return NextResponse.json(
        {
          error: `Could not connect to model at "${modelId}". Please verify your Space is Running and public.`,
        },
        { status: 502 }
      );
    }

    const latencyMs = Date.now() - startTime;
    let sentenceResults: SentencePrediction[] = [];

    // Parse Gradio data format
    if (parsedData.data && Array.isArray(parsedData.data)) {
      const payload = parsedData.data[0];
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
    } else if (parsedData.results && Array.isArray(parsedData.results)) {
      sentenceResults = parsedData.results.map((item: any, idx: number) => ({
        sentenceNumber: idx + 1,
        totalSentences: parsedData.results.length,
        text: item.text || sentences[idx] || '',
        predictedLabel: normalizeLabel(item.predictedLabel || item.label || 'UNKNOWN'),
        confidence: typeof item.confidence === 'number' ? item.confidence : (item.score || 1.0),
        allScores: item.allScores || [],
      }));
    } else if (Array.isArray(parsedData)) {
      if (Array.isArray(parsedData[0])) {
        sentenceResults = sentences.map((text, idx) => {
          const scoresArray = (parsedData[idx] || []) as Array<{ label: string; score: number }>;
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
        { error: 'Unexpected response format from backend.', raw: parsedData },
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
