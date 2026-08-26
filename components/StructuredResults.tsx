'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Layers,
  FileText,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Download,
} from 'lucide-react';
import { PredictionResponse, SentencePrediction } from '@/lib/types';

interface StructuredResultsProps {
  data: PredictionResponse | null;
  isLoading: boolean;
  loadingMessage?: string;
  error?: string | null;
}

const LABEL_THEMES: Record<
  string,
  {
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    cardBorder: string;
    cardBg: string;
    dotColor: string;
    name: string;
  }
> = {
  BACKGROUND: {
    badgeBg: 'bg-amber-950/70',
    badgeBorder: 'border-amber-700/60',
    badgeText: 'text-amber-300',
    cardBorder: 'border-amber-900/40 hover:border-amber-700/60',
    cardBg: 'bg-amber-950/10',
    dotColor: 'bg-amber-400',
    name: 'Background',
  },
  OBJECTIVE: {
    badgeBg: 'bg-sky-950/70',
    badgeBorder: 'border-sky-700/60',
    badgeText: 'text-sky-300',
    cardBorder: 'border-sky-900/40 hover:border-sky-700/60',
    cardBg: 'bg-sky-950/10',
    dotColor: 'bg-sky-400',
    name: 'Objective',
  },
  METHODS: {
    badgeBg: 'bg-indigo-950/70',
    badgeBorder: 'border-indigo-700/60',
    badgeText: 'text-indigo-300',
    cardBorder: 'border-indigo-900/40 hover:border-indigo-700/60',
    cardBg: 'bg-indigo-950/10',
    dotColor: 'bg-indigo-400',
    name: 'Methods',
  },
  RESULTS: {
    badgeBg: 'bg-emerald-950/70',
    badgeBorder: 'border-emerald-700/60',
    badgeText: 'text-emerald-300',
    cardBorder: 'border-emerald-900/40 hover:border-emerald-700/60',
    cardBg: 'bg-emerald-950/10',
    dotColor: 'bg-emerald-400',
    name: 'Results',
  },
  CONCLUSIONS: {
    badgeBg: 'bg-rose-950/70',
    badgeBorder: 'border-rose-700/60',
    badgeText: 'text-rose-300',
    cardBorder: 'border-rose-900/40 hover:border-rose-700/60',
    cardBg: 'bg-rose-950/10',
    dotColor: 'bg-rose-400',
    name: 'Conclusions',
  },
};

export function StructuredResults({
  data,
  isLoading,
  loadingMessage,
  error,
}: StructuredResultsProps) {
  const [viewMode, setViewMode] = useState<'cards' | 'structured'>('cards');
  const [expandedDetails, setExpandedDetails] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleExpand = (idx: number) => {
    setExpandedDetails((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleCopyMarkdown = () => {
    if (!data || !data.results) return;

    // Group by label in order
    const orderedLabels = ['BACKGROUND', 'OBJECTIVE', 'METHODS', 'RESULTS', 'CONCLUSIONS'];
    const grouped: Record<string, string[]> = {};
    orderedLabels.forEach((l) => (grouped[l] = []));

    data.results.forEach((item) => {
      const lbl = item.predictedLabel.toUpperCase();
      if (!grouped[lbl]) grouped[lbl] = [];
      grouped[lbl].push(item.text);
    });

    let markdown = `# Structured Abstract (PubMed RCT 20k)\n\n`;
    orderedLabels.forEach((label) => {
      if (grouped[label] && grouped[label].length > 0) {
        markdown += `### ${label}\n${grouped[label].join(' ')}\n\n`;
      }
    });

    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-cyan-400">
            <Layers className="w-6 h-6 animate-pulse" />
          </div>
        </div>
        <h3 className="text-base font-semibold text-slate-100 mb-2">
          Classifying RCT Abstract
        </h3>
        <p className="text-xs text-slate-400 max-w-sm">
          {loadingMessage ||
            'Running sequential sentence inference through your fine-tuned BERT model on Hugging Face...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-rose-900/50 rounded-2xl p-6 shadow-xl text-left">
        <div className="flex items-center space-x-2 text-rose-400 mb-3 font-semibold text-sm">
          <span>Inference Error</span>
        </div>
        <div className="bg-rose-950/40 border border-rose-900/60 rounded-xl p-4 text-xs font-mono text-rose-200 break-words">
          {error}
        </div>
        <p className="text-xs text-slate-400 mt-4">
          Tip: Ensure your Hugging Face model repository ID is correct and the model has finished uploading. If private, configure your Hugging Face Access Token.
        </p>
      </div>
    );
  }

  if (!data || !data.results || data.results.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-200 mb-1">
          No Predictions Yet
        </h3>
        <p className="text-xs text-slate-400 max-w-xs">
          Paste an unstructured clinical abstract on the left and click &quot;Classify Abstract&quot; to see sentence-by-sentence predictions.
        </p>
      </div>
    );
  }

  // Calculate stats
  const totalSentences = data.results.length;
  const avgConfidence = (
    (data.results.reduce((acc, curr) => acc + curr.confidence, 0) / totalSentences) *
    100
  ).toFixed(1);

  // Grouped structured data
  const orderedLabels = ['BACKGROUND', 'OBJECTIVE', 'METHODS', 'RESULTS', 'CONCLUSIONS'];
  const groupedSentences: Record<string, SentencePrediction[]> = {};
  orderedLabels.forEach((l) => (groupedSentences[l] = []));
  data.results.forEach((s) => {
    const lbl = s.predictedLabel.toUpperCase();
    if (!groupedSentences[lbl]) groupedSentences[lbl] = [];
    groupedSentences[lbl].push(s);
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      {/* Header with Stats and Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
              Classification Results
            </h2>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{data.latencyMs} ms</span>
            </span>
            <span>•</span>
            <span>
              Avg Confidence: <strong className="text-emerald-400">{avgConfidence}%</strong>
            </span>
            <span>•</span>
            <span>
              Sentences: <strong className="text-slate-200">{totalSentences}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-950 border border-slate-800 p-0.5 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1 ${
                viewMode === 'cards'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sentences</span>
            </button>
            <button
              onClick={() => setViewMode('structured')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1 ${
                viewMode === 'structured'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Structured Paper</span>
            </button>
          </div>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors shadow-sm"
            title="Copy structured abstract to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content based on View Mode */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[580px]">
        {viewMode === 'cards' ? (
          /* Sequential Sentence Cards */
          data.results.map((item, idx) => {
            const theme = LABEL_THEMES[item.predictedLabel.toUpperCase()] || {
              badgeBg: 'bg-slate-800',
              badgeBorder: 'border-slate-700',
              badgeText: 'text-slate-300',
              cardBorder: 'border-slate-800',
              cardBg: 'bg-slate-900',
              dotColor: 'bg-slate-400',
              name: item.predictedLabel,
            };

            const isExpanded = !!expandedDetails[idx];
            const confPercent = (item.confidence * 100).toFixed(1);

            return (
              <div
                key={idx}
                className={`border rounded-xl p-3.5 transition-all ${theme.cardBg} ${theme.cardBorder}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                      #{item.sentenceNumber}
                    </span>
                    <span
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
                      <span>{theme.name}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                      {confPercent}%
                    </span>
                    {item.allScores && item.allScores.length > 1 && (
                      <button
                        onClick={() => toggleExpand(idx)}
                        className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
                        title="Toggle probabilities"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {item.text}
                </p>

                {/* Probability Distribution Bar when expanded */}
                {isExpanded && item.allScores && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 animate-fadeIn">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                      <BarChart2 className="w-3 h-3 text-cyan-400" />
                      <span>Confidence Distribution:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                      {item.allScores.map((score, sIdx) => {
                        const sTheme = LABEL_THEMES[score.label] || {
                          badgeText: 'text-slate-300',
                          dotColor: 'bg-slate-400',
                        };
                        const sPercent = (score.score * 100).toFixed(1);
                        return (
                          <div
                            key={sIdx}
                            className="bg-slate-950/80 p-1.5 rounded-lg border border-slate-800/60 flex items-center justify-between text-[11px]"
                          >
                            <span className={`font-semibold flex items-center space-x-1.5 ${sTheme.badgeText}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sTheme.dotColor}`} />
                              <span>{score.label}</span>
                            </span>
                            <span className="font-mono text-slate-300">{sPercent}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          /* Structured Document View */
          <div className="space-y-4 bg-slate-950/80 border border-slate-800 rounded-xl p-5">
            {orderedLabels.map((labelKey) => {
              const list = groupedSentences[labelKey];
              if (!list || list.length === 0) return null;

              const theme = LABEL_THEMES[labelKey];

              return (
                <div key={labelKey} className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
                      <span>{labelKey}</span>
                    </span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed pl-1">
                    {list.map((item) => item.text).join(' ')}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
