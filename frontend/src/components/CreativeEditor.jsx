import React, { useState, useRef } from 'react';
import { 
  SlidersHorizontal, 
  Upload, 
  Scissors, 
  Palette, 
  Type, 
  Download, 
  RotateCcw, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Sun, 
  Contrast, 
  Droplet, 
  Zap,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api';

const PRESETS = [
  { id: 'studio_white', name: 'Studio Cyclorama', desc: 'Clean commercial softbox lighting' },
  { id: 'neon_cyberpunk', name: 'Neon Cyberpunk', desc: 'Vibrant purple & cyan ambient lights' },
  { id: 'dark_marble', name: 'Dark Marble & Gold', desc: 'Luxury editorial sleek surface' },
  { id: 'luxury_bokeh', name: 'Sunset Bokeh', desc: 'Warm golden hour atmospheric orbs' },
  { id: 'pastel_gradient', name: 'Pastel Clean', desc: 'Soft modern minimalist backdrop' },
];

export default function CreativeEditor({ initialImage }) {
  const [currentImage, setCurrentImage] = useState(
    initialImage || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1000&auto=format&fit=crop&q=80'
  );
  const [loading, setLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState('');
  
  // Tab within Editor
  const [editorMode, setEditorMode] = useState('bg'); // 'bg', 'adjust', 'typography'
  
  // Background tools
  const [selectedPreset, setSelectedPreset] = useState('studio_white');
  
  // Adjustments
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast] = useState(1.0);
  const [saturation, setSaturation] = useState(1.0);
  const [sharpness, setSharpness] = useState(1.0);
  const [vignette, setVignette] = useState(0.0);
  const [temperature, setTemperature] = useState(0);

  // Typography Overlay
  const [headline, setHeadline] = useState('SUMMER EDITION');
  const [subText, setSubText] = useState('LIMITED RELEASE • SHOP ONLINE');
  const [badgeText, setBadgeText] = useState('40% OFF');
  const [position, setPosition] = useState('bottom');
  const [accentColor, setAccentColor] = useState('#6366f1');

  const fileInputRef = useRef(null);

  // File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setActionStatus('Uploading image to server...');
    try {
      const res = await api.uploadFile(file);
      setCurrentImage(res.media_url);
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setLoading(false);
      setActionStatus('');
    }
  };

  // Remove Background
  const handleRemoveBg = async () => {
    setLoading(true);
    setActionStatus('Generating alpha matte & isolating foreground subject...');
    try {
      const res = await api.removeBackground(currentImage);
      setCurrentImage(res.media_url);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setActionStatus('');
    }
  };

  // Replace Background
  const handleReplaceBg = async () => {
    setLoading(true);
    setActionStatus(`Compositing subject onto ${selectedPreset} backdrop...`);
    try {
      const res = await api.replaceBackground(currentImage, selectedPreset);
      setCurrentImage(res.media_url);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setActionStatus('');
    }
  };

  // Apply Adjustments
  const handleApplyAdjustments = async () => {
    setLoading(true);
    setActionStatus('Applying photographic grade & color adjustments...');
    try {
      const res = await api.adjustImage({
        image_url: currentImage,
        brightness,
        contrast,
        saturation,
        sharpness,
        vignette,
        temperature
      });
      setCurrentImage(res.media_url);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setActionStatus('');
    }
  };

  // Apply Typography Overlay
  const handleApplyOverlay = async () => {
    setLoading(true);
    setActionStatus('Rendering graphic badges and typography scrim...');
    try {
      const res = await api.applyOverlay({
        image_url: currentImage,
        headline_text: headline,
        sub_text: subText,
        badge_text: badgeText,
        position,
        accent_color: accentColor
      });
      setCurrentImage(res.media_url);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
      setActionStatus('');
    }
  };

  const handleResetAdjustments = () => {
    setBrightness(1.0);
    setContrast(1.0);
    setSaturation(1.0);
    setSharpness(1.0);
    setVignette(0.0);
    setTemperature(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-widest font-semibold mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Module 5 — AI Image Editing & Composition</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Creative Studio Canvas Editor
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            1-click background removal, cyclorama stage replacement, precision color grading, and commercial marketing overlays powered by OpenCV & Pillow.
          </p>
        </div>

        {/* Upload Trigger */}
        <div className="flex items-center space-x-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Upload Photo</span>
          </button>
          <a
            href={currentImage}
            download="edited_creative.jpg"
            className="px-4 py-2.5 rounded-xl glow-button text-white text-xs font-semibold flex items-center space-x-2 shadow-lg transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Asset</span>
          </a>
        </div>
      </div>

      {/* Editor Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Canvas View (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-4 rounded-2xl relative">
            <div className="relative aspect-square sm:aspect-[4/3] bg-studio-950/90 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
              {loading && (
                <div className="absolute inset-0 z-20 bg-studio-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                  <span className="text-xs font-mono text-slate-300">{actionStatus}</span>
                </div>
              )}
              {/* Checkerboard background for transparent PNG viewing */}
              <div 
                className="w-full h-full flex items-center justify-center rounded-lg overflow-hidden"
                style={{
                  backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 0)',
                  backgroundSize: '16px 16px'
                }}
              >
                <img
                  src={currentImage}
                  alt="Editor Canvas"
                  className="max-h-full max-w-full object-contain rounded shadow-2xl transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-xs text-slate-400 font-mono px-2">
              <span>CANVAS PREVIEW • GPU ACCELERATED</span>
              <span className="text-indigo-400">Pillow & NumPy Engine</span>
            </div>
          </div>
        </div>

        {/* Right Column: Editing Toolset Tabs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sub-tool navigation tabs */}
          <div className="flex p-1 bg-studio-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setEditorMode('bg')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
                editorMode === 'bg'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Background</span>
            </button>
            <button
              onClick={() => setEditorMode('adjust')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
                editorMode === 'adjust'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Color Grade</span>
            </button>
            <button
              onClick={() => setEditorMode('typography')}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition ${
                editorMode === 'typography'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Typography</span>
            </button>
          </div>

          {/* Mode 1: Background Tools */}
          {editorMode === 'bg' && (
            <div className="glass-panel p-5 rounded-2xl space-y-5">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center space-x-2">
                  <Scissors className="w-4 h-4 text-pink-400" />
                  <span>1-Click Background Removal</span>
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Instantly isolate your subject and export an ultra-clean transparent alpha channel PNG.
                </p>
                <button
                  onClick={handleRemoveBg}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold border border-slate-700 flex items-center justify-center space-x-2 transition cursor-pointer"
                >
                  <Scissors className="w-4 h-4 text-pink-400" />
                  <span>Remove Background (Isolate Subject)</span>
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Background Replacement Stage</span>
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {PRESETS.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPreset(p.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        selectedPreset === p.id
                          ? 'bg-purple-600/20 border-purple-500 shadow-sm'
                          : 'bg-studio-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{p.name}</span>
                        {selectedPreset === p.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.desc}</p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleReplaceBg}
                  disabled={loading}
                  className="w-full py-3 rounded-xl glow-button text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg transition mt-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Composite onto Selected Stage</span>
                </button>
              </div>
            </div>
          )}

          {/* Mode 2: Color Grade Adjustments */}
          {editorMode === 'adjust' && (
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Photographic Controls</span>
                <button
                  onClick={handleResetAdjustments}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Sliders</span>
                </button>
              </div>

              {/* Sliders */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Brightness</span>
                    </span>
                    <span className="font-mono">{brightness}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="1.6"
                    step="0.05"
                    value={brightness}
                    onChange={(e) => setBrightness(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Contrast className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Contrast</span>
                    </span>
                    <span className="font-mono">{contrast}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="1.8"
                    step="0.05"
                    value={contrast}
                    onChange={(e) => setContrast(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Droplet className="w-3.5 h-3.5 text-pink-400" />
                      <span>Saturation</span>
                    </span>
                    <span className="font-mono">{saturation}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="2.0"
                    step="0.05"
                    value={saturation}
                    onChange={(e) => setSaturation(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sharpness</span>
                    </span>
                    <span className="font-mono">{sharpness}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={sharpness}
                    onChange={(e) => setSharpness(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Vignette Depth</span>
                    <span className="font-mono">{Math.round(vignette * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.8"
                    step="0.05"
                    value={vignette}
                    onChange={(e) => setVignette(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Color Temperature</span>
                    <span className="font-mono">{temperature > 0 ? `+${temperature}K` : `${temperature}K`}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="5"
                    value={temperature}
                    onChange={(e) => setTemperature(parseInt(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              <button
                onClick={handleApplyAdjustments}
                disabled={loading}
                className="w-full py-3 rounded-xl glow-button text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg transition mt-4 cursor-pointer"
              >
                <Palette className="w-4 h-4 text-white" />
                <span>Apply Color Adjustments</span>
              </button>
            </div>
          )}

          {/* Mode 3: Marketing Typography & Badges */}
          {editorMode === 'typography' && (
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                Promotional Scrim & Typography
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Main Headline Text</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full bg-studio-950 border border-slate-700 rounded-lg p-2.5 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Secondary Sub-title</label>
                  <input
                    type="text"
                    value={subText}
                    onChange={(e) => setSubText(e.target.value)}
                    className="w-full bg-studio-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Promotional Pill Badge</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full bg-studio-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Placement</label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      className="w-full bg-studio-950 border border-slate-700 rounded-lg p-2 text-white"
                    >
                      <option value="bottom">Bottom Scrim</option>
                      <option value="top">Top Scrim</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Badge Accent Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-xs text-slate-300">{accentColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleApplyOverlay}
                disabled={loading}
                className="w-full py-3 rounded-xl glow-button text-white text-xs font-semibold flex items-center justify-center space-x-2 shadow-lg transition mt-4 cursor-pointer"
              >
                <Type className="w-4 h-4 text-white" />
                <span>Burn Typography & Badges</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
