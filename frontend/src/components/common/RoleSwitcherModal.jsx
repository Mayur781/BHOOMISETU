import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, Check, UserCheck, X } from 'lucide-react';

export default function RoleSwitcherModal({ isOpen, onClose }) {
  const { user, demoUsers, switchRole } = useAuth();

  if (!isOpen) return null;

  const handleSwitch = async (role) => {
    await switchRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gov-navy text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gov-saffron/20 border border-gov-saffron/40 flex items-center justify-center text-gov-saffron">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">1-Click Role Switcher (Prototype Evaluator)</h2>
              <p className="text-xs text-slate-300">Instantly experience BhoomiSetu from any of the 8 statutory personas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles List */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3">
          {demoUsers.map((demo) => {
            const isCurrent = user?.role === demo.role;
            return (
              <div
                key={demo.role}
                onClick={() => !isCurrent && handleSwitch(demo.role)}
                className={`p-4 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-400/30'
                    : 'border-slate-200 hover:border-gov-navy hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCurrent ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {demo.role.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900 text-sm">{demo.name}</span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 border text-slate-700">
                        {demo.roleDetails?.badge || demo.role}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">{demo.designation}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{demo.roleDetails?.description}</p>
                  </div>
                </div>

                <div>
                  {isCurrent ? (
                    <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                      <Check className="w-3.5 h-3.5 mr-1" /> Active
                    </span>
                  ) : (
                    <button
                      className="text-xs font-medium px-3 py-1.5 rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-gov-navy hover:text-white hover:border-gov-navy transition-colors shadow-sm"
                    >
                      Switch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-between items-center text-xs text-slate-500">
          <span>Security: JWT token dynamically re-minted with valid RBAC claims</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
