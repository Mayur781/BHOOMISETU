import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Breadcrumb from '../components/common/Breadcrumb';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  BarChart3,
  Layers,
  Calculator,
  Compass,
  Clock,
  TrendingUp,
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
  CartesianGrid
} from 'recharts';

export default function AnalyticsPage() {
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
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const kpi = analytics?.kpi || {
    totalProjects: 4,
    totalTargetAreaHa: 2235.5,
    totalAcquiredAreaHa: 993.2,
    areaAcquisitionRate: '44.4',
    totalSanctionedCr: 1470.0,
    totalDisbursedCr: 888.2,
    disbursalPercentage: '60.4',
    totalParcelsCount: 5,
    totalAffectedFamilies: 3,
    slaComplianceIndex: 94.2
  };

  const sectorColors = ['#0f2942', '#f58220', '#138808', '#6366f1'];

  if (loading) {
    return <LoadingSpinner size="lg" fullPage message="Aggregating National PM GatiShakti Analytics..." />;
  }

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb items={[{ label: 'National Analytics' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              National Intelligence
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              PM GatiShakti Integrated
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            National Land Acquisition Analytics & Decision Intelligence
          </h1>
          <p className="text-xs text-slate-500">
            Cross-corridor performance, statutory SLA compliance benchmarks, and financial disbursement velocity
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Target Hectarage"
          value={`${kpi.totalTargetAreaHa} Ha`}
          subtext={`Acquired: ${kpi.totalAcquiredAreaHa} Ha (${kpi.areaAcquisitionRate}%)`}
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Compensation Disbursed"
          value={`₹${kpi.totalDisbursedCr} Cr`}
          subtext={`Sanctioned: ₹${kpi.totalSanctionedCr} Cr (${kpi.disbursalPercentage}%)`}
          icon={Calculator}
          color="emerald"
        />
        <StatCard
          title="Cadastral Khasras"
          value={kpi.totalParcelsCount}
          subtext="Total Mapped Polygons"
          icon={Compass}
          color="amber"
        />
        <StatCard
          title="SLA Compliance Rate"
          value={`${kpi.slaComplianceIndex}%`}
          subtext="RFCTLARR Statutory Timelines Adhered"
          icon={Clock}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card
          className="lg:col-span-8"
          title="Statutory Stage Distribution across Infrastructure Corridors"
          subtitle="Number of active infrastructure packages at each RFCTLARR statutory stage"
        >
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
                <Tooltip contentStyle={{ backgroundColor: '#0f2942', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#0f2942" radius={[4, 4, 0, 0]}>
                  {(analytics?.stageData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0f2942', '#3b82f6', '#f58220', '#10b981', '#138808'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card
          className="lg:col-span-4"
          title="Sectoral Infrastructure Breakdown"
          subtitle="Acquisition Extent by Sponsoring Sector"
        >
          <div className="h-60 w-full flex items-center justify-center">
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
                <Tooltip contentStyle={{ backgroundColor: '#0f2942', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
