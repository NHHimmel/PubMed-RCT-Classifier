'use client';

import React from 'react';
import { Play, RotateCcw, Sparkles, FileText, SplitSquareVertical, Loader2 } from 'lucide-react';
import { SAMPLE_ABSTRACTS } from '@/lib/sample-abstracts';
import { SampleAbstract } from '@/lib/types';

interface AbstractInputProps {
  rawText: string;
  onChangeText: (text: string) => void;
  sentenceCount: number;
  isLoading: boolean;
  onClassify: () => void;
  onSelectSample: (sample: SampleAbstract) => void;
  onClear: () => void;
}

export function AbstractInput({
  rawText,
  onChangeText,
  sentenceCount,
  isLoading,
  onClassify,
  onSelectSample,
  onClear,
}: AbstractInputProps) {
  const wordCount = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
            Clinical Abstract Input
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {rawText.trim() && (
            <button
              onClick={onClear}
              disabled={isLoading}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Preset sample buttons */}
      <div className="mb-4">
        <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Quick Samples from RCT Literature:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_ABSTRACTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              disabled={isLoading}
              className="text-xs bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <span className="font-semibold text-cyan-400 block text-[11px]">
                {sample.category}
              </span>
              <span className="text-slate-200 font-medium text-xs truncate max-w-[200px] block">
                {sample.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Text Area */}
      <div className="relative flex-1 flex flex-col min-h-[260px]">
        <textarea
          value={rawText}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder="Paste unstructured PubMed RCT abstract here, or select a sample above..."
          disabled={isLoading}
          className="w-full flex-1 bg-slate-950/80 border border-slate-800 focus:border-cyan-500 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed font-sans transition-colors"
        />

        <div className="flex items-center justify-between text-xs text-slate-400 mt-2 px-1">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <SplitSquareVertical className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                Detected Sentences:{' '}
                <strong className="text-slate-200">{sentenceCount}</strong>
              </span>
            </span>
            <span>
              Words: <strong className="text-slate-200">{wordCount}</strong>
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Sequential classification
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-end">
        <button
          onClick={onClassify}
          disabled={isLoading || !rawText.trim()}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-cyan-500/20 disabled:shadow-none transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-200" />
              <span>Analyzing with BERT...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Classify Abstract ({sentenceCount} sentences)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
