'use client';

import React from 'react';
import { Activity, Settings2, BookOpen } from 'lucide-react';

interface HeaderProps {
  modelId: string;
  onOpenSettings: () => void;
}

export function Header({ modelId, onOpenSettings }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">
                PubMed RCT Classifier
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                BERT-Base
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Sequential Sentence Classification on PubMed 20k RCT
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Prominent Configure Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-cyan-200 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 rounded-xl transition-all shadow-sm shadow-cyan-950 hover:scale-[1.02] active:scale-[0.98]"
            title="Configure your Model ID or Hugging Face Space URL"
          >
            <Settings2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>⚙️ Configure Model API</span>
          </button>

          <a
            href="https://github.com/Franck-Dernoncourt/pubmed-rct"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dataset Info</span>
          </a>
        </div>
      </div>
    </header>
  );
}
