import React from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { FileSpreadsheet, Download, Printer, BarChart3, ShieldCheck } from 'lucide-react';

export default function ReportsPage() {
  const reports = [
    {
      title: 'RFCTLARR Act Statutory SLA Compliance Statement',
      category: 'Statutory Monitoring',
      description: 'Section-wise SLA compliance analysis (Sec 4 SIA, Sec 11 to 19 timeline adherence, Sec 25 award deadlines).',
      period: 'FY 2025-26 Quarterly',
      format: 'PDF / XLSX'
    },
    {
      title: 'PFMS Direct Benefit Transfer (DBT) Compensation Statement',
      category: 'Financial Disbursal',
      description: 'Beneficiary-level credit ledger with UTR numbers, IFSC details, 100% Solatium components, and bank statuses.',
      period: 'Monthly Cumulative',
      format: 'PDF / CSV'
    },
    {
      title: 'Second Schedule Rehabilitation & Resettlement Progress Report',
      category: 'R&R Compliance',
      description: 'Census of Project Affected Families (PAFs), vulnerable households protected (SC/ST/BPL/Woman-headed), and housing site allocations.',
      period: 'Bi-annual Audit',
      format: 'PDF'
    },
    {
      title: 'Parliamentary Unstarred Question Brief (MoRTH / Railways)',
      category: 'Parliamentary Brief',
      description: 'State-wise and corridor-wise land acquisition progress, hectarage acquired, pending litigations, and possession handovers.',
      period: 'Monsoon Session 2026',
      format: 'PDF / Word'
    },
    {
      title: 'District Collector Physical Possession Transfer Handover Statement',
      category: 'Possession Records',
      description: 'Section 38 Form 11 certificate summaries, encumbrance clearances, and agency possession receipts.',
      period: 'Rolling Master Ledger',
      format: 'PDF'
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb items={[{ label: 'MIS & Parliament Reports' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              Executive MIS Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">PM GatiShakti & Parliament Reporting</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            Statutory MIS Reports & Parliamentary Briefs
          </h1>
          <p className="text-xs text-slate-500">
            Standardized Government of India regulatory returns, financial audit statements, and Parliamentary replies
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep, idx) => (
          <Card key={idx} className="flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {rep.category}
                </span>
                <span className="text-[11px] font-mono text-slate-500">{rep.period}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">{rep.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{rep.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-mono font-semibold text-slate-500">
                Format: {rep.format}
              </span>
              <div className="flex space-x-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Printer}
                  onClick={() => alert(`Printing report: ${rep.title}`)}
                >
                  Print
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={() => alert(`Generating and downloading: ${rep.title}`)}
                >
                  Generate
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
