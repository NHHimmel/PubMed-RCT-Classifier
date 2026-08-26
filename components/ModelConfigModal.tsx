'use client';

import React, { useState } from 'react';
import { X, Key, Globe, Info, Check, Shield, Server } from 'lucide-react';

interface ModelConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModelId: string;
  currentHfToken: string;
  onSave: (modelId: string, hfToken: string) => void;
}

export function ModelConfigModal({
  isOpen,
  onClose,
  currentModelId,
  currentHfToken,
  onSave,
}: ModelConfigModalProps) {
  const [modelId, setModelId] = useState(currentModelId);
  const [hfToken, setHfToken] = useState(currentHfToken);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(modelId.trim(), hfToken.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700 flex items-center justify-center text-cyan-400 shadow-md">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              Model Backend Configuration
            </h3>
            <p className="text-xs text-slate-400">
              Connect your Hugging Face Space URL or Model Repository
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Hugging Face Space URL or Model ID</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold uppercase">Required</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                placeholder="https://himux-pubmed-rct-api.hf.space"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Enter your Space URL (e.g. <code className="text-cyan-300">https://himux-pubmed-rct-api.hf.space</code>) or Model ID (<code className="text-cyan-300">HimuX/model-name</code>)
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>Hugging Face Token</span>
              </span>
              <span className="text-[10px] text-slate-400">Optional</span>
            </label>
            <div className="relative">
              <input
                type="password"
                value={hfToken}
                onChange={(e) => setHfToken(e.target.value)}
                placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
              <Shield className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Only needed if your Space or Model is set to Private.</span>
            </p>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 flex space-x-2.5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              This is stored in your browser session, or you can set <code className="text-slate-200">NEXT_PUBLIC_DEFAULT_MODEL_ID</code> in <code className="text-slate-200">.env.local</code> / Vercel Environment Variables.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-md shadow-cyan-600/20 transition-all"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Configuration</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
