export type RCTLabel = 'BACKGROUND' | 'OBJECTIVE' | 'METHODS' | 'RESULTS' | 'CONCLUSIONS';

export interface LabelScore {
  label: string;
  score: number;
}

export interface SentencePrediction {
  sentenceNumber: number;
  totalSentences: number;
  text: string;
  predictedLabel: string;
  confidence: number;
  allScores: LabelScore[];
}

export interface PredictionResponse {
  results: SentencePrediction[];
  latencyMs: number;
  modelId: string;
  warnings?: string[];
}

export interface SampleAbstract {
  id: string;
  title: string;
  category: string;
  journal?: string;
  rawText: string;
}
