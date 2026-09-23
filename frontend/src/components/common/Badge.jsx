import React from 'react';

export default function Badge({ status, text }) {
  const label = text || status;

  const styleMap = {
    // Stage statuses
    'PROPOSAL_SUBMITTED': 'bg-slate-100 text-slate-700 border-slate-300',
    'SIA_INITIATED': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'SIA_APPROVED': 'bg-sky-50 text-sky-700 border-sky-200',
    'SECTION_11_NOTIFIED': 'bg-purple-50 text-purple-700 border-purple-200',
    'SECTION_15_OBJECTIONS_REVIEWED': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'SECTION_19_DECLARED': 'bg-blue-50 text-blue-700 border-blue-200',
    'SECTION_23_AWARD_PASSED': 'bg-amber-50 text-amber-800 border-amber-300',
    'COMPENSATION_DISBURSED': 'bg-emerald-50 text-emerald-700 border-emerald-300',
    'RR_SETTLED': 'bg-teal-50 text-teal-700 border-teal-300',
    'POSSESSION_TAKEN': 'bg-green-100 text-green-800 border-green-400 font-bold',

    // 8 Statutory Parcel Statuses
    'Proposed': 'bg-blue-50 text-blue-700 border-blue-200',
    'Under Verification': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Notification Issued': 'bg-purple-50 text-purple-700 border-purple-200',
    'Awarded': 'bg-amber-50 text-amber-800 border-amber-300',
    'Compensation Paid': 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium',
    'Possession Taken': 'bg-green-100 text-green-800 border-green-400 font-bold',
    'R&R Pending': 'bg-rose-50 text-rose-700 border-rose-300 font-medium',
    'Completed': 'bg-teal-50 text-teal-800 border-teal-300 font-bold',

    // Legacy backward-compatibility aliases
    'SIA Survey Complete': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Sec 11 Notified': 'bg-purple-50 text-purple-700 border-purple-200',
    'Disputed / In Court': 'bg-red-50 text-red-700 border-red-300',
    'Award Determined': 'bg-amber-50 text-amber-700 border-amber-300',
    'Disbursed': 'bg-emerald-50 text-emerald-700 border-emerald-300',
    'Possession Transferred': 'bg-green-50 text-green-700 border-green-300 font-semibold',

    // Generic statuses
    'COMPLETED': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'IN_PROGRESS': 'bg-amber-50 text-amber-700 border-amber-200',
    'PENDING': 'bg-slate-100 text-slate-600 border-slate-200',
    'OVERDUE': 'bg-red-50 text-red-700 border-red-300',
    'Active': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const currentStyle = styleMap[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}>
      {label}
    </span>
  );
}
