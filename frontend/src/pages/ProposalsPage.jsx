import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProject } from '../context/ProjectContext';
import api from '../services/api';
import Breadcrumb from '../components/common/Breadcrumb';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import {
  FilePlus,
  Search,
  Filter,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileCheck,
  Send,
  Building2,
  MapPin,
  Landmark,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';

const WORKFLOW_STAGES = [
  'Draft',
  'Submitted',
  'District Verification',
  'State Review',
  'Central Review',
  'Approved',
  'Acquisition Initiated'
];

export default function ProposalsPage() {
  const { user } = useAuth();
  const { refreshProjects } = useProject();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Action Modals State
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [actionType, setActionType] = useState(''); // 'verify' | 'approve' | 'reject' | 'submit'
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionRemarks, setActionRemarks] = useState('');
  const [actionSanctionRef, setActionSanctionRef] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    projectName: '',
    projectType: 'Highway',
    sponsoringAgency: 'National Highways Authority of India (NHAI)',
    state: 'Maharashtra',
    district: 'Thane',
    tehsil: 'Bhiwandi',
    villages: 'Padgha, Khadavali',
    requiredAreaHectares: 250,
    estimatedCostInCrores: 3200,
    justification: 'Strategic infrastructure corridor under PM GatiShakti National Master Plan.'
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/proposals');
      if (res.success && res.data) {
        setProposals(res.data);
      }
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      const villagesArray = typeof createFormData.villages === 'string'
        ? createFormData.villages.split(',').map((v) => v.trim()).filter(Boolean)
        : createFormData.villages;

      const payload = {
        ...createFormData,
        villages: villagesArray,
        requiredAreaHectares: Number(createFormData.requiredAreaHectares),
        estimatedCostInCrores: Number(createFormData.estimatedCostInCrores)
      };

      const res = await api.post('/proposals', payload);
      if (res.success) {
        setIsCreateModalOpen(false);
        setCreateFormData({
          projectName: '',
          projectType: 'Highway',
          sponsoringAgency: 'National Highways Authority of India (NHAI)',
          state: 'Maharashtra',
          district: 'Thane',
          tehsil: 'Bhiwandi',
          villages: 'Padgha, Khadavali',
          requiredAreaHectares: 250,
          estimatedCostInCrores: 3200,
          justification: ''
        });
        await fetchProposals();
      } else {
        setCreateError(res.message || 'Failed to file proposal.');
      }
    } catch (err) {
      setCreateError(err.message || 'Proposal submission failed.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleExecuteAction = async (e) => {
    e.preventDefault();
    if (!selectedProposal || !actionType) return;
    setActionLoading(true);
    setActionError('');

    const pId = selectedProposal.proposalId || selectedProposal._id || selectedProposal.id;

    try {
      let res;
      if (actionType === 'submit') {
        res = await api.post(`/proposals/${pId}/submit`, {});
      } else if (actionType === 'verify') {
        res = await api.post(`/proposals/${pId}/verify`, {
          remarks: actionRemarks || 'Vetted and verified with District Land Records.',
          landRecordsStatus: '100% verified with Bhulekh / RoR registers',
          fieldInspectionDone: true
        });
      } else if (actionType === 'approve') {
        res = await api.post(`/proposals/${pId}/approve`, {
          remarks: actionRemarks || 'Approved according to statutory guidelines.',
          cabinetSanctionRef: actionSanctionRef || `CCEA-${Date.now().toString(36).toUpperCase()}`
        });
      } else if (actionType === 'reject') {
        res = await api.post(`/proposals/${pId}/reject`, {
          reason: actionRemarks || 'Proposal rejected due to statutory and alignment non-compliance.'
        });
      }

      if (res && res.success) {
        setIsActionModalOpen(false);
        setSelectedProposal(null);
        setActionType('');
        setActionRemarks('');
        setActionSanctionRef('');
        await fetchProposals();
        await refreshProjects();
      } else {
        setActionError(res?.message || 'Action failed.');
      }
    } catch (err) {
      setActionError(err.message || 'Action failed to execute.');
    } finally {
      setActionLoading(false);
    }
  };

  const openAction = (proposal, type) => {
    setSelectedProposal(proposal);
    setActionType(type);
    setActionRemarks('');
    setActionSanctionRef('');
    setActionError('');
    setIsActionModalOpen(true);
  };

  const getStageIndex = (status) => {
    const idx = WORKFLOW_STAGES.indexOf(status);
    return idx !== -1 ? idx : 0;
  };

  const filteredProposals = proposals.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesSearch =
      (p.projectName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.proposalId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.state || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.district || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sponsoringAgency || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Summary Metrics
  const totalCount = proposals.length;
  const underVerificationCount = proposals.filter((p) =>
    ['Submitted', 'District Verification', 'State Review', 'Central Review'].includes(p.status)
  ).length;
  const approvedCount = proposals.filter((p) =>
    ['Approved', 'Acquisition Initiated'].includes(p.status)
  ).length;
  const rejectedCount = proposals.filter((p) => p.status === 'Rejected').length;

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb items={[{ label: 'Acquisition Proposals' }]} />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              Section 3A / Statutory Intake
            </span>
            <span className="text-xs text-slate-500 font-medium">PM GatiShakti Multi-Modal Infrastructure Hub</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            Infrastructure Land Acquisition Proposals
          </h1>
          <p className="text-xs text-slate-500">
            Lifecycle proposal clearance under RFCTLARR Act, 2013 &mdash; Feasibility, District Verification, Ministerial Sanction, and Initiation
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => {
            setCreateError('');
            setIsCreateModalOpen(true);
          }}
        >
          File New Proposal
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Proposals</span>
            <Building2 className="w-4 h-4 text-gov-navy" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Across 8 statutory sectors</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">In Statutory Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1 font-mono">{underVerificationCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">District, State & Central Vetting</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Approved & Initiated</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">{approvedCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Ready for Gazette Section 11/19</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wide">Rejected / Objections</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-700 mt-1 font-mono">{rejectedCount}</div>
          <div className="text-[11px] text-rose-600 mt-1">Eco-Sensitive or Title Conflicts</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-gov">
        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-2 border-b border-slate-100 text-xs">
          {[
            { id: 'ALL', label: 'All Proposals' },
            { id: 'Draft', label: 'Draft' },
            { id: 'Submitted', label: 'Submitted' },
            { id: 'District Verification', label: 'District Verification' },
            { id: 'State Review', label: 'State Review' },
            { id: 'Central Review', label: 'Central Review' },
            { id: 'Approved', label: 'Approved' },
            { id: 'Acquisition Initiated', label: 'Acquisition Initiated' },
            { id: 'Rejected', label: 'Rejected' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-gov-navy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by proposal ID, project name, agency, district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-gov-navy"
            />
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredProposals.length}</span> of {proposals.length} Proposals
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
            <div className="w-8 h-8 border-3 border-gov-navy border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">Loading statutory acquisition proposals...</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 text-center">
            <Landmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No proposals found matching the criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting search filters or file a new corridor proposal.</p>
          </div>
        ) : (
          filteredProposals.map((prop) => {
            const currentIdx = getStageIndex(prop.status);
            const isRejected = prop.status === 'Rejected';

            return (
              <div
                key={prop._id || prop.id || prop.proposalId}
                className="bg-white rounded-xl border border-slate-200 shadow-gov overflow-hidden transition-all hover:border-gov-navy/40"
              >
                {/* Proposal Top Row */}
                <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-gov-navy px-2 py-0.5 rounded border border-slate-200">
                        {prop.proposalId}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        {prop.projectType || 'Highway'}
                      </span>
                      <Badge status={prop.status} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {prop.projectName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center space-x-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">{prop.sponsoringAgency}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{prop.district}, {prop.state}</span>
                      </span>
                      {prop.villages && (
                        <span>
                          Villages: <strong className="text-slate-700">{Array.isArray(prop.villages) ? prop.villages.join(', ') : prop.villages}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Key Metrics & Quick Actions */}
                  <div className="flex items-center gap-4 lg:text-right">
                    <div className="border-r border-slate-200 pr-4">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Required Land</div>
                      <div className="text-sm font-black font-mono text-slate-900">
                        {prop.requiredAreaHectares || prop.requiredLandArea || 0} Ha
                      </div>
                    </div>
                    <div className="border-r border-slate-200 pr-4">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Estimated Budget</div>
                      <div className="text-sm font-black font-mono text-emerald-700">
                        ₹{prop.estimatedCostInCrores || 0} Cr
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* State Transition Action Buttons */}
                      {prop.status === 'Draft' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={Send}
                          onClick={() => openAction(prop, 'submit')}
                        >
                          Submit to District
                        </Button>
                      )}

                      {prop.status === 'Submitted' && (
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={ShieldCheck}
                          onClick={() => openAction(prop, 'verify')}
                        >
                          District Verify
                        </Button>
                      )}

                      {(prop.status === 'District Verification' || prop.status === 'State Review') && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={CheckCircle2}
                          onClick={() => openAction(prop, 'approve')}
                        >
                          {prop.status === 'District Verification' ? 'Forward to State' : 'Forward to Central'}
                        </Button>
                      )}

                      {prop.status === 'Central Review' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={CheckCircle2}
                          onClick={() => openAction(prop, 'approve')}
                        >
                          Cabinet Sanction & Approve
                        </Button>
                      )}

                      {prop.status === 'Approved' && (
                        <Button
                          variant="success"
                          size="sm"
                          icon={CheckCircle2}
                          onClick={() => openAction(prop, 'approve')}
                        >
                          Initiate Acquisition
                        </Button>
                      )}

                      {!['Approved', 'Acquisition Initiated', 'Rejected'].includes(prop.status) && (
                        <button
                          type="button"
                          onClick={() => openAction(prop, 'reject')}
                          className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-xs rounded-lg transition-colors border border-rose-200"
                        >
                          Reject
                        </button>
                      )}

                      {/* Dossier Link */}
                      {prop.projectId && (
                        <Link to={`/projects/${prop.projectId}`}>
                          <Button variant="outline" size="sm" icon={ExternalLink}>
                            Dossier
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statutory Workflow Stepper Indicator */}
                <div className="bg-slate-50/70 p-4 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2 flex items-center justify-between">
                    <span>Statutory Approval Pipeline</span>
                    {prop.status === 'Rejected' ? (
                      <span className="text-rose-600 font-bold">REJECTED: {prop.rejectionReason || 'Non-compliant'}</span>
                    ) : (
                      <span className="text-gov-navy font-semibold">
                        Stage {currentIdx + 1} of {WORKFLOW_STAGES.length}: {prop.status}
                      </span>
                    )}
                  </div>

                  {!isRejected ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
                      {WORKFLOW_STAGES.map((stage, idx) => {
                        const isDone = idx < currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div
                            key={stage}
                            className={`p-2 rounded-lg border text-center transition-all ${
                              isCurrent
                                ? 'bg-gov-navy text-white border-gov-navy font-bold shadow-sm'
                                : isDone
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                                : 'bg-white text-slate-400 border-slate-200'
                            }`}
                          >
                            <div className="text-[10px] uppercase tracking-wider font-mono">
                              Step {idx + 1}
                            </div>
                            <div className="text-xs truncate font-medium mt-0.5">{stage}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-center space-x-2">
                      <XCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                      <span>
                        <strong>Proposal Rejected:</strong> {prop.rejectionReason || 'Vetting objections noted by Competent Authority.'}
                      </span>
                    </div>
                  )}

                  {/* Justification quote */}
                  {prop.justification && (
                    <p className="text-[11px] text-slate-500 italic mt-3 border-t border-slate-200/60 pt-2">
                      &ldquo;{prop.justification}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Execution Modal (Verify, Approve, Reject, Submit) */}
      <Modal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={
          actionType === 'submit'
            ? 'Submit Proposal for District Verification'
            : actionType === 'verify'
            ? 'District Revenue Authority Verification'
            : actionType === 'approve'
            ? 'Progress Proposal Approval'
            : 'Reject Acquisition Proposal'
        }
      >
        {selectedProposal && (
          <form onSubmit={handleExecuteAction} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-800">{selectedProposal.projectName}</div>
              <div className="text-slate-500">
                Proposal ID: <strong className="font-mono">{selectedProposal.proposalId}</strong> | Current Status:{' '}
                <strong className="text-gov-navy">{selectedProposal.status}</strong>
              </div>
            </div>

            {actionError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {actionError}
              </div>
            )}

            {actionType === 'approve' && selectedProposal.status === 'Central Review' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  CCEA / Cabinet Sanction Reference Number
                </label>
                <input
                  type="text"
                  required
                  value={actionSanctionRef}
                  onChange={(e) => setActionSanctionRef(e.target.value)}
                  placeholder="e.g. CCEA-MORTH-SANCTION-2024/44"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                {actionType === 'reject' ? 'Statutory Rejection Reason (Mandatory)' : 'Official Endorsement / Remarks'}
              </label>
              <textarea
                rows={3}
                required={actionType === 'reject'}
                value={actionRemarks}
                onChange={(e) => setActionRemarks(e.target.value)}
                placeholder={
                  actionType === 'reject'
                    ? 'State specific statutory conflicts, non-permissible land use, or court injunction...'
                    : 'Enter statutory compliance remarks, alignment clearance, or directives...'
                }
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <Button
                variant="ghost"
                type="button"
                onClick={() => setIsActionModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant={actionType === 'reject' ? 'danger' : 'primary'}
                disabled={actionLoading}
              >
                {actionLoading ? 'Executing...' : 'Confirm Action'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* File New Proposal Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="File New Infrastructure Land Acquisition Proposal"
      >
        <form onSubmit={handleCreateProposal} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          {createError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Project / Corridor Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pune-Nashik Semi High-Speed Rail Alignment Phase 1"
              value={createFormData.projectName}
              onChange={(e) => setCreateFormData({ ...createFormData, projectName: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Project Sector
              </label>
              <select
                value={createFormData.projectType}
                onChange={(e) => setCreateFormData({ ...createFormData, projectType: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
              >
                <option value="Highway">Highway</option>
                <option value="Railway">Railway</option>
                <option value="Industrial Corridor">Industrial Corridor</option>
                <option value="Irrigation">Irrigation</option>
                <option value="Urban Development">Urban Development</option>
                <option value="Renewable Energy">Renewable Energy</option>
                <option value="Defense">Defense</option>
                <option value="Other Infrastructure">Other Infrastructure</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Sponsoring Implementing Agency
              </label>
              <input
                type="text"
                required
                value={createFormData.sponsoringAgency}
                onChange={(e) => setCreateFormData({ ...createFormData, sponsoringAgency: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                State
              </label>
              <input
                type="text"
                required
                value={createFormData.state}
                onChange={(e) => setCreateFormData({ ...createFormData, state: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                District
              </label>
              <input
                type="text"
                required
                value={createFormData.district}
                onChange={(e) => setCreateFormData({ ...createFormData, district: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tehsil
              </label>
              <input
                type="text"
                required
                value={createFormData.tehsil}
                onChange={(e) => setCreateFormData({ ...createFormData, tehsil: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Notified Villages (Comma-separated)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Padgha, Khadavali, Borivali"
              value={createFormData.villages}
              onChange={(e) => setCreateFormData({ ...createFormData, villages: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Required Land Area (Hectares)
              </label>
              <input
                type="number"
                required
                value={createFormData.requiredAreaHectares}
                onChange={(e) => setCreateFormData({ ...createFormData, requiredAreaHectares: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Estimated Project Cost (₹ Crores)
              </label>
              <input
                type="number"
                required
                value={createFormData.estimatedCostInCrores}
                onChange={(e) => setCreateFormData({ ...createFormData, estimatedCostInCrores: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Public Purpose Justification (RFCTLARR Section 2(1))
            </label>
            <textarea
              rows={3}
              required
              value={createFormData.justification}
              onChange={(e) => setCreateFormData({ ...createFormData, justification: e.target.value })}
              placeholder="Explain public purpose, socio-economic benefits, and non-availability of alternative wasteland..."
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createLoading}
            >
              {createLoading ? 'Filing Draft...' : 'File Acquisition Proposal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
