import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import api from '../services/api';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { MapPin, Search, Filter, Compass, Calculator, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandParcelsPage() {
  const { activeProjectId, activeProject } = useProject();
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchParcels = async () => {
    try {
      setLoading(true);
      const res = await api.get('/parcels', { params: { projectId: activeProjectId } });
      if (res.success && res.data) {
        setParcels(res.data);
      }
    } catch (err) {
      console.error('Failed to load parcels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();
  }, [activeProjectId]);

  const filtered = parcels.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.acquisitionStatus === statusFilter;
    const matchesSearch =
      p.khasraNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.owners && p.owners.some((o) => o.name.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      header: 'Khasra No',
      render: (p) => (
        <div>
          <span className="font-mono font-bold text-gov-navy text-xs">Khasra {p.khasraNumber}</span>
          <div className="text-[10px] text-slate-500">{p.landCategory}</div>
        </div>
      )
    },
    {
      header: 'Location / Village',
      render: (p) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{p.village}</div>
          <div className="text-[10px] text-slate-500">{p.tehsil}, {p.district}</div>
        </div>
      )
    },
    {
      header: 'Acquired Area',
      render: (p) => (
        <div>
          <div className="font-mono font-bold text-xs">{p.acquiredAreaHectares} Ha</div>
          <div className="text-[10px] text-slate-400">Total: {p.totalAreaHectares} Ha</div>
        </div>
      )
    },
    {
      header: 'Circle Rate (₹/Ha)',
      render: (p) => (
        <span className="font-mono text-xs font-semibold">
          ₹{p.circleRatePerHectare?.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      header: 'Registered Titleholders',
      render: (p) => (
        <div className="text-xs text-slate-800">
          {(p.owners || []).map((o, idx) => (
            <div key={idx} className="truncate max-w-[180px]">
              {o.name} <span className="text-[10px] text-slate-400 font-mono">({o.sharePercentage}%)</span>
            </div>
          ))}
        </div>
      )
    },
    {
      header: 'Status',
      render: (p) => <Badge status={p.acquisitionStatus} />
    },
    {
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center space-x-1">
          <Link to="/gis-map">
            <Button variant="outline" size="sm" icon={Compass} title="View on GIS Map">
              Map
            </Button>
          </Link>
          <Link to="/compensation">
            <Button variant="outline" size="sm" icon={Calculator} title="Compute Section 26-30 Solatium">
              Award
            </Button>
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb items={[{ label: 'Khasra Land Parcels' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              Cadastral Registry
            </span>
            <span className="text-xs text-slate-500 font-medium">Corridor: {activeProject?.title}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            Survey Khasra Land Parcels Master Register
          </h1>
          <p className="text-xs text-slate-500">
            Cadastral boundaries, Record of Rights (RoR 7/12) verification, circle valuations, and acquisition status
          </p>
        </div>

        <Link to="/gis-map">
          <Button variant="primary" icon={Plus}>
            Register Survey Khasra
          </Button>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-gov">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Khasra number, village, or titleholder..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-gov-navy"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
          >
            <option value="ALL">All Acquisition Statuses</option>
            <option value="Proposed">Proposed</option>
            <option value="SIA Survey Complete">SIA Survey Complete</option>
            <option value="Sec 11 Notified">Sec 11 Notified</option>
            <option value="Award Determined">Award Determined</option>
            <option value="Disbursed">Disbursed</option>
            <option value="Possession Transferred">Possession Transferred</option>
            <option value="Disputed / In Court">Disputed / In Court</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="md" message="Loading cadastral Khasra register..." />
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-gov overflow-hidden">
          <Table
            columns={columns}
            data={paginated}
            emptyMessage="No land parcels matching the criteria."
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
}
