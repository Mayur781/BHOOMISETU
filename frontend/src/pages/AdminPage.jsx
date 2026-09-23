import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import Card from '../components/common/Card';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import RoleSwitcherModal from '../components/common/RoleSwitcherModal';
import { Shield, Users, Database, Key, Server, Lock, CheckCircle2 } from 'lucide-react';

export default function AdminPage() {
  const { demoUsers, user } = useAuth();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const permissions = [
    { role: 'SUPER_ADMIN', name: 'Super Admin / National DG', projectCreate: true, sec11Publish: true, sec19Declare: true, awardPass: true, dbtDisburse: true, possessionTake: true },
    { role: 'CENTRAL_MINISTRY_OFFICER', name: 'Central Ministry (MoRTH / Railways)', projectCreate: true, sec11Publish: false, sec19Declare: false, awardPass: false, dbtDisburse: false, possessionTake: false },
    { role: 'STATE_GOV_OFFICER', name: 'State Revenue Department', projectCreate: true, sec11Publish: true, sec19Declare: true, awardPass: false, dbtDisburse: false, possessionTake: false },
    { role: 'DISTRICT_AUTHORITY_OFFICER', name: 'District Collector & DM', projectCreate: false, sec11Publish: true, sec19Declare: true, awardPass: true, dbtDisburse: false, possessionTake: true },
    { role: 'LAND_ACQUISITION_OFFICER', name: 'CALA / SLAO Officer', projectCreate: false, sec11Publish: true, sec19Declare: false, awardPass: true, dbtDisburse: true, possessionTake: true },
    { role: 'PROJECT_AGENCY_OFFICER', name: 'NHAI / Project Agency', projectCreate: true, sec11Publish: false, sec19Declare: false, awardPass: false, dbtDisburse: true, possessionTake: false },
    { role: 'FIELD_SURVEY_OFFICER', name: 'Revenue Amin / Surveyor', projectCreate: false, sec11Publish: false, sec19Declare: false, awardPass: false, dbtDisburse: false, possessionTake: false },
    { role: 'VIEWER_EXECUTIVE', name: 'PM GatiShakti Executive Viewer', projectCreate: false, sec11Publish: false, sec19Declare: false, awardPass: false, dbtDisburse: false, possessionTake: false }
  ];

  const columns = [
    {
      header: 'Statutory Role & Persona',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-800 text-xs">{r.name}</span>
          <div className="font-mono text-[10px] text-slate-400">{r.role}</div>
        </div>
      )
    },
    {
      header: 'Proposals',
      render: (r) => (r.projectCreate ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">—</span>)
    },
    {
      header: 'Sec 11 Gazette',
      render: (r) => (r.sec11Publish ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">—</span>)
    },
    {
      header: 'Sec 19 Decree',
      render: (r) => (r.sec19Declare ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">—</span>)
    },
    {
      header: 'Sec 23 Award',
      render: (r) => (r.awardPass ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">—</span>)
    },
    {
      header: 'PFMS DBT',
      render: (r) => (r.dbtDisburse ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">—</span>)
    },
    {
      header: 'Sec 38 Possession',
      render: (r) => (r.possessionTake ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-slate-300">—</span>)
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb items={[{ label: 'System Administration' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              Security Governance
            </span>
            <span className="text-xs text-slate-500 font-medium">Role-Based Access Control (RBAC)</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            Administration & Statutory Permission Matrix
          </h1>
          <p className="text-xs text-slate-500">
            Enforced statutory authority tiers for preliminary notifications, award declarations, and possession handovers
          </p>
        </div>

        <Button variant="primary" icon={Users} onClick={() => setIsRoleModalOpen(true)}>
          Switch Officer Persona
        </Button>
      </div>

      {/* System Infrastructure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Application Gateway</div>
              <div className="font-bold text-slate-800 text-xs mt-0.5">REST API (Express v4.21)</div>
              <div className="text-[10px] text-emerald-600 font-medium">Port 5000 • UP</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Persistence Architecture</div>
              <div className="font-bold text-slate-800 text-xs mt-0.5">Dual-Mode Mongoose Engine</div>
              <div className="text-[10px] text-emerald-600 font-medium">Zero-Config Memory Primed</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Cryptographic Integrity</div>
              <div className="font-bold text-slate-800 text-xs mt-0.5">JWT HMAC-SHA256</div>
              <div className="text-[10px] text-purple-700 font-medium">Chained Audit Ledger Active</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Statutory RBAC Permission Matrix */}
      <Card
        title="Statutory Role-Based Access Control (RBAC) Matrix"
        subtitle="Mandated by RFCTLARR Act 2013 and Revenue Administration Rules"
      >
        <Table columns={columns} data={permissions} />
      </Card>

      <RoleSwitcherModal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} />
    </div>
  );
}
