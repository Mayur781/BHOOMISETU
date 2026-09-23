import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Landmark, Shield, Lock, Mail, ArrowRight, UserCheck, CheckCircle2, Sparkles, Building2, Compass, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, demoUsers, switchRole } = useAuth();
  const [email, setEmail] = useState('cala.nhai@bhoomisetu.gov.in');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    if (!res.success) {
      setError(res.message || 'Authentication failed. Please check credentials.');
    }
    setLoading(false);
  };

  const handleQuickSelect = async (demo) => {
    setLoading(true);
    setError('');
    const res = await switchRole(demo.role);
    if (!res.success) {
      // Fallback to login with Admin@123
      const loginRes = await login(demo.email, 'Admin@123');
      if (!loginRes.success) {
        setError(loginRes.message || 'Failed to authenticate demo persona');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gov-navy to-slate-900 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-900">
      {/* Official Tricolor Band */}
      <div className="gov-tricolor-stripe" />

      {/* Top Banner */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gov-saffron/20 border border-gov-saffron/40 flex items-center justify-center text-gov-saffron">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight">
              Bhoomi<span className="text-gov-saffron">Setu</span>
            </span>
            <span className="ml-2 text-[10px] bg-gov-saffron/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-gov-saffron/30 uppercase tracking-wider">
              NLAMS v1.0
            </span>
            <p className="text-[11px] text-slate-400">
              National Land Acquisition & Management System • Government of India
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Statutory Framework: RFCTLARR Act, 2013</span>
        </div>
      </header>

      {/* Center Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: System Overview & Value Pillars */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gov-saffron/15 border border-gov-saffron/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-gov-saffron" />
            <span>Smart India Hackathon 2026 National Innovation</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Transparent, GIS-Driven Land Acquisition Lifecycle for Modern India.
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            BhoomiSetu unites Central Ministries, State Revenue Departments, Competent Authorities (CALA/SLAO), and Project Implementing Agencies into a single unified statutory workflow—enforcing Section 4 to 38 compliance, 100% Solatium arithmetic, and DBT direct benefit transfers.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <div className="text-amber-400 font-bold text-xs uppercase tracking-wider">Cadastral GIS</div>
              <p className="text-xs text-slate-300 mt-1">Interactive OpenStreetMap with Khasra boundary polygons and circle rates.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Sec 26-30 Solatium</div>
              <p className="text-xs text-slate-300 mt-1">Automated 100% solatium, 12% additional interest & PFMS DBT payout logs.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <div className="text-sky-400 font-bold text-xs uppercase tracking-wider">R&R 2nd Schedule</div>
              <p className="text-xs text-slate-300 mt-1">Project Affected Families (PAFs) enumeration with vulnerability tracking.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl">
              <div className="text-purple-400 font-bold text-xs uppercase tracking-wider">SLA Guardianship</div>
              <p className="text-xs text-slate-300 mt-1">Enforced 12-month statutory countdown between Section 11 and Section 19.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card & 1-Click Persona Chooser */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-800 border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-xl font-bold text-gov-navy">Authorized Officer Sign-in</h2>
                <p className="text-xs text-slate-500 mt-0.5">National Single Sign-On for Land Acquisition & Revenue Officials</p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gov-navy/10 flex items-center justify-center text-gov-navy">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Official Email (Gov Domain)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:ring-2 focus:ring-gov-navy focus:border-transparent outline-none transition-all"
                    placeholder="officer@bhoomisetu.gov.in"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Security Passphrase
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:ring-2 focus:ring-gov-navy focus:border-transparent outline-none transition-all"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gov-navy hover:bg-gov-navyLight text-white font-bold rounded-lg text-sm transition-all shadow-gov flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating Officer...' : 'Authenticate & Access Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Persona Switcher for Evaluators (Rendered strictly in Development Mode) */}
            {import.meta.env.DEV && (
              <div className="mt-6 pt-5 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
                    <UserCheck className="w-3.5 h-3.5 mr-1.5 text-gov-saffron" />
                    [DEV ONLY] 1-Click Evaluator Personas
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Instant Access
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                  {demoUsers.map((u) => (
                    <button
                      key={u.role}
                      type="button"
                      onClick={() => handleQuickSelect(u)}
                      className="p-2 text-left rounded-lg border border-slate-200 hover:border-gov-navy hover:bg-slate-50 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 group-hover:text-gov-navy truncate">
                          {u.name}
                        </span>
                      </div>
                      <div className="text-[10px] text-gov-saffron font-bold truncate">
                        {u.roleDetails?.badge || u.role}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {u.designation}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-white/10 bg-black/30 backdrop-blur-md text-center text-xs text-slate-400">
        Designed & Developed for SIH 2026 • Compliant with RFCTLARR Act 2013 & PM GatiShakti National Master Plan.
      </footer>
    </div>
  );
}
