import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import IntelligentStudio from './components/IntelligentStudio';
import ModelArena from './components/ModelArena';
import CreativeEditor from './components/CreativeEditor';
import TemplateGallery from './components/TemplateGallery';
import MediaLibrary from './components/MediaLibrary';
import AdminAnalytics from './components/AdminAnalytics';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('studio');
  const [editorInitialImage, setEditorInitialImage] = useState(null);
  
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  // Cross-module routing: when user clicks "Open in Editor" from Studio, Arena, or Library
  const handleSendToEditor = (imageUrl) => {
    setEditorInitialImage(imageUrl);
    setActiveTab('editor');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenAuth={() => setAuthOpen(true)}
        />

        {/* Dynamic Workspace Tabs */}
        <main className="flex-1 pb-16">
          {activeTab === 'studio' && (
            <IntelligentStudio onSendToEditor={handleSendToEditor} />
          )}
          {activeTab === 'arena' && (
            <ModelArena onSendToEditor={handleSendToEditor} />
          )}
          {activeTab === 'editor' && (
            <CreativeEditor initialImage={editorInitialImage} />
          )}
          {activeTab === 'templates' && (
            <TemplateGallery onSendToEditor={handleSendToEditor} />
          )}
          {activeTab === 'library' && (
            <MediaLibrary onSendToEditor={handleSendToEditor} />
          )}
          {activeTab === 'analytics' && (
            <AdminAnalytics />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-studio-950/60 py-6 text-xs text-slate-500 font-mono">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-slate-300 font-semibold font-sans">GoStudio AI</span>
              <span>— Full Stack Portfolio Project</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>FastAPI</span>
              <span>•</span>
              <span>React + Tailwind</span>
              <span>•</span>
              <span>Autonomous Agent</span>
              <span>•</span>
              <span>Pillow / OpenCV</span>
              <span>•</span>
              <span>JWT Auth</span>
            </div>
          </div>
        </footer>

        {/* Modals */}
        <SettingsModal
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
        />
      </div>
    </AuthProvider>
  );
}
