import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import api from '../services/api';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Users, Home, Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FamiliesPage() {
  const { activeProjectId, activeProject } = useProject();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamilies = async () => {
      if (!activeProjectId) return;
      try {
        setLoading(true);
        const res = await api.get(`/rr/families/${activeProjectId}`);
        if (res.success && res.data) {
          setFamilies(res.data);
        }
      } catch (err) {
        console.error('Failed to load families:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFamilies();
  }, [activeProjectId]);

  const columns = [
    {
      header: 'Head of Family',
      render: (f) => (
        <div>
          <div className="font-bold text-slate-900 text-xs">{f.familyHeadName}</div>
          <div className="text-[10px] text-slate-400 font-mono">Aadhaar: {f.aadhaarHash}</div>
        </div>
      )
    },
    {
      header: 'Location',
      render: (f) => <span className="text-xs text-slate-700">{f.village}</span>
    },
    {
      header: 'Members',
      render: (f) => <span className="text-xs font-semibold text-slate-800">{f.membersCount} Persons</span>
    },
    {
      header: 'Vulnerability Category',
      render: (f) => (
        <div className="flex flex-wrap gap-1 text-[10px]">
          {f.vulnerability?.isSC && <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">SC</span>}
          {f.vulnerability?.isST && <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">ST</span>}
          {f.vulnerability?.isBPL && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">BPL</span>}
          {f.vulnerability?.isWomanHeaded && <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-800 font-bold">Woman-Headed</span>}
          {!f.vulnerability?.isSC && !f.vulnerability?.isST && !f.vulnerability?.isBPL && !f.vulnerability?.isWomanHeaded && (
            <span className="text-slate-400">General</span>
          )}
        </div>
      )
    },
    {
      header: 'Second Schedule Entitlements',
      render: (f) => (
        <div className="text-xs">
          <div className="font-semibold text-slate-800">
            {f.entitlements?.houseAllotmentChosen ? 'Housing Site Allotment' : 'Cash Grant'}
          </div>
          <div className="text-[10px] text-slate-500">{f.entitlements?.annuityOptionChosen}</div>
        </div>
      )
    },
    {
      header: 'R&R Status',
      render: (f) => (
        <Badge
          status={f.entitlements?.status === 'COMPLETED' || f.entitlements?.status === 'SETTLED' ? 'COMPLETED' : 'IN_PROGRESS'}
          text={f.entitlements?.status || 'Commenced'}
        />
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb items={[{ label: 'Project Affected Families' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              Section 16 Social Census
            </span>
            <span className="text-xs text-slate-500 font-medium">Corridor: {activeProject?.title}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            Project Affected Families (PAFs) Census Master Register
          </h1>
          <p className="text-xs text-slate-500">
            Enumerated household demographic census, vulnerability categorization, and Second Schedule entitlements
          </p>
        </div>

        <Link to="/rr">
          <Button variant="primary" icon={Plus}>
            Enroll Family into R&R Scheme
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner size="md" message="Loading affected families census..." />
      ) : (
        <Table
          columns={columns}
          data={families}
          emptyMessage="No affected families enrolled for this corridor."
        />
      )}
    </div>
  );
}
