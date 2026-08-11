import React, { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, Building2, CheckCircle2, FileSpreadsheet, LayoutDashboard, LogOut, Package, RefreshCw, User as UserIcon, Users, XCircle } from 'lucide-react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomersPage } from './pages/CustomersPage';
import { LoginPage } from './pages/LoginPage';
import { Role } from './types/auth';

const PortalLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activePlaceholder, setActivePlaceholder] = useState('dashboard');
  const [health, setHealth] = useState<{ status: string; database?: string } | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(true);
  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[], path: '/dashboard' },
    { id: 'customers', label: 'Customer CRM', icon: Users, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[], path: '/customers' },
    { id: 'inventory', label: 'Products & Stock', icon: Package, roles: ['ADMIN', 'WAREHOUSE'] as Role[] },
    { id: 'challans', label: 'Sales Challans', icon: FileSpreadsheet, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] as Role[] },
  ];
  const currentId = location.pathname === '/customers' ? 'customers' : activePlaceholder;
  const checkHealth = async () => { setCheckingHealth(true); try { const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'; const response = await axios.get(`${baseUrl}/health`); setHealth(response.data); } catch { setHealth(null); } finally { setCheckingHealth(false); } };
  useEffect(() => { checkHealth(); }, []);
  const title = nav.find((item) => item.id === currentId)?.label || 'Dashboard';
  return <div className="flex h-screen overflow-hidden bg-slate-950 font-sans text-slate-100"><aside className="flex w-64 flex-col justify-between border-r border-slate-800 bg-slate-900"><div><div className="flex items-center gap-3 border-b border-slate-800 p-5"><div className="rounded-xl bg-indigo-600 p-2.5"><Building2 className="h-6 w-6" /></div><div><h1 className="text-lg font-bold">Apex ERP</h1><span className="text-xs text-indigo-400">Wholesale Ops Portal</span></div></div><div className="m-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"><UserIcon className="h-4 w-4 text-indigo-400" /><div className="min-w-0"><p className="truncate text-xs font-semibold">{user?.name}</p><p className="text-[10px] font-medium text-indigo-400">{user?.role}</p></div></div><nav className="space-y-1 p-3">{nav.filter((item) => user && item.roles.includes(user.role)).map((item) => { const Icon = item.icon; const active = currentId === item.id; return <button key={item.id} onClick={() => item.path ? navigate(item.path) : setActivePlaceholder(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium ${active ? 'border border-indigo-500/30 bg-indigo-600/15 text-indigo-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</nav></div><div className="border-t border-slate-800 p-3"><button onClick={() => { logout(); navigate('/login'); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10"><LogOut className="h-3.5 w-3.5" />Sign Out</button></div></aside><main className="flex-1 overflow-y-auto"><header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 backdrop-blur"><div><h2 className="text-base font-semibold">{title}</h2><p className="text-xs text-slate-500">Role: {user?.role}</p></div><button onClick={checkHealth} disabled={checkingHealth} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700 disabled:opacity-50"><RefreshCw className={`h-3.5 w-3.5 ${checkingHealth ? 'animate-spin' : ''}`} />Check System Health</button></header>{location.pathname === '/customers' ? <CustomersPage /> : <Dashboard health={health} checking={checkingHealth} active={currentId} />}</main></div>;
};

const Dashboard: React.FC<{ health: { status: string; database?: string } | null; checking: boolean; active: string }> = ({ health, checking, active }) => <div className="mx-auto max-w-6xl space-y-6 p-8">{active === 'dashboard' ? <><div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-900/40 to-slate-900 p-6"><h3 className="text-xl font-bold">Operations Portal</h3><p className="mt-2 text-sm text-slate-300">Customer CRM is available from the sidebar. Inventory and Challans remain planned modules.</p></div><div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><div className="flex items-center gap-3"><Activity className="h-5 w-5 text-indigo-400" /><div><h4 className="font-semibold">Backend & Database Status</h4><p className="text-xs text-slate-400">GET /api/health</p></div></div><div className="mt-5 flex items-center gap-2 text-sm">{checking ? <RefreshCw className="h-4 w-4 animate-spin text-amber-400" /> : health ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <XCircle className="h-4 w-4 text-rose-400" />}<span>{checking ? 'Checking...' : health ? `API ${health.status}; database ${health.database || 'connected'}` : 'Backend unavailable'}</span></div></div></> : <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center"><h3 className="font-semibold">This module is planned for a later stage.</h3><p className="mt-2 text-sm text-slate-400">Only Customer CRM is implemented in this release.</p></div>}</div>;

export default function App() { return <AuthProvider><BrowserRouter><Routes><Route path="/login" element={<LoginPage />} /><Route element={<ProtectedRoute />}><Route path="/dashboard" element={<PortalLayout />} /><Route path="/customers" element={<PortalLayout />} /></Route><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></BrowserRouter></AuthProvider>; }
