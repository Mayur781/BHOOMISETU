import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProject } from '../../context/ProjectContext';
import RoleSwitcherModal from '../common/RoleSwitcherModal';
import {
  Shield,
  Layers,
  LogOut,
  Bell,
  ChevronDown,
  Building2,
  Landmark,
  User
} from 'lucide-react';

import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { projects, activeProjectId, setActiveProjectId, activeProject } = useProject();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-gov-navy text-white shadow-gov-md">
        {/* National Tricolor Stripe */}
        <div className="gov-tricolor-stripe" />

        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Logo & National System Title */}
          <Link to="/dashboard" className="flex items-center space-x-3.5 hover:opacity-95 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 p-1 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Landmark className="w-6 h-6 text-gov-saffron" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black tracking-tight text-white">
                  Bhoomi<span className="text-gov-saffron">Setu</span>
                </span>
                <span className="hidden md:inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-saffron/20 text-amber-300 border border-gov-saffron/30">
                  NLAMS • Govt of India
                </span>
              </div>
              <p className="text-[11px] text-slate-300 tracking-wide font-medium hidden sm:block">
                National Land Acquisition & Management System (RFCTLARR Act, 2013)
              </p>
            </div>
          </Link>

          {/* Center: Project Corridor Selector */}
          <div className="hidden lg:flex items-center space-x-2 bg-white/10 border border-white/15 px-3 py-1.5 rounded-lg">
            <Layers className="w-4 h-4 text-gov-saffron flex-shrink-0" />
            <span className="text-xs text-slate-300 font-medium">Active Corridor:</span>
            <select
              value={activeProjectId || ''}
              onChange={(e) => setActiveProjectId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer max-w-xs truncate"
            >
              {projects.map((p) => (
                <option key={p._id || p.id} value={p._id || p.id} className="bg-slate-900 text-white">
                  {p.projectCode} - {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-3">
            {/* 1-Click Role Switcher Quick Pill */}
            <button
              onClick={() => setIsRoleModalOpen(true)}
              className="flex items-center space-x-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm group"
              title="Click to switch between any of the 8 roles"
            >
              <Shield className="w-3.5 h-3.5 text-gov-saffron animate-pulse" />
              <span className="hidden sm:inline">Role:</span>
              <span className="text-white font-bold">{user?.roleDetails?.badge || user?.role}</span>
              <span className="text-[10px] bg-amber-500/40 px-1.5 py-0.2 rounded text-amber-100 uppercase tracking-wider group-hover:bg-amber-500 transition-colors">
                Switch
              </span>
            </button>

            {/* Officer Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-500 flex items-center justify-center text-xs font-bold text-amber-300">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OF'}
                </div>
                <div className="hidden xl:block text-left leading-tight">
                  <div className="text-xs font-semibold text-white">{user?.name}</div>
                  <div className="text-[10px] text-slate-300 truncate max-w-[150px]">{user?.designation}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-300" />
              </button>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                    <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{user?.email}</p>
                    <div className="mt-2 inline-block px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy text-[11px] font-semibold">
                      {user?.department}
                    </div>
                  </div>

                  <div className="px-4 py-2 text-[11px] text-slate-600 space-y-1">
                    <p><span className="font-medium text-slate-800">Jurisdiction:</span> {user?.jurisdiction?.district}, {user?.jurisdiction?.state}</p>
                    <p><span className="font-medium text-slate-800">Phone:</span> {user?.phone}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center"
                    >
                      <User className="w-3.5 h-3.5 mr-2 text-slate-500" /> Officer Profile & Security
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsRoleModalOpen(true);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-amber-700 hover:bg-amber-50 flex items-center"
                    >
                      <Shield className="w-3.5 h-3.5 mr-2" /> Switch Officer Persona
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out from System
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />
    </>
  );
}
