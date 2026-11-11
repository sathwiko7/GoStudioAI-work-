import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Cpu, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Download, 
  SlidersHorizontal, 
  Heart, 
  Copy, 
  ChevronRight, 
  Wand2, 
  Layers, 
  Maximize2,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

const QUICK_PROMPTS = [
  { label: '👟 Nike Sneaker Ad', prompt: 'Generate a professional advertisement image for a black sports shoe with a premium studio background.' },
  { label: '⌚ Luxury Swiss Watch', prompt: 'Artistic commercial photography of a luxury titanium watch resting on black marble with golden rim light.' },
  { label: '🎧 Cyberpunk Headphone', prompt: 'Futuristic glowing noise-canceling headphones hovering in a neon purple and cyan cyberpunk street.' },
  { label: '🧴 Minimalist Perfume', prompt: 'Elegant luxury crystal perfume bottle on a travertine stone pedestal with warm soft sunlight shadows.' },
  { label: '⚡ Energy Drink Launch', prompt: 'Cold metallic energy drink can splashing through icy neon water droplets with dramatic high-speed lighting.' },
];

const ASPECT_RATIOS = [
  { id: '1:1', label: 'Square 1:1', desc: 'Instagram, Feed' },
  { id: '16:9', label: 'Landscape 16:9', desc: 'YouTube, Web' },
  { id: '9:16', label: 'Story 9:16', desc: 'Reels, TikTok' },
  { id: '4:5', label: 'Portrait 4:5', desc: 'Social Promo' },
  { id: '3:2', label: 'Classic 3:2', desc: 'Photography' },
];

const STYLES = [
  'Cinematic Studio',
  'Cyberpunk Neon Glow',
  'Minimalist Commercial',
  'Hyper-Realistic Photo',
  'Luxury Editorial',
  '3D Isometric Clay'
];

export default function IntelligentStudio({ onSendToEditor }) {
  const [prompt, setPrompt] = useState('Generate a professional advertisement image for a black sports shoe with a premium studio background.');
  const [selectedModel, setSelectedModel] = useState('flux-1-schnell');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState('Cinematic Studio');
  
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [agentResponse, setAgentResponse] = useState(null);
  const [analyzingPrompt, setAnalyzingPrompt] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Auto-analyze prompt with Module 2 on blur or click
  const handleAnalyzePrompt = async () => {
    if (!prompt.trim()) return;
    setAnalyzingPrompt(true);
    try {
      const plan = await api.understandPrompt(prompt);
      setActivePlan(plan);
      if (plan.aspect_ratio) setSelectedRatio(plan.aspect_ratio);
      if (plan.recommended_model) setSelectedModel(plan.recommended_model);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzingPrompt(false);
    }
  };

  // Main Intelligent Agent Execution
  const handleExecute = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setStatusMessage('Intelligent Agent decomposing prompt and planning tool selection...');
    
    try {
      const res = await api.executeAgent({
        prompt,
        model_id: selectedModel,
        aspect_ratio: selectedRatio,
        style: selectedStyle
      });
      
      setAgentResponse(res);
      setActivePlan(res.structured_plan);
      setIsFavorite(false);
      
      // Trigger joyful confetti on generation success!
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(agentResponse?.enhanced_prompt || prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-widest font-semibold mb-1">
            <Cpu className="w-3.5 h-3.5" />
            <span>Autonomous Tool-Routing Agent • Modules 2, 3, 4</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Intelligent AI Creative Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Type natural language instructions. The AI Agent semantically parses your intent, selects the verified tool, allocates the optimal model, and generates studio-grade commercial media.
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-3 bg-studio-900/90 border border-slate-800 px-4 py-2 rounded-2xl">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-xs">
            <span className="text-slate-200 font-semibold">Agent Engine: </span>
            <span className="text-emerald-400 font-mono">Active & Ready</span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Prompt Input, Agent Settings, Structured Plan (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Natural Language Prompt Box */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Natural-Language Prompt Instruction</span>
              </label>
              <button
                onClick={handleAnalyzePrompt}
                disabled={analyzingPrompt}
                className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 transition"
              >
                <Sparkles className="w-3 h-3" />
                <span>{analyzingPrompt ? 'Analyzing...' : 'Parse JSON Plan'}</span>
              </button>
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="e.g. Generate a professional advertisement image for a black sports shoe with a premium studio background."
                className="w-full bg-studio-950/90 border border-slate-700/80 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition resize-none font-sans"
              />
            </div>

            {/* Quick Inspiration Pills */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium">Quick Inspiration:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(p.prompt);
                      setActivePlan(null);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/20 hover:text-indigo-300 hover:border-indigo-500/30 border border-slate-700/60 text-slate-300 transition"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Model & Aspect Ratio Controls */}
          <div className="glass-panel p-5 rounded-2xl space-y-5">
            {/* Model Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Generative Model (Module 6)</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">Multi-Engine</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'flux-1-schnell', name: 'FLUX.1 [schnell]', provider: 'BFL', cost: '$0.003', speed: '2.6s', badge: 'Fastest' },
                  { id: 'sd-3.5-large', name: 'SD 3.5 Large', provider: 'Stability', cost: '$0.006', speed: '3.4s', badge: 'High-Res' },
                  { id: 'midjourney-v6', name: 'Midjourney v6.1', provider: 'Midjourney', cost: '$0.009', speed: '4.1s', badge: 'Artistic' },
                  { id: 'dall-e-3', name: 'DALL-E 3 HD', provider: 'OpenAI', cost: '$0.040', speed: '5.2s', badge: 'Prompt+' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all relative ${
                      selectedModel === m.id
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-sm shadow-indigo-500/20'
                        : 'bg-studio-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{m.name}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                        {m.badge}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-400 font-mono">
                      <span>{m.cost}</span>
                      <span>•</span>
                      <span>{m.speed}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Aspect Ratio Output
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {ASPECT_RATIOS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRatio(r.id)}
                    className={`p-2 rounded-xl text-center border transition-all ${
                      selectedRatio === r.id
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                        : 'bg-studio-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-mono font-bold">{r.id}</div>
                    <div className="text-[9px] text-slate-500 truncate">{r.desc.split(',')[0]}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Style Preset Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Visual Style Aesthetic
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STYLES.map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStyle(st)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                      selectedStyle === st
                        ? 'bg-indigo-600/20 border-indigo-400 text-indigo-300 font-medium'
                        : 'bg-studio-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Action Execute Button */}
            <button
              onClick={handleExecute}
              disabled={loading}
              className="w-full py-3.5 rounded-xl glow-button text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Agent Executing Workflow...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Dispatch Intelligent AI Agent</span>
                  <ChevronRight className="w-4 h-4 text-white/80" />
                </>
              )}
            </button>
          </div>

          {/* Module 2: Structured Task Plan Schema Card */}
          {activePlan && (
            <div className="glass-panel p-5 rounded-2xl border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-300 font-mono flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Structured Task Plan (Module 2 Schema)</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Confidence: {Math.round(activePlan.confidence_score * 100)}%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-studio-950/80 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-mono">TASK OPERATION</span>
                  <span className="font-semibold text-slate-200">{activePlan.task}</span>
                </div>
                <div className="bg-studio-950/80 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-mono">CATEGORY</span>
                  <span className="font-semibold text-slate-200">{activePlan.category}</span>
                </div>
                <div className="bg-studio-950/80 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-mono">EXTRACTED SUBJECT</span>
                  <span className="font-semibold text-slate-200 truncate block">{activePlan.subject}</span>
                </div>
                <div className="bg-studio-950/80 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block font-mono">TARGET STYLE</span>
                  <span className="font-semibold text-slate-200 truncate block">{activePlan.style}</span>
                </div>
              </div>

              <div className="bg-studio-950/90 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
                <span className="text-indigo-400 font-bold block mb-1">ENHANCED PHOTOGRAPHIC PROMPT:</span>
                <p className="leading-relaxed line-clamp-3 text-slate-400">{activePlan.enhanced_prompt}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Agent Execution Trace + Generated Media Showcase (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Module 3: Live Agent Thought & Routing Trace */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Agent Observable Thought Trace (Module 3)
                </h3>
              </div>
              {agentResponse && (
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <span className="flex items-center space-x-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{agentResponse.latency}s</span>
                  </span>
                  <span className="flex items-center space-x-1 text-slate-400">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>${agentResponse.estimated_cost.toFixed(3)}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Step Pipeline Timeline */}
            <div className="space-y-3">
              {(agentResponse?.steps || [
                { step: 1, title: 'Prompt Understanding & Intent Parsing', description: 'Extracts entities, category, subject, background, lighting specs into Pydantic schema.', status: 'ready', duration_ms: 120 },
                { step: 2, title: 'Tool Routing & Safety Policy Engine', description: 'Matches task intent against allowed tools (diffusion, rembg, compositor, typography).', status: 'ready', duration_ms: 45 },
                { step: 3, title: 'Model Allocation & Calibration', description: 'Selects optimal model based on cost, latency budget, and aesthetic requirements.', status: 'ready', duration_ms: 60 },
                { step: 4, title: 'Execution & Neural Diffusion Pipeline', description: 'Dispatches multi-aspect diffusion render and synthesizes high-res canvas.', status: 'ready', duration_ms: 2200 },
                { step: 5, title: 'Artifact Cataloging & Analytics Logging', description: 'Stores generated media in database, generates static CDN URL, updates metrics.', status: 'ready', duration_ms: 80 },
              ]).map((st) => (
                <div 
                  key={st.step}
                  className="flex items-start space-x-3 p-2.5 rounded-xl bg-studio-950/70 border border-slate-800/90 text-xs transition"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5 border border-indigo-500/30">
                    {st.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{st.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">{st.duration_ms}ms</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{st.description}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>

          {/* Generated Media Result View */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Generated Creative Asset Preview</span>
              </span>
              {agentResponse && (
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    {agentResponse.model_used.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {agentResponse.aspect_ratio}
                  </span>
                </div>
              )}
            </div>

            {/* Media Canvas Frame */}
            <div className="relative group bg-studio-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center min-h-[380px] max-h-[540px]">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500 flex items-center justify-center animate-spin-slow">
                      <Sparkles className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white">Synthesizing Creative Artwork</h4>
                    <p className="text-xs text-slate-400 max-w-xs">{statusMessage || 'Applying neural diffusion, lighting balance and photographic rendering...'}</p>
                  </div>
                  {/* Progress bar shimmer */}
                  <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-shimmer" />
                  </div>
                </div>
              ) : agentResponse ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={agentResponse.media_url}
                    alt="Generated Creative"
                    className="max-h-[520px] w-auto object-contain rounded-xl shadow-2xl"
                  />
                  {/* Floating Action Bar */}
                  <div className="absolute bottom-4 left-4 right-4 p-3 bg-studio-950/80 backdrop-blur-md border border-slate-800/90 rounded-xl flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center space-x-2">
                      <a
                        href={agentResponse.media_url}
                        download={`gostudio_${agentResponse.generation_id}.jpg`}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download HD</span>
                      </a>
                      <button
                        onClick={() => onSendToEditor(agentResponse.media_url)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700 transition"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-purple-400" />
                        <span>Edit in Studio</span>
                      </button>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={handleCopyPrompt}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                        title="Copy Enhanced Prompt"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`p-1.5 rounded-lg border transition ${
                          isFavorite ? 'bg-pink-500/20 border-pink-500/40 text-pink-400' : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}
                        title="Add to Favorites"
                      >
                        <Heart className="w-3.5 h-3.5" fill={isFavorite ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-300">No Asset Generated Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Enter your instruction on the left or select an inspiration pill, then click Dispatch Intelligent AI Agent.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Metrics Bar */}
            {agentResponse && (
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                <div className="bg-studio-950/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">MODEL</span>
                  <span className="text-indigo-300 font-semibold truncate block">{agentResponse.model_used}</span>
                </div>
                <div className="bg-studio-950/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">LATENCY</span>
                  <span className="text-slate-200 font-semibold">{agentResponse.latency}s</span>
                </div>
                <div className="bg-studio-950/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">EST. COST</span>
                  <span className="text-emerald-400 font-semibold">${agentResponse.estimated_cost.toFixed(3)}</span>
                </div>
                <div className="bg-studio-950/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">ASPECT</span>
                  <span className="text-purple-300 font-semibold">{agentResponse.aspect_ratio}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
