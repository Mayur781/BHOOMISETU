import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, ShieldCheck, Lock, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES, hasPermission } from '../../config/roles';
import RoleSwitcherModal from './RoleSwitcherModal';

/**
 * PermissionGuard
 * Wraps routes or components to enforce Role-Based Access Control (RBAC).
 *
 * @param {string|string[]} permission - Single permission key or array of keys (any match satisfies)
 * @param {string[]} roles - Array of allowed role names
 * @param {ReactNode} fallback - Optional custom fallback UI
 * @param {ReactNode} children - Protected component
 */
export default function PermissionGuard({ permission, roles, fallback, children }) {
  const { user, isAuthenticated } = useAuth();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Super Admin bypasses all checks
  if (user.role === ROLES.SUPER_ADMIN) {
    return children;
  }

  let isAuthorized = true;

  // Check roles constraint if provided
  if (roles && Array.isArray(roles) && roles.length > 0) {
    isAuthorized = roles.includes(user.role);
  }

  // Check permission constraint if provided
  if (isAuthorized && permission) {
    if (Array.isArray(permission)) {
      isAuthorized = permission.some((perm) => hasPermission(user, perm));
    } else {
      isAuthorized = hasPermission(user, permission);
    }
  }

  if (isAuthorized) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  // Default Official Statutory Clearance Restricted State
  return (
    <div className="p-6 max-w-4xl mx-auto my-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-gov border border-slate-200 overflow-hidden">
        {/* Tricolor Ribbon */}
        <div className="gov-tricolor-stripe" />

        <div className="p-8 text-center sm:text-left sm:flex sm:items-start sm:space-x-6">
          <div className="mx-auto sm:mx-0 w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-600 shadow-inner mb-4 sm:mb-0">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="flex-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200 mb-2">
              <Lock className="w-3 h-3" />
              <span>Statutory Role Clearance Required</span>
            </div>

            <h2 className="text-xl font-bold text-gov-navy">
              Access Restricted Under RFCTLARR Statutory Provisions
            </h2>

            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Your active officer profile (<strong className="text-slate-900">{user.name}</strong>, designated as{' '}
              <span className="font-semibold text-gov-navy">{user.roleDetails?.badge || user.role}</span>) does not possess statutory authorization for this specific acquisition module.
            </p>

            <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Your Active Officer Role:</span>
                <span className="font-bold text-gov-navy bg-white px-2 py-0.5 rounded border border-slate-200">
                  {user.roleDetails?.name || user.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Jurisdictional Domain:</span>
                <span className="font-semibold text-slate-800">
                  {user.jurisdiction?.district === 'All' ? 'National Jurisdiction' : `${user.jurisdiction?.district}, ${user.jurisdiction?.state}`}
                </span>
              </div>
              {permission && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Required Statutory Clearance:</span>
                  <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {Array.isArray(permission) ? permission.join(' OR ') : permission}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gov-navy hover:bg-gov-navyLight text-white text-xs font-bold rounded-lg shadow-gov transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Executive Dashboard</span>
              </Link>

              <button
                type="button"
                onClick={() => setIsSwitcherOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold rounded-lg transition-colors shadow-xs"
              >
                <UserCheck className="w-4 h-4 text-amber-700" />
                <span>Switch Officer Persona (Evaluator Mode)</span>
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
          <span>RFCTLARR Act 2013 Governance Protocol</span>
          <span className="font-semibold text-slate-700">Audit Reference: 403-UNAUTH-ACCESS</span>
        </div>
      </div>

      <RoleSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </div>
  );
}
