import React from 'react';
import { 
  Sparkles, 
  Layers, 
  SlidersHorizontal, 
  LayoutTemplate, 
  FolderGit2, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  UserCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onOpenSettings, onOpenAuth }) {
  const { user, switchRole } = useAuth();

  const navItems = [
    { id: 'studio', label: 'Intelligent Studio', icon: Sparkles, badge: 'Agent' },
    { id: 'arena', label: 'Model Arena', icon: Layers, badge: 'Compare' },
    { id: 'editor', label: 'Creative Editor', icon: SlidersHorizontal },
    { id: 'templates', label: 'Templates', icon: LayoutTemplate },
    { id: 'library', label: 'Media Library', icon: FolderGit2 },
    { id: 'analytics', label: 'Admin Analytics', icon: BarChart3, adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-studio-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('studio')}>
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-indigo-500/25 animate-pulse-glow">
            <Sparkles className="w-5 h-5 text-white" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-studio-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                GoStudio<span className="text-indigo-400">.AI</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                v1.0 Pro
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide">Intelligent Media Agent & Studio</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="hidden md:flex items-center space-x-1 p-1 bg-studio-900/90 border border-slate-800/90 rounded-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Role Switcher & User Profile */}
        <div className="flex items-center space-x-3">
          {/* Quick Role Switcher Pill (Great for GoStudio Demo evaluation!) */}
          <div className="hidden sm:flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => switchRole('admin')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all ${
                user?.role === 'admin'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              title="Switch to Admin role to evaluate Module 10"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin</span>
            </button>
            <button
              onClick={() => switchRole('user')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg transition-all ${
                user?.role === 'user'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
              title="Switch to Creator role"
            >
              <UserCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Creator</span>
            </button>
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition"
            title="Configure AI Model Keys & Engine"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Avatar */}
          <div 
            onClick={onOpenAuth}
            className="flex items-center space-x-2 pl-2 border-l border-slate-800 cursor-pointer group"
          >
            <img
              src={user?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
              alt="Avatar"
              className="w-8 h-8 rounded-full ring-2 ring-indigo-500/40 group-hover:ring-indigo-400 transition"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight">{user?.name || "Sathwik"}</p>
              <p className="text-[10px] text-slate-400 font-mono capitalize">{user?.role || "Creator"}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
