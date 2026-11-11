import React, { useState, useEffect } from 'react';
import { 
  FolderGit2, 
  Sparkles, 
  Heart, 
  Trash2, 
  Download, 
  SlidersHorizontal, 
  Plus, 
  Clock, 
  DollarSign, 
  Filter,
  Info,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function MediaLibrary({ onSendToEditor }) {
  const [mediaItems, setMediaItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [filterTask, setFilterTask] = useState('');
  
  const [inspectItem, setInspectItem] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const loadData = async () => {
    try {
      const pData = await api.getProjects();
      setProjects(pData.projects || []);
      
      const params = {};
      if (selectedProject) params.project_id = selectedProject;
      if (filterFavorite) params.favorite_only = true;
      if (filterTask) params.task_type = filterTask;
      
      const mData = await api.getMedia(params);
      setMediaItems(mData.media || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProject, filterFavorite, filterTask]);

  const handleToggleFavorite = async (e, mediaId) => {
    e.stopPropagation();
    try {
      await api.toggleFavorite(mediaId);
      setMediaItems(items => items.map(item => 
        item.media_id === mediaId ? { ...item, is_favorite: !item.is_favorite } : item
      ));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e, mediaId) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this media asset?')) return;
    try {
      await api.deleteMedia(mediaId);
      setMediaItems(items => items.filter(i => i.media_id !== mediaId));
      if (inspectItem?.media_id === mediaId) setInspectItem(null);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const res = await api.createProject(newProjectName);
      setProjects([res, ...projects]);
      setSelectedProject(res.project_id);
      setNewProjectName('');
      setShowNewProjectModal(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase tracking-widest font-semibold mb-1">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Module 8 — Workspace Projects & Asset History</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            User Media Library
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your campaigns, inspect generation metadata, favorite high-performing creatives, and export commercial assets.
          </p>
        </div>

        <button
          onClick={() => setShowNewProjectModal(true)}
          className="px-4 py-2.5 rounded-xl glow-button text-white text-xs font-semibold flex items-center space-x-2 shrink-0 shadow-lg cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project Campaign</span>
        </button>
      </div>

      {/* Filter and Project Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Dropdown */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-studio-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="">All Projects & Folders</option>
            {projects.map(p => (
              <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
            ))}
          </select>

          {/* Task Type Filters */}
          <button
            onClick={() => setFilterTask('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              filterTask === '' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-studio-950 border-slate-800 text-slate-400'
            }`}
          >
            All Media ({mediaItems.length})
          </button>
          <button
            onClick={() => setFilterTask('image_generation')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              filterTask === 'image_generation' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-studio-950 border-slate-800 text-slate-400'
            }`}
          >
            Generations
          </button>
          <button
            onClick={() => setFilterTask('background_removal')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              filterTask === 'background_removal' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-studio-950 border-slate-800 text-slate-400'
            }`}
          >
            BG Cutouts
          </button>
          <button
            onClick={() => setFilterTask('template_poster')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
              filterTask === 'template_poster' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-studio-950 border-slate-800 text-slate-400'
            }`}
          >
            Templates
          </button>
        </div>

        {/* Favorite Filter Toggle */}
        <button
          onClick={() => setFilterFavorite(!filterFavorite)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition ${
            filterFavorite
              ? 'bg-pink-500/20 border-pink-500/40 text-pink-400'
              : 'bg-studio-950 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5" fill={filterFavorite ? 'currentColor' : 'none'} />
          <span>Favorites Only</span>
        </button>
      </div>

      {/* Media Grid */}
      {mediaItems.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-3">
          <Sparkles className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">No Media Records Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Generate new images in Intelligent Studio or use Creative Templates to build your library.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {mediaItems.map((item) => (
            <div
              key={item.media_id}
              onClick={() => setInspectItem(item)}
              className="glass-panel glass-panel-hover rounded-2xl overflow-hidden cursor-pointer group relative flex flex-col"
            >
              <div className="relative aspect-square bg-studio-950 overflow-hidden flex items-center justify-center">
                <img
                  src={item.media_url}
                  alt={item.prompt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Top badges */}
                <div className="absolute top-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-studio-950/80 backdrop-blur-md text-white border border-slate-700">
                    {item.aspect_ratio || '1:1'}
                  </span>
                  <button
                    onClick={(e) => handleToggleFavorite(e, item.media_id)}
                    className="p-1 rounded-full bg-studio-950/80 backdrop-blur-md text-pink-400 hover:scale-110 transition"
                  >
                    <Heart className="w-3.5 h-3.5" fill={item.is_favorite ? 'currentColor' : 'none'} />
                  </button>
                </div>

                {/* Bottom Quick Actions */}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-studio-950/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSendToEditor(item.media_url);
                    }}
                    className="p-1 text-slate-300 hover:text-indigo-400 transition"
                    title="Open in Editor"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={item.media_url}
                    download={`library_${item.media_id}.jpg`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 text-slate-300 hover:text-emerald-400 transition"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={(e) => handleDelete(e, item.media_id)}
                    className="p-1 text-slate-300 hover:text-rose-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-studio-900/60 border-t border-slate-800/80 mt-auto">
                <p className="text-[11px] text-slate-300 truncate font-medium">{item.prompt}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>{item.model_id || 'flux-1'}</span>
                  <span>${(item.cost || 0.003).toFixed(3)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Metadata Inspector Drawer / Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 bg-studio-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-studio-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 relative shadow-2xl">
            <button
              onClick={() => setInspectItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-indigo-400 font-mono text-xs uppercase font-bold">
              <Info className="w-4 h-4" />
              <span>Generation Metadata Inspector (Module 8)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="aspect-square bg-studio-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center">
                <img
                  src={inspectItem.media_url}
                  alt={inspectItem.prompt}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-500 font-mono block">ORIGINAL PROMPT</span>
                  <p className="text-slate-200 font-medium mt-0.5">{inspectItem.prompt}</p>
                </div>

                {inspectItem.enhanced_prompt && (
                  <div>
                    <span className="text-slate-500 font-mono block">ENHANCED LLM PROMPT</span>
                    <p className="text-slate-300 font-mono text-[11px] mt-0.5 bg-studio-950 p-2 rounded border border-slate-800 leading-relaxed">
                      {inspectItem.enhanced_prompt}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-studio-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block">MODEL</span>
                    <span className="text-indigo-300">{inspectItem.model_id}</span>
                  </div>
                  <div className="bg-studio-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block">ASPECT RATIO</span>
                    <span className="text-purple-300">{inspectItem.aspect_ratio}</span>
                  </div>
                  <div className="bg-studio-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block">PROCESSING TIME</span>
                    <span className="text-slate-200">{inspectItem.latency}s</span>
                  </div>
                  <div className="bg-studio-950 p-2 rounded border border-slate-800">
                    <span className="text-slate-500 block">EST. COST</span>
                    <span className="text-emerald-400">${(inspectItem.cost || 0.003).toFixed(3)}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onSendToEditor(inspectItem.media_url);
                      setInspectItem(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
                  >
                    Open in Editor
                  </button>
                  <a
                    href={inspectItem.media_url}
                    download="asset.jpg"
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-center border border-slate-700 transition"
                  >
                    Download HD
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 z-50 bg-studio-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-studio-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowNewProjectModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-white">Create New Campaign Folder</h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Project / Campaign Name</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g. Q4 Sneaker Drop"
                className="w-full bg-studio-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={handleCreateProject}
              className="w-full py-2.5 rounded-xl glow-button text-white text-xs font-semibold shadow-lg"
            >
              Create Folder
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
