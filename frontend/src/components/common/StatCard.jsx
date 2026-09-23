import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'blue', trend }) {
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    navy: 'text-gov-navy bg-slate-100 border-slate-200'
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-gov hover:shadow-gov-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-slate-500 mt-1">{subtext}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.blue} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs">
          <span className="font-semibold text-emerald-600 mr-1.5">{trend}</span>
          <span className="text-slate-400">vs statutory SLA deadline</span>
        </div>
      )}
    </div>
  );
}
