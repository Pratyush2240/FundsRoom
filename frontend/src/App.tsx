import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  User as UserIcon,
  Users,
} from 'lucide-react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { InventoryPage } from './pages/InventoryPage';
import { ChallansPage } from './pages/ChallansPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { Role } from './types/auth';

const PortalLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const nav = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[],
      path: '/dashboard',
    },
    {
      id: 'customers',
      label: 'Customer CRM',
      icon: Users,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[],
      path: '/customers',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[],
      path: '/products',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Activity,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[],
      path: '/inventory',
    },
    {
      id: 'challans',
      label: 'Sales Challans',
      icon: FileSpreadsheet,
      roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as Role[],
      path: '/challans',
    },
  ];

  const currentId =
    location.pathname === '/customers'
      ? 'customers'
      : location.pathname === '/products'
      ? 'products'
      : location.pathname === '/inventory'
      ? 'inventory'
      : location.pathname === '/challans'
      ? 'challans'
      : 'dashboard';

  const currentNav = nav.find((item) => item.id === currentId);
  const title = currentNav?.label || 'Dashboard';
  const subtitle =
    currentId === 'dashboard'
      ? 'Operations overview'
      : currentId === 'customers'
      ? 'Customer management & leads'
      : currentId === 'products'
      ? 'Product catalog & stock'
      : currentId === 'inventory'
      ? 'Stock movements & history'
      : 'Delivery dispatches & orders';

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F7F5] font-sans text-[#252525] selection:bg-[#2F3437] selection:text-white">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col justify-between bg-white border-r border-[#E5E5E2] text-[#252525]">
        <div>
          {/* Logo Branding */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E5E2]">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#2F3437] text-xs font-bold text-white shadow-2xs">
              A
            </div>
            <div>
              <h1 className="text-sm font-bold text-[#252525] tracking-tight leading-tight">Apex ERP</h1>
              <p className="text-[11px] text-[#6B6B6B] font-normal">Wholesale Operations Workspace</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="mt-3 space-y-0.5 px-3">
            {nav
              .filter((item) => user && item.roles.includes(user.role))
              .map((item) => {
                const Icon = item.icon;
                const active = currentId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs font-medium transition ${
                      active
                        ? 'bg-[#E9ECEB] text-[#252525] font-semibold'
                        : 'text-[#6B6B6B] hover:bg-[#E9ECEB]/60 hover:text-[#252525]'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-[#2F3437]' : 'text-[#6B6B6B]'}`} />
                    {item.label}
                  </button>
                );
              })}
          </nav>
        </div>

        {/* Bottom Actions & Logout */}
        <div className="space-y-0.5 p-3 border-t border-[#E5E5E2]">
          <button className="flex w-full items-center gap-3 rounded-md px-3 py-1.5 text-left text-xs text-[#6B6B6B] hover:bg-[#E9ECEB]/60 hover:text-[#252525]">
            <Settings className="h-4 w-4" /> Settings
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-xs font-medium text-[#6B6B6B] hover:bg-[#FDF2F2] hover:text-[#B84A4A] transition mt-1"
          >
            <LogOut className="h-4 w-4 text-[#B84A4A]" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F7F7F5]">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[#E5E5E2] bg-white px-6 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-[#252525]">{title}</h2>
            <span className="text-[#E5E5E2] font-light">|</span>
            <span className="text-xs text-[#6B6B6B] font-normal">{subtitle}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Clean User Badge — Showcase icons like Notification, Refresh, Help removed */}
            <div className="flex items-center gap-2.5 bg-[#F7F7F5] px-3 py-1 rounded-md border border-[#E5E5E2]">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E9ECEB] text-[#252525]">
                <UserIcon className="h-3.5 w-3.5" />
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-[#252525]">{user?.name}</span>
                <span className="rounded bg-[#E9ECEB] px-1.5 py-0.5 text-[10px] font-bold uppercase text-[#6B6B6B]">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1">
          {location.pathname === '/customers' ? (
            <CustomersPage />
          ) : location.pathname === '/products' ? (
            <ProductsPage />
          ) : location.pathname === '/inventory' ? (
            <InventoryPage />
          ) : location.pathname === '/challans' ? (
            <ChallansPage />
          ) : (
            <DashboardPage />
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
            <Route path="/customers" element={<PortalLayout />} />
            <Route path="/products" element={<PortalLayout />} />
            <Route path="/inventory" element={<PortalLayout />} />
            <Route path="/challans" element={<PortalLayout />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
