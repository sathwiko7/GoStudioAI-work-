import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Sparkles, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Layers, 
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function AdminAnalytics() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalyticsOverview()
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono">Aggregating PostgreSQL telemetry & model expenditure...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs uppercase tracking-widest font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Module 10 — Admin Telemetry & Executive Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            System Operations & Usage Analytics
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time telemetry monitoring API costs, model allocation share, system latency benchmarks, and generation throughput.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Role Verified: {user?.role?.toUpperCase()}</span>
        </div>
      </div>

      {/* KPI Stat Cards (5 metrics from blueprint) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Users */}
        <div className="glass-panel p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Registered Users</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{data.total_users}</div>
          <div className="text-[10px] text-emerald-400 flex items-center font-mono">
            <TrendingUp className="w-3 h-3 mr-1" />
            <span>Active workspaces</span>
          </div>
        </div>

        {/* Total Generations */}
        <div className="glass-panel p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Generations</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight">{data.total_generations}</div>
          <div className="text-[10px] text-indigo-400 flex items-center font-mono">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            <span>+18% this week</span>
          </div>
        </div>

        {/* API Expenditure */}
        <div className="glass-panel p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Est. API Spend</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 tracking-tight">
            ${data.total_expenditure_usd.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            <span>Average: $0.005 / op</span>
          </div>
        </div>

        {/* Average Latency */}
        <div className="glass-panel p-4 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Average Latency</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-extrabold text-white tracking-tight font-mono">
            {data.avg_latency_sec}s
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            <span>Sub-3s SLA target</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="glass-panel p-4 rounded-2xl space-y-2 col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 tracking-tight font-mono">
            {data.success_rate_percent}%
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            <span>0.6% transient retry</span>
          </div>
        </div>
      </div>

      {/* Analytics Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Daily Generation Volume (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Daily Generation Volume & Spend Trend</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">Past 7 Days</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {data.daily_trend.map((d, idx) => {
              const maxVal = Math.max(...data.daily_trend.map(x => x.generations)) || 1;
              const heightPercent = Math.max(15, Math.round((d.generations / maxVal) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.generations}
                  </span>
                  <div className="w-full bg-studio-950 rounded-t-lg overflow-hidden flex items-end h-32">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-gradient-to-t from-indigo-600 via-purple-600 to-pink-500 rounded-t-lg transition-all duration-500 group-hover:brightness-125 shadow-lg shadow-indigo-500/20"
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{d.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Model Share Breakdown (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Model Allocation & Cost Share</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">By Invocations</span>
          </div>

          <div className="space-y-3">
            {data.model_usage_breakdown.map((m, idx) => {
              const totalInvocations = data.model_usage_breakdown.reduce((acc, curr) => acc + curr.count, 0) || 1;
              const share = Math.round((m.count / totalInvocations) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-200 font-semibold">{m.model_id}</span>
                    <span className="text-slate-400">
                      {m.count} runs ({share}%) • <span className="text-emerald-400">${m.cost.toFixed(3)}</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-studio-950 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${share}%` }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Generations Activity Stream Table */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Live Generation Telemetry Stream</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Audit Trail</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500">
                <th className="pb-2">TASK TYPE</th>
                <th className="pb-2">PROMPT SNIPPET</th>
                <th className="pb-2">AI ENGINE</th>
                <th className="pb-2">LATENCY</th>
                <th className="pb-2">COST ($)</th>
                <th className="pb-2">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.recent_activity.map((act) => (
                <tr key={act.id} className="text-slate-300 hover:bg-slate-800/40 transition">
                  <td className="py-2.5 text-indigo-400 font-semibold">{act.task}</td>
                  <td className="py-2.5 text-slate-200 truncate max-w-[220px] font-sans">{act.prompt}</td>
                  <td className="py-2.5 text-purple-300">{act.model || 'flux-1'}</td>
                  <td className="py-2.5 text-slate-400">{act.latency}s</td>
                  <td className="py-2.5 text-emerald-400">${(act.cost || 0.003).toFixed(3)}</td>
                  <td className="py-2.5 text-slate-500">{act.time.split('T')[0]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
