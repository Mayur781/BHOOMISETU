import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const STAGES = [
  { code: 'PROPOSAL_SUBMITTED', label: 'Proposal', act: 'Sec 3A' },
  { code: 'SIA_INITIATED', label: 'SIA Study', act: 'Sec 4' },
  { code: 'SECTION_11_NOTIFIED', label: 'Gazette', act: 'Sec 11' },
  { code: 'SECTION_15_OBJECTIONS_REVIEWED', label: 'Objections', act: 'Sec 15' },
  { code: 'SECTION_19_DECLARED', label: 'Declaration', act: 'Sec 19' },
  { code: 'SECTION_23_AWARD_PASSED', label: 'Award', act: 'Sec 23' },
  { code: 'COMPENSATION_DISBURSED', label: 'DBT Disbursal', act: 'PFMS' },
  { code: 'RR_SETTLED', label: 'R&R Scheme', act: 'Sec 31' },
  { code: 'POSSESSION_TAKEN', label: 'Possession', act: 'Sec 38' }
];

export default function StepProgressBar({ currentStage }) {
  const currentIdx = STAGES.findIndex(s => s.code === currentStage);
  const activeIndex = currentIdx === -1 ? 0 : currentIdx;

  return (
    <div className="w-full bg-white p-4 rounded-xl border border-slate-200 shadow-gov">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1.5 text-gov-saffron" />
          Statutory RFCTLARR Act 2013 Milestone Progression
        </h4>
        <span className="text-[11px] font-semibold text-gov-navy bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          Stage {activeIndex + 1} of {STAGES.length}
        </span>
      </div>

      <div className="relative flex items-center justify-between">
        {/* Progress connecting track */}
        <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-slate-200 -z-0" />
        <div
          className="absolute left-4 top-3.5 h-0.5 bg-emerald-600 transition-all duration-500 -z-0"
          style={{ width: `${(activeIndex / (STAGES.length - 1)) * 96}%` }}
        />

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={stage.code} className="flex flex-col items-center relative z-10">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-gov-navy text-white ring-4 ring-amber-400/40 shadow-md'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>

              <div className="text-center mt-2">
                <span className={`block text-[11px] font-bold leading-none ${
                  isCurrent ? 'text-gov-navy font-black' : isCompleted ? 'text-emerald-800' : 'text-slate-400'
                }`}>
                  {stage.label}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">{stage.act}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
