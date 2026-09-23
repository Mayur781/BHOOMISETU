import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FilePlus,
  MapPin,
  Compass,
  Bell,
  Award,
  Calculator,
  KeyRound,
  Users,
  Home,
  FileText,
  FileSpreadsheet,
  BarChart3,
  History,
  Shield,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { canAccessRoute } from '../../config/roles';

export default function Sidebar() {
  const { user } = useAuth();

  const sections = [
    {
      title: 'Acquisition Lifecycle',
      items: [
        { path: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { path: '/projects', label: 'Projects Registry', icon: FolderKanban },
        { path: '/proposals', label: 'Corridor Proposals', icon: FilePlus },
        { path: '/land-parcels', label: 'Khasra Land Parcels', icon: MapPin },
        { path: '/gis-map', label: 'GIS Cadastral Map', icon: Compass, badge: 'Live' },
        { path: '/notifications', label: 'Statutory Gazette', icon: Bell }
      ]
    },
    {
      title: 'Valuation & Handover',
      items: [
        { path: '/awards', label: 'Section 23 Awards', icon: Award },
        { path: '/compensation', label: '100% Solatium & DBT', icon: Calculator },
        { path: '/possession', label: 'Physical Possession', icon: KeyRound },
        { path: '/rr', label: 'R&R Scheme (2nd Sched)', icon: Users },
        { path: '/families', label: 'Affected Families (PAFs)', icon: Home }
      ]
    },
    {
      title: 'Intelligence & Compliance',
      items: [
        { path: '/documents', label: 'Statutory Documents', icon: FileText },
        { path: '/reports', label: 'MIS & Parliament Reports', icon: FileSpreadsheet },
        { path: '/analytics', label: 'National Analytics', icon: BarChart3 },
        { path: '/audit-logs', label: 'Immutable Audit Trail', icon: History },
        { path: '/admin', label: 'Administration & Roles', icon: Shield }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 min-h-[calc(100vh-65px)] shadow-gov">
      {/* Officer Jurisdiction Subhead */}
      <div className="p-3.5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Jurisdictional Access
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        <div className="mt-1 text-xs font-bold text-gov-navy truncate">
          {user?.jurisdiction?.district === 'All' ? 'National Coordination' : `${user?.jurisdiction?.district || 'National'}, ${user?.jurisdiction?.state || 'India'}`}
        </div>
        <div className="text-[10px] text-slate-500 truncate">
          {user?.roleDetails?.badge || user?.role || 'Authorized Officer'}
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 p-2.5 space-y-4 overflow-y-auto">
        {sections.map((sec, sIdx) => {
          const visibleItems = sec.items.filter((item) => canAccessRoute(user, item.path));
          if (visibleItems.length === 0) return null;

          return (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {sec.title}
              </div>
              {visibleItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-gov-navy text-white shadow-xs font-bold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-gov-saffron' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            isActive ? 'bg-gov-saffron text-slate-950' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        );
      })}
    </nav>

      {/* Statutory Footer Citation */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/80 text-[10px] text-slate-500 leading-tight">
        <div className="font-bold text-slate-700">Digital Public Infrastructure</div>
        <div className="mt-0.5 text-slate-500">Ministry of Rural Development • RFCTLARR 2013</div>
      </div>
    </aside>
  );
}
