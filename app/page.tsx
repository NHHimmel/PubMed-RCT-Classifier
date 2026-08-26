'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { AbstractInput } from '@/components/AbstractInput';
import { StructuredResults } from '@/components/StructuredResults';
import { ModelConfigModal } from '@/components/ModelConfigModal';
import { splitAbstractIntoSentences } from '@/lib/sentence-splitter';
import { PredictionResponse, SampleAbstract } from '@/lib/types';
import { SAMPLE_ABSTRACTS } from '@/lib/sample-abstracts';
import { Cpu, CheckCircle, Database, Layers, ArrowRight, Server, Globe } from 'lucide-react';

export default function Home() {
  const [modelId, setModelId] = useState<string>('https://himux-pubmed-rct-api.hf.space');
  const [hfToken, setHfToken] = useState<string>('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Initialize from default sample
  const [rawText, setRawText] = useState<string>(SAMPLE_ABSTRACTS[0].rawText);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [predictionData, setPredictionData] = useState<PredictionResponse | null>(null);

  // Load saved config from localStorage or env
  useEffect(() => {
    const savedModelId = localStorage.getItem('hf_model_id');
    const savedToken = localStorage.getItem('hf_token');

    if (savedModelId) {
      setModelId(savedModelId);
    } else if (process.env.NEXT_PUBLIC_DEFAULT_MODEL_ID) {
      setModelId(process.env.NEXT_PUBLIC_DEFAULT_MODEL_ID);
    } else {
      setModelId('https://himux-pubmed-rct-api.hf.space');
    }

    if (savedToken) {
      setHfToken(savedToken);
    }
  }, []);

  const handleSaveConfig = (newModelId: string, newToken: string) => {
    setModelId(newModelId);
    setHfToken(newToken);
    localStorage.setItem('hf_model_id', newModelId);
    localStorage.setItem('hf_token', newToken);
  };

  // Compute sentences dynamically
  const sentences = useMemo(() => {
    return splitAbstractIntoSentences(rawText);
  }, [rawText]);

  const handleSelectSample = (sample: SampleAbstract) => {
    setRawText(sample.rawText);
    setError(null);
    setPredictionData(null);
  };

  const handleClear = () => {
    setRawText('');
    setPredictionData(null);
    setError(null);
  };

  const handleClassify = async () => {
    if (!rawText.trim() || sentences.length === 0) return;

    if (!modelId.trim()) {
      setIsConfigOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingMessage('Tokenizing and sending sentences to model backend...');

    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sentences,
          modelId: modelId.trim(),
          hfToken: hfToken.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.isModelLoading) {
          setLoadingMessage(`Model is warming up (~${Math.round(data.estimatedTime || 20)}s). Retrying automatically...`);
          setTimeout(async () => {
            try {
              const retryRes = await fetch('/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sentences,
                  modelId: modelId.trim(),
                  hfToken: hfToken.trim(),
                }),
              });
              const retryData = await retryRes.json();
              if (!retryRes.ok) throw new Error(retryData.error || 'Retry failed');
              setPredictionData(retryData);
            } catch (retryErr: any) {
              setError(retryErr.message);
            } finally {
              setIsLoading(false);
            }
          }, 8000);
          return;
        }
        throw new Error(data.error || `Error ${response.status}: Failed to get predictions`);
      }

      setPredictionData(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during inference.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header
        modelId={modelId}
        onOpenSettings={() => setIsConfigOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Model Backend Banner with quick edit */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400">Target Model Endpoint:</span>
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                  {modelId}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Connected to Hugging Face Space / Model API for live inference.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsConfigOpen(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all shrink-0 flex items-center space-x-1.5"
          >
            <span>Change Endpoint</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2-Column Grid: Abstract Input + Structured Output */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-6 flex flex-col">
            <AbstractInput
              rawText={rawText}
              onChangeText={setRawText}
              sentenceCount={sentences.length}
              isLoading={isLoading}
              onClassify={handleClassify}
              onSelectSample={handleSelectSample}
              onClear={handleClear}
            />
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <StructuredResults
              data={predictionData}
              isLoading={isLoading}
              loadingMessage={loadingMessage}
              error={error}
            />
          </div>
        </div>

        {/* Informational Cards about PubMed 20k RCT & Architecture */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-3">
              <Layers className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-slate-100 mb-1">
              5 RCT Label Categories
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trained to classify sentences into standard clinical RCT sections: <strong className="text-slate-300">BACKGROUND, OBJECTIVE, METHODS, RESULTS, and CONCLUSIONS</strong>.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-3">
              <Cpu className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-slate-100 mb-1">
              BERT-Base Architecture
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Uses bidirectional transformer representations with fine-tuned classification head on medical randomized controlled trial abstracts.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-3">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-semibold text-slate-100 mb-1">
              Vercel Serverless Ready
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designed for zero cold-start web deployment with secure server-side API proxy to your Hugging Face Space backend.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>
          PubMed 200k RCT / 20k RCT Sequential Sentence Classification • Powered by BERT & Next.js
        </p>
      </footer>

      {/* Model Settings Modal */}
      <ModelConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        currentModelId={modelId}
        currentHfToken={hfToken}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
