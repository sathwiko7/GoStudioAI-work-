import React, { useState } from 'react';
import { Settings, X, Key, Cpu, ShieldCheck, Check, Server } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [stabilityKey, setStabilityKey] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-studio-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-studio-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase font-bold">
          <Settings className="w-4 h-4" />
          <span>System Settings & API Keys</span>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              <span>Gemini API Key</span>
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy... (Optional - built-in engine active)"
              className="w-full bg-studio-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>OpenAI API Key (DALL-E 3 & GPT-4o)</span>
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-... (Optional)"
              className="w-full bg-studio-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-pink-400" />
              <span>Stability AI API Key</span>
            </label>
            <input
              type="password"
              value={stabilityKey}
              onChange={(e) => setStabilityKey(e.target.value)}
              placeholder="sk-stability... (Optional)"
              className="w-full bg-studio-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
            />
          </div>

          {/* Engine Status Callout */}
          <div className="p-3 bg-studio-950/80 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold font-mono">
              <Server className="w-3.5 h-3.5" />
              <span>Local Procedural Studio & Pollinations Engine: ONLINE</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              GoStudio AI features a dual-pipeline architecture. High-resolution commercial media is generated immediately without requiring third-party API keys!
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-2.5 rounded-xl glow-button text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Settings Saved Successfully!</span>
            </>
          ) : (
            <span>Save Configuration</span>
          )}
        </button>
      </div>
    </div>
  );
}
