import React, { useState } from 'react';
import { 
  Layers, 
  Sparkles, 
  Check, 
  Clock, 
  DollarSign, 
  Star, 
  ArrowRightLeft, 
  TrendingDown, 
  Maximize2,
  RefreshCw,
  Award
} from 'lucide-react';
import { api } from '../services/api';

const AVAILABLE_ARENA_MODELS = [
  { id: 'flux-1-schnell', name: 'FLUX.1 [schnell]', provider: 'Black Forest Labs', cost: 0.003, speed: 2.6, score: 9.6, badge: 'Fastest & Sharp' },
  { id: 'sd-3.5-large', name: 'Stable Diffusion 3.5 Large', provider: 'Stability AI', cost: 0.006, speed: 3.4, score: 9.4, badge: 'High Fidelity' },
  { id: 'midjourney-v6', name: 'Midjourney v6.1 Ultra', provider: 'Midjourney API', cost: 0.009, speed: 4.1, score: 9.8, badge: 'Cinematic Aesthetic' },
  { id: 'dall-e-3', name: 'OpenAI DALL-E 3', provider: 'OpenAI', cost: 0.040, speed: 5.2, score: 9.5, badge: 'Prompt Adherence' },
  { id: 'playground-v2.5', name: 'Playground v2.5', provider: 'Playground AI', cost: 0.002, speed: 2.1, score: 9.1, badge: 'Budget Champion' },
];

export default function ModelArena({ onSendToEditor }) {
  const [prompt, setPrompt] = useState('Hyper-realistic commercial shot of a luxury chronograph watch on wet black obsidian rock with warm golden hour backlighting');
  const [selectedModels, setSelectedModels] = useState(['flux-1-schnell', 'sd-3.5-large', 'midjourney-v6']);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(50); // For A/B slider

  const toggleModel = (id) => {
    if (selectedModels.includes(id)) {
      if (selectedModels.length > 2) {
        setSelectedModels(selectedModels.filter(m => m !== id));
      } else {
        alert('Please select at least 2 models for side-by-side comparison.');
      }
    } else {
      if (selectedModels.length < 3) {
        setSelectedModels([...selectedModels, id]);
      } else {
        alert('You can compare up to 3 models simultaneously in the Arena.');
      }
    }
  };

  const handleRunComparison = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const data = await api.compareModels({
        prompt,
        model_ids: selectedModels,
        aspect_ratio: '1:1',
        style: 'hyper-realistic'
      });
      setResults(data.results);
    } catch (err) {
      alert(`Error comparing models: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs uppercase tracking-widest font-semibold mb-1">
          <Layers className="w-3.5 h-3.5" />
          <span>Module 6 — AI Model Selection, Evaluation & Arena</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Multi-Model Comparison Arena
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          Evaluate AI models with transparent criteria: generation latency, cost per asset ($), and visual fidelity score. Compare 2–3 generative engines side-by-side with identical prompt instructions.
        </p>
      </div>

      {/* Control Panel */}
      <div className="glass-panel p-6 rounded-2xl space-y-6">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Shared Evaluation Prompt
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 bg-studio-950/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="Enter comparison prompt..."
            />
            <button
              onClick={handleRunComparison}
              disabled={loading}
              className="px-6 py-3 rounded-xl glow-button text-white font-semibold text-sm flex items-center justify-center space-x-2 shrink-0 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Benchmarking Models...</span>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4 text-white" />
                  <span>Run Side-by-Side Arena</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Model Selection Pills */}
        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-2">
            Select 2 to 3 Models to Benchmark:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {AVAILABLE_ARENA_MODELS.map((m) => {
              const isSelected = selectedModels.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => toggleModel(m.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-purple-600/20 border-purple-500 shadow-md shadow-purple-600/10'
                      : 'bg-studio-950/70 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{m.name}</span>
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center ${isSelected ? 'bg-purple-500 text-white' : 'border border-slate-700'}`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">{m.provider}</div>
                  <div className="flex items-center justify-between text-[11px] font-mono mt-2 pt-2 border-t border-slate-800/80">
                    <span className="text-emerald-400">${m.cost.toFixed(3)}</span>
                    <span className="text-slate-400">{m.speed}s</span>
                    <span className="text-amber-400 flex items-center space-x-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      <span>{m.score}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison Results Grid */}
      {results && results.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span>Side-by-Side Generation Results</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">
              Evaluated concurrently across {results.length} engines
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((res, idx) => (
              <div key={res.model_id} className="glass-panel rounded-2xl overflow-hidden border-slate-800 flex flex-col">
                {/* Header Badge */}
                <div className="p-4 bg-studio-950/80 border-b border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{res.model_name}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{res.provider}</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {res.badge}
                  </span>
                </div>

                {/* Image */}
                <div className="relative aspect-square bg-studio-950 flex items-center justify-center overflow-hidden group">
                  <img
                    src={res.media_url}
                    alt={res.model_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-studio-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                    <button
                      onClick={() => onSendToEditor(res.media_url)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg transition"
                    >
                      Open in Editor
                    </button>
                    <a
                      href={res.media_url}
                      download={`arena_${res.model_id}.jpg`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                    >
                      Download
                    </a>
                  </div>
                </div>

                {/* Scorecard Table */}
                <div className="p-4 bg-studio-900/60 border-t border-slate-800/80 space-y-2 mt-auto">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Latency (Speed)</span>
                    </span>
                    <span className="font-mono font-bold text-slate-200">{res.latency}s</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center space-x-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Cost per Generation</span>
                    </span>
                    <span className="font-mono font-bold text-emerald-400">${res.estimated_cost.toFixed(3)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center space-x-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      <span>Aesthetic Quality Rating</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400">{res.quality_score} / 10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cost Optimization Analysis Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-studio-900 to-indigo-950/40 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-300">Cost Optimization Recommendation</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  FLUX.1 [schnell] delivers 9.6/10 aesthetic quality at <strong>$0.003/image</strong>, resulting in a <strong>92.5% cost reduction</strong> compared to DALL-E 3 ($0.040/image) for high-volume catalog production!
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Annual Savings: ~$4,440 / 100k renders
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
