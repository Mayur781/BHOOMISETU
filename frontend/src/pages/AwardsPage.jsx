import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import api from '../services/api';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Award, Calculator, Send, CheckCircle2, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AwardsPage() {
  const { activeProjectId, activeProject } = useProject();
  const [awardsData, setAwardsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAwards = async () => {
    if (!activeProjectId) return;
    try {
      setLoading(true);
      const res = await api.get(`/compensation/project/${activeProjectId}`);
      if (res.success && res.data) {
        setAwardsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load awards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwards();
  }, [activeProjectId]);

  const awards = awardsData?.awards || [];

  const columns = [
    {
      header: 'Award Decree Ref',
      render: (a) => (
        <div>
          <span className="font-mono font-bold text-gov-navy text-xs">{a.awardNumber}</span>
          <div className="text-[10px] text-slate-400">
            Promulgated on {new Date(a.dateOfAward).toLocaleDateString('en-IN')}
          </div>
        </div>
      )
    },
    {
      header: 'Beneficiary Owners',
      render: (a) => (
        <div className="text-xs text-slate-800">
          {(a.disbursements || []).map((d, idx) => (
            <div key={idx} className="font-medium">
              {d.ownerName} <span className="font-mono text-slate-500 font-bold">(₹{d.amountShare?.toLocaleString('en-IN')})</span>
            </div>
          ))}
        </div>
      )
    },
    {
      header: '100% Solatium (Sec 30)',
      render: (a) => (
        <span className="font-mono text-xs font-bold text-amber-900">
          ₹{a.calculation?.solatiumAmount?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Total Compensation (Sec 23)',
      render: (a) => (
        <span className="font-mono text-xs font-black text-gov-navy">
          ₹{a.calculation?.totalCompensationPayable?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'CALA Signature Seal',
      render: (a) => (
        <div className="text-xs">
          <div className="font-bold text-emerald-800 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            {a.calaDigitalSignature?.officerName || 'Signed by CALA'}
          </div>
          <div className="text-[9px] font-mono text-slate-400 truncate max-w-[120px]">
            {a.calaDigitalSignature?.digitalHash}
          </div>
        </div>
      )
    },
    {
      header: 'Disbursal Action',
      render: (a) => (
        <Link to="/compensation">
          <Button variant="outline" size="sm" icon={Send}>
            PFMS Desk
          </Button>
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb items={[{ label: 'Section 23 Awards' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              Statutory Awards Register
            </span>
            <span className="text-xs text-slate-500 font-medium">Corridor: {activeProject?.title}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            Section 23 Land Acquisition Awards & Decree Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Formally passed compensation awards incorporating Section 26 valuation, 100% Solatium, and CALA digital seals
          </p>
        </div>

        <Link to="/compensation">
          <Button variant="primary" icon={Calculator}>
            Valuation & Solatium Desk
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner size="md" message="Loading statutory awards ledger..." />
      ) : (
        <Table
          columns={columns}
          data={awards}
          emptyMessage="No Section 23 awards passed yet for this corridor."
        />
      )}
    </div>
  );
}
