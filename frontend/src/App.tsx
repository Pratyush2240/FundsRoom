import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
  Server,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { Role } from './types/auth';

interface HealthData {
  status: string;
  message: string;
  timestamp: string;
  uptime: number;
  environment: string;
  database?: string;
}

const PortalLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[] },
    { id: 'customers', label: 'Customer CRM', icon: Users, roles: ['ADMIN', 'SALES'] as Role[], badge: 'Step 2' },
    { id: 'inventory', label: 'Products & Stock', icon: Package, roles: ['ADMIN', 'WAREHOUSE'] as Role[], badge: 'Step 3' },
    { id: 'challans', label: 'Sales Challans', icon: FileSpreadsheet, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] as Role[], badge: 'Step 4' },
  ];

  const allowedNavItems = allNavItems.filter((item) => user && item.roles.includes(user.role));

  const roleColors: Record<Role, string> = {
    ADMIN: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    SALES: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    WAREHOUSE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    ACCOUNTS: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 tracking-tight text-lg leading-tight">Apex ERP</h1>
              <span className="text-xs text-indigo-400 font-medium">Wholesale Ops Portal</span>
            </div>
          </div>

          {/* User Profile Card */}
          {user && (
            <div className="p-4 mx-3 my-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="truncate">
                  <h4 className="text-xs font-semibold text-slate-200 truncate">{user.name}</h4>
                  <span className={`inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-md border mt-0.5 ${roleColors[user.role]}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {allowedNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
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
                    <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50 space-y-2">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 rounded-xl transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-100 capitalize">
              {allNavItems.find((i) => i.id === activeTab)?.label || 'Dashboard'}
            </h2>
            <span className="text-xs bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2.5 py-0.5 rounded-full font-medium">
              Role: {user?.role}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={checkHealth}
              disabled={loading}
              className="flex items-center gap-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Check System Health
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-6xl mx-auto w-full space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <h3 className="text-xl font-bold text-white">Welcome back, {user?.name}!</h3>
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                Step 3 Auth & Role-Based Access Control (RBAC) active. Logged in as <span className="font-semibold text-indigo-400">{user?.role}</span> ({user?.email}).
              </p>
            </div>
          </div>

          {/* System Health Status Card */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                  <Activity className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-100">Backend Server & Database Status</h4>
                  <p className="text-xs text-slate-400">Endpoint: GET /api/health</p>
                </div>
              </div>

              {loading ? (
                <span className="flex items-center gap-2 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking...
                </span>
              ) : health ? (
                <span className="flex items-center gap-2 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Systems Online
                </span>
              ) : (
                <span className="flex items-center gap-2 text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full">
                  <XCircle className="w-3.5 h-3.5" /> Disconnected
                </span>
              )}
            </div>

            {health && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-slate-400 font-medium block mb-1">API Status</span>
                  <span className="text-sm font-semibold text-emerald-400 capitalize">{health.status}</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-slate-400 font-medium block mb-1">PostgreSQL DB</span>
                  <span className="text-sm font-semibold text-indigo-400 capitalize">{health.database || 'Connected'}</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Uptime</span>
                  <span className="text-sm font-semibold text-slate-200">{Math.floor(health.uptime)} seconds</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-slate-400 font-medium block mb-1">Environment</span>
                  <span className="text-xs font-semibold text-slate-300 capitalize">{health.environment}</span>
                </div>
              </div>
            )}
          </div>

          {/* Module Placeholder Card */}
          {activeTab !== 'dashboard' && (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-3">
              <h4 className="text-base font-semibold text-slate-200">
                {allNavItems.find((i) => i.id === activeTab)?.label} Module
              </h4>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Authorized for role <span className="text-indigo-400 font-semibold">{user?.role}</span>. Core CRUD and transaction features for this module are ready for implementation in the next step.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<PortalLayout />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
