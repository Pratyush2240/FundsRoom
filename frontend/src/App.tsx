import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileSpreadsheet, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Building2,
  ShieldCheck,
  Server
} from 'lucide-react';

interface HealthData {
  status: string;
  message: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

export default function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setHealth(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to connect to backend server');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customer CRM', icon: Users, badge: 'Step 2' },
    { id: 'inventory', label: 'Products & Stock', icon: Package, badge: 'Step 3' },
    { id: 'challans', label: 'Sales Challans', icon: FileSpreadsheet, badge: 'Step 4' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* Brand Logo */}
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 tracking-tight text-lg leading-tight">Apex ERP</h1>
              <span className="text-xs text-indigo-400 font-medium">Wholesale Ops Portal</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Role: Admin Demo</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
        {/* Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-100 capitalize">
              {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h2>
            <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2.5 py-0.5 rounded-full font-medium">
              MVP Step 1 Ready
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={checkHealth}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Check API Health
            </button>
            <div className="flex items-center gap-2 text-xs px-3 py-1.5 bg-slate-800/80 rounded-lg border border-slate-700 text-slate-300">
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>API: {API_BASE_URL}</span>
            </div>
          </div>
        </header>

        {/* Dashboard / Status View */}
        <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Welcome Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <h3 className="text-xl font-bold text-white">Mini ERP + CRM Operations Portal Shell</h3>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Step 1: Workspace inspect, monorepo structure creation, Express backend, Vite React frontend, Tailwind CSS styling, environment variables setup, and health check API setup complete.
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* System Health Status Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                  <Activity className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100">Backend Server Health</h4>
                  <p className="text-xs text-slate-400">Endpoint: GET /api/health</p>
                </div>
              </div>

              {loading ? (
                <span className="flex items-center gap-2 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Ping API...
                </span>
              ) : health ? (
                <span className="flex items-center gap-2 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Backend Online
                </span>
              ) : (
                <span className="flex items-center gap-2 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full">
                  <XCircle className="w-3.5 h-3.5" /> Connection Failed
                </span>
              )}
            </div>

            {error && (
              <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-300 text-sm flex items-start gap-3">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Unable to connect to backend API</p>
                  <p className="text-xs text-rose-300/80 mt-0.5">{error}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    Make sure backend server is running on <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">http://localhost:5000</code>.
                  </p>
                </div>
              </div>
            )}

            {health && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Status</span>
                  <span className="text-sm font-semibold text-emerald-400 capitalize">{health.status}</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Uptime</span>
                  <span className="text-sm font-semibold text-slate-200">{Math.floor(health.uptime)} seconds</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Environment</span>
                  <span className="text-sm font-semibold text-indigo-300 capitalize">{health.environment}</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Last Sync</span>
                  <span className="text-xs font-semibold text-slate-300">{new Date(health.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Module Placeholder Notice */}
          {activeTab !== 'dashboard' && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
              <h4 className="text-base font-semibold text-slate-200">
                {navItems.find(i => i.id === activeTab)?.label} Module
              </h4>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                This module will be implemented in subsequent steps per the development roadmap. Base layout and API integration pipeline are fully configured.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
