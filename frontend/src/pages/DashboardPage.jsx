import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import StatCard from '../components/common/StatCard';
import StepProgressBar from '../components/common/StepProgressBar';
import Badge from '../components/common/Badge';
import {
  Building2,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Calculator,
  Compass,
  FileCheck2,
  Users,
  Layers,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export default function DashboardPage() {
  const { user } = useAuth();
  const { activeProject, projects } = useProject();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/executive-summary');
        if (res.success && res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error('Failed to load executive analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const kpi = analytics?.kpi || {
    totalProjects: 3,
    totalTargetAreaHa: 3820.0,
    totalAcquiredAreaHa: 2450.5,
    areaAcquisitionRate: '64.1',
    totalSanctionedCr: 12450.0,
    totalDisbursedCr: 8120.0,
    disbursalPercentage: '65.2',
    totalParcelsCount: 4200,
    totalAffectedFamilies: 850,
    slaComplianceIndex: 94.2
  };

  const sectorColors = ['#0f2942', '#f58220', '#138808', '#6366f1', '#ec4899'];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Officer Welcome & Active Project Quick Dossier */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-gov flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              PM GatiShakti National Dashboard
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center">
              <ShieldCheck className="w-3 h-3 mr-1" /> SLA Compliant
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            National Land Acquisition Portfolio Overview
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in as <span className="font-semibold text-slate-800">{user?.name}</span> ({user?.designation}) • Jurisdiction: {user?.jurisdiction?.district}, {user?.jurisdiction?.state}
          </p>
        </div>

        {/* Action Quick Launchers */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/gis-map"
            className="flex items-center space-x-1.5 px-3 py-2 bg-gov-navy hover:bg-gov-navyLight text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-gov-saffron" />
            <span>Cadastral GIS Map</span>
          </Link>
          <Link
            to="/compensation"
            className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Awards & Solatium</span>
          </Link>
          <Link
            to="/notifications"
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 transition-all"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Statutory Timeline</span>
          </Link>
        </div>
      </div>

      {/* Active Corridor RFCTLARR Lifecycle Progress */}
      {activeProject && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Selected Corridor: <span className="text-gov-navy">{activeProject.title}</span> ({activeProject.projectCode})
            </span>
            <span className="text-xs text-slate-500">
              Agency: <span className="font-semibold text-slate-700">{activeProject.implementingAgency}</span>
            </span>
          </div>
          <StepProgressBar currentStage={activeProject.currentStage} />
        </div>
      )}

      {/* Executive Key Performance Indicators (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Land Needed"
          value={`${kpi.totalTargetAreaHa} Ha`}
          subtext={`Acquired: ${kpi.totalAcquiredAreaHa} Ha (${kpi.areaAcquisitionRate}%)`}
          icon={Layers}
          color="blue"
          trend={`${kpi.areaAcquisitionRate}% Completed`}
        />
        <StatCard
          title="DBT Compensation Disbursed"
          value={`₹${kpi.totalDisbursedCr} Cr`}
          subtext={`Sanctioned: ₹${kpi.totalSanctionedCr} Cr (${kpi.disbursalPercentage}%)`}
          icon={Calculator}
          color="emerald"
          trend="PFMS Integrated"
        />
        <StatCard
          title="Survey Khasra Parcels"
          value={kpi.totalParcelsCount?.toLocaleString('en-IN')}
          subtext="Total Cadastral Polygons Mapped"
          icon={Compass}
          color="amber"
          trend="100% Geo-referenced"
        />
        <StatCard
          title="SLA Compliance Rate"
          value={`${kpi.slaComplianceIndex}%`}
          subtext="RFCTLARR Statutory Timelines Adhered"
          icon={Clock}
          color="purple"
          trend="Sec 11 to Sec 19 on time"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stage-wise Milestone Funnel */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Statutory Stage Distribution across Corridors
              </h3>
              <p className="text-xs text-slate-500">Number of active infrastructure packages at each RFCTLARR statutory stage</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700 border">
              Live Tracker
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics?.stageData || [
                  { stage: 'Proposal & SIA', count: 1 },
                  { stage: 'Sec 11 Notified', count: 1 },
                  { stage: 'Sec 19 Declared', count: 1 },
                  { stage: 'Award Passed', count: 2 },
                  { stage: 'Possession Taken', count: 1 }
                ]}
                margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f2942', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" name="Corridor Packages" fill="#0f2942" radius={[4, 4, 0, 0]}>
                  {(analytics?.stageData || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={['#0f2942', '#3b82f6', '#f58220', '#10b981', '#138808'][index % 5]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sectoral Breakdown Pie */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Sectoral Portfolio
            </h3>
            <p className="text-xs text-slate-500">Acquisition by Infrastructure Sector</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.sectorData || [
                    { name: 'National Highways', value: 2 },
                    { name: 'Dedicated Freight Corridor', value: 1 },
                    { name: 'Renewable Energy Park', value: 1 }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(analytics?.sectorData || [1, 2, 3]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={sectorColors[index % sectorColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f2942', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100 text-xs">
            {(analytics?.sectorData || [
              { name: 'National Highways', value: 2 },
              { name: 'Dedicated Freight Corridor', value: 1 }
            ]).map((sec, idx) => (
              <div key={sec.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: sectorColors[idx % sectorColors.length] }}
                  />
                  <span className="text-slate-600 font-medium">{sec.name}</span>
                </div>
                <span className="font-bold text-slate-800">{sec.value} Projects</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical SLA Alerts & Active Corridors Quick Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Projects Quick Snapshot */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Corridor Master Registry (Priority Focus)
            </h3>
            <Link
              to="/projects"
              className="text-xs text-gov-navy font-bold hover:underline flex items-center"
            >
              <span>View All Corridors</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase">
                  <th className="py-2.5 px-3">Project Code</th>
                  <th className="py-2.5 px-3">Corridor Title</th>
                  <th className="py-2.5 px-3">State / District</th>
                  <th className="py-2.5 px-3">Target Area</th>
                  <th className="py-2.5 px-3">Current Statutory Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((proj) => (
                  <tr key={proj._id || proj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-gov-navy">
                      {proj.projectCode}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{proj.title}</div>
                      <div className="text-[11px] text-slate-500">{proj.implementingAgency}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {proj.state} ({proj.district})
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {proj.targetAcquisitionAreaHectares} Ha
                    </td>
                    <td className="py-3 px-3">
                      <Badge status={proj.currentStage} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statutory SLA Watchdog & Citizen Objections */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-gov space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center">
              <Clock className="w-4 h-4 mr-1.5 text-amber-500" />
              Statutory SLA Watchdog
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Enforced RFCTLARR Act 2013 Statutory Limits</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-900">Section 11 to 19 Clock</span>
                <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded">
                  Max 12 Months
                </span>
              </div>
              <p className="text-[11px] text-amber-800 mt-1">
                NHAI-EXP-01: Preliminary notification published 4 months ago. 8 months remaining to declare Section 19.
              </p>
              <div className="w-full bg-amber-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-amber-600 h-full w-1/3 rounded-full" />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-900">Section 15 Citizen Objections</span>
                <span className="text-[10px] font-bold bg-blue-200 text-blue-900 px-1.5 py-0.2 rounded">
                  60 Days Window
                </span>
              </div>
              <p className="text-[11px] text-blue-800 mt-1">
                14 objections heard and resolved by CALA Thane. 2 pending joint boundary resurvey.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900">Section 23 Award Passing</span>
                <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded">
                  Sec 25 Compliant
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 mt-1">
                DFC-W-02: ₹3,120 Cr compensation fully processed with 100% Solatium & 12% additional interest.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
