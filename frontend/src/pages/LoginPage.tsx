import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Role } from '../types/auth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedDemoRole, setSelectedDemoRole] = useState<Role>('ADMIN');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyDemoAccount = () => {
    const demoCredentials: Record<Role, string> = {
      ADMIN: 'admin@minierp.dev',
      SALES: 'rahul@minierp.dev',
      WAREHOUSE: 'priya@minierp.dev',
      ACCOUNTS: 'amit@minierp.dev',
    };

    setEmail(demoCredentials[selectedDemoRole]);
    setPassword('Password@123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col justify-center items-center p-4 font-sans text-[#252525] selection:bg-[#2F3437] selection:text-white">
      <div className="w-full max-w-[400px] space-y-4">
        {/* Primary Login Card */}
        <div className="rounded-lg border border-[#E5E5E2] bg-white p-6 shadow-2xs space-y-4">
          <div>
            <h1 className="text-xl font-bold text-[#252525] tracking-tight">Sign in</h1>
            <p className="mt-1 text-xs text-[#6B6B6B] font-normal">
              Access your wholesale operations workspace.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-md border border-[#F5C6C6] bg-[#FDF2F2] p-3 text-xs text-[#B84A4A]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#B84A4A]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-1">
                WORK EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-md border border-[#E5E5E2] bg-white px-3 py-2 text-xs text-[#252525] placeholder:text-[#6B6B6B]/60 focus:border-[#2F3437] focus:outline-none focus:ring-1 focus:ring-[#2F3437] transition"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-1">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-md border border-[#E5E5E2] bg-white px-3 py-2 text-xs text-[#252525] placeholder:text-[#6B6B6B]/60 focus:border-[#2F3437] focus:outline-none focus:ring-1 focus:ring-[#2F3437] transition"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[#6B6B6B] pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E5E5E2] text-[#2F3437] focus:ring-[#2F3437] h-3.5 w-3.5"
                />
                <span>Remember me</span>
              </label>
              <button type="button" className="text-[#6B6B6B] hover:text-[#252525] font-medium">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-md bg-[#2F3437] px-4 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-[#1F2326] disabled:opacity-50 transition mt-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo Access Card */}
        <div className="rounded-lg border border-[#E5E5E2] bg-white p-6 shadow-2xs space-y-3">
          <div>
            <h2 className="text-sm font-bold text-[#252525]">Demo Access</h2>
            <p className="mt-0.5 text-xs text-[#6B6B6B] font-normal">
              Use a development account to explore the portal.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#6B6B6B] uppercase tracking-wider mb-1">
              SELECT DEMO ROLE
            </label>
            <select
              value={selectedDemoRole}
              onChange={(e) => setSelectedDemoRole(e.target.value as Role)}
              className="w-full rounded-md border border-[#E5E5E2] bg-white px-3 py-2 text-xs font-medium text-[#252525] focus:border-[#2F3437] focus:outline-none focus:ring-1 focus:ring-[#2F3437] transition cursor-pointer"
            >
              <option value="ADMIN">Admin — Full system access</option>
              <option value="SALES">Sales — CRM &amp; Challans</option>
              <option value="WAREHOUSE">Warehouse — Products &amp; Inventory</option>
              <option value="ACCOUNTS">Accounts — Read-only access</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleApplyDemoAccount}
            className="w-full rounded-md border border-[#E5E5E2] bg-white py-2 text-xs font-semibold text-[#252525] hover:bg-[#F7F7F5] transition shadow-2xs mt-2 cursor-pointer"
          >
            Use Demo Account
          </button>
        </div>

        {/* Footer Subtext */}
        <p className="text-center text-[11px] text-[#6B6B6B] pt-2">
          Development environment
        </p>
      </div>
    </div>
  );
};
