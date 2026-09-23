import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  History,
  Shield,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  CheckCircle,
  FileText,
  Lock,
  ArrowUpDown
} from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/audit/logs');
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionTypes = [
    'ALL',
    'AWARD_DETERMINED',
    'PFMS_DBT_DISBURSED',
    'SECTION_11_PUBLISHED',
    'SECTION_19_DECLARED',
    'STAGE_ADVANCED',
    'PARCEL_CREATED',
    'POSSESSION_CERTIFICATE_ISSUED',
    'OBJECTION_FILED'
  ];

  const filteredLogs = logs.filter((log) => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const matchesSearch =
      (log.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              Immutable Statutory Governance
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Tamper-Evident Ledger
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Immutable Audit Trail & Officer Decision Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Chronological, cryptographically verifiable record of all statutory land acquisition notices, awards, and PFMS transfers
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold border border-slate-300 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit Logs</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-gov flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search audit trail by description, officer name, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 outline-none"
          >
            {actionTypes.map((t) => (
              <option key={t} value={t}>
                {t === 'ALL' ? 'All Action Types' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Entries */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-gov overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Recorded Statutory Events ({filteredLogs.length})
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Integrity: SHA256 Chained Hashes
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">No audit events match your search or filter.</p>
            </div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={log._id || log.id || idx} className="p-4 hover:bg-slate-50/80 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-gov-navy/10 text-gov-navy border border-gov-navy/20">
                      {log.action}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {log.userName || 'Authorized Officer'}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                      {log.userRole}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                    <span>IP: {log.ip || '127.0.0.1'}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-slate-400" />
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-xs text-slate-700 leading-relaxed font-normal">
                  {log.description}
                </div>

                {log.resourceType && (
                  <div className="mt-2 flex items-center space-x-3 text-[10px] text-slate-400 font-mono">
                    <span>Target: {log.resourceType} ({log.resourceId?.slice(0, 16)}...)</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
