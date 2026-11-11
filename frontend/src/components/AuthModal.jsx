import React, { useState } from 'react';
import { User, Lock, Mail, X, ShieldCheck, UserCircle, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { user, login, register, switchRole, logout } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role) => {
    switchRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-studio-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-studio-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">
            {user ? 'Account Profile' : (isRegister ? 'Create GoStudio Account' : 'Sign in to GoStudio')}
          </h2>
          <p className="text-xs text-slate-400">
            {user ? `Signed in as ${user.name}` : 'Module 1 — JWT Authentication & Role-Based Access'}
          </p>
        </div>

        {user ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-studio-950 rounded-xl border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Name</span>
                <span className="text-white font-semibold">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Email</span>
                <span className="text-white font-mono">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Role Privilege</span>
                <span className="text-indigo-400 font-mono uppercase font-bold">{user.role}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-slate-400 block font-semibold">Switch Account Persona:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDemoLogin('admin')}
                  className="py-2 px-3 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 font-semibold flex items-center justify-center space-x-1.5 hover:bg-purple-600/30 transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Persona</span>
                </button>
                <button
                  onClick={() => handleDemoLogin('user')}
                  className="py-2 px-3 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-semibold flex items-center justify-center space-x-1.5 hover:bg-indigo-600/30 transition"
                >
                  <UserCircle className="w-4 h-4" />
                  <span>Creator Persona</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/30 font-semibold transition mt-2"
            >
              Log Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {error && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
                {error}
              </div>
            )}

            {isRegister && (
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-studio-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>
            )}

            <div>
              <label className="text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-studio-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-studio-950 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl glow-button text-white font-semibold shadow-lg"
            >
              {loading ? 'Processing...' : (isRegister ? 'Create Workspace' : 'Sign In')}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-indigo-400 hover:underline"
              >
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
