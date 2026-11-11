import React, { useState, useEffect } from 'react';
import { 
  LayoutTemplate, 
  Sparkles, 
  ArrowRight, 
  Check, 
  X, 
  RefreshCw, 
  SlidersHorizontal,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function TemplateGallery({ onSendToEditor }) {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Customization fields
  const [productName, setProductName] = useState('Cyberpunk High-Top Sneaker');
  const [customHeadline, setCustomHeadline] = useState('');
  const [customBadge, setCustomBadge] = useState('');
  const [loading, setLoading] = useState(false);
  const [renderedResult, setRenderedResult] = useState(null);

  useEffect(() => {
    api.getTemplates().then(data => {
      if (data && data.templates) {
        setTemplates(data.templates);
      }
    });
  }, []);

  const openCustomizeModal = (tpl) => {
    setSelectedTemplate(tpl);
    setCustomHeadline(tpl.headline);
    setCustomBadge(tpl.badge);
    setRenderedResult(null);
    setModalOpen(true);
  };

  const handleRenderTemplate = async () => {
    if (!productName.trim() || loading || !selectedTemplate) return;
    setLoading(true);
    try {
      const res = await api.useTemplate({
        template_id: selectedTemplate.template_id,
        product_name: productName,
        headline: customHeadline,
        badge_text: customBadge,
      });
      setRenderedResult(res);
      confetti({ particleCount: 40, spread: 50 });
    } catch (err) {
      alert(`Render error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center space-x-2 text-pink-400 font-mono text-xs uppercase tracking-widest font-semibold mb-1">
          <LayoutTemplate className="w-3.5 h-3.5" />
          <span>Module 7 — Creative Presets & High-Conversion Templates</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Commercial Creative Templates
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Don't start from a blank prompt. Generate studio advertisements, YouTube thumbnails, Instagram reels, and festive launch graphics with tested commercial layouts.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <div 
            key={tpl.template_id}
            className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col group"
          >
            {/* Visual Thumbnail */}
            <div className="relative aspect-[16/10] bg-studio-950 overflow-hidden">
              <img
                src={tpl.thumbnail_url}
                alt={tpl.template_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex items-center space-x-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-studio-950/80 backdrop-blur-md text-white border border-slate-700">
                  {tpl.aspect_ratio}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 backdrop-blur-md text-indigo-300 border border-indigo-500/30 font-semibold">
                  {tpl.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition">
                  {tpl.template_name}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {tpl.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => openCustomizeModal(tpl)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 hover:border-indigo-500 text-xs font-semibold flex items-center justify-center space-x-2 transition cursor-pointer"
              >
                <span>Customize & Render</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customize & Render Modal */}
      {modalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-studio-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-studio-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-bold">
                Template Configuration
              </span>
              <h2 className="text-xl font-bold text-white">{selectedTemplate.template_name}</h2>
              <p className="text-xs text-slate-400 mt-1">{selectedTemplate.description}</p>
            </div>

            {/* Form */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Product / Subject Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Sony WH-1000XM5 Headphone"
                  className="w-full bg-studio-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Headline Text
                  </label>
                  <input
                    type="text"
                    value={customHeadline}
                    onChange={(e) => setCustomHeadline(e.target.value)}
                    className="w-full bg-studio-950 border border-slate-700 rounded-xl p-3 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Badge Callout
                  </label>
                  <input
                    type="text"
                    value={customBadge}
                    onChange={(e) => setCustomBadge(e.target.value)}
                    className="w-full bg-studio-950 border border-slate-700 rounded-xl p-3 text-white font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Action */}
            <button
              onClick={handleRenderTemplate}
              disabled={loading}
              className="w-full py-3.5 rounded-xl glow-button text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Template with GoStudio Engine...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Final Commercial Graphic</span>
                </>
              )}
            </button>

            {/* Rendered Preview */}
            {renderedResult && (
              <div className="p-4 bg-studio-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 font-mono">Render Complete!</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        onSendToEditor(renderedResult.media_url);
                        setModalOpen(false);
                      }}
                      className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                    >
                      Open in Editor
                    </button>
                    <a
                      href={renderedResult.media_url}
                      download="template_asset.jpg"
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Download
                    </a>
                  </div>
                </div>
                <img
                  src={renderedResult.media_url}
                  alt="Rendered Template Output"
                  className="w-full max-h-[350px] object-contain rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
