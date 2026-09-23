import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Breadcrumb from '../components/common/Breadcrumb';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StepProgressBar from '../components/common/StepProgressBar';
import {
  FolderKanban,
  FilePlus,
  MapPin,
  Bell,
  Award,
  Calculator,
  Users,
  Home,
  KeyRound,
  FileText,
  Clock,
  History,
  CheckCircle2,
  AlertCircle,
  Shield,
  Send,
  Check,
  X,
  UserCheck,
  Building2,
  Landmark,
  Calendar,
  Layers,
  ArrowRight,
  Download,
  Eye,
  FileCheck2,
  TrendingUp,
  CreditCard
} from 'lucide-react';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [actionMsg, setActionMsg] = useState(null);

  // Modals
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignForm, setAssignForm] = useState({ roleType: 'CALA', officerName: '', officerId: '' });
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({ status: '', currentStage: '', remarks: '' });

  // Proposal Workflow Action Modals
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyForm, setVerifyForm] = useState({ landRecordsStatus: '100% RoR verified with District Bhulekh', remarks: '' });
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Selected Parcel Modal
  const [selectedParcel, setSelectedParcel] = useState(null);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res.success && res.data) {
        setProject(res.data);
        setStatusForm({
          status: res.data.status || 'Active Acquisition',
          currentStage: res.data.currentStage || 'PROPOSAL_SUBMITTED',
          remarks: ''
        });
      }
    } catch (err) {
      console.error('Failed to load project dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  // Handle Officer Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/projects/${id}/assign-officer`, assignForm);
      if (res.success) {
        setActionMsg({ type: 'success', text: res.message });
        setIsAssignModalOpen(false);
        fetchProjectDetails();
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to assign officer' });
    }
  };

  // Handle Status Update
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/projects/${id}/status`, statusForm);
      if (res.success) {
        setActionMsg({ type: 'success', text: res.message });
        setIsStatusModalOpen(false);
        fetchProjectDetails();
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Failed to update status' });
    }
  };

  // Handle Proposal Transitions
  const handleProposalAction = async (actionType) => {
    const proposalId = project?.proposal?.proposalId;
    if (!proposalId) return;

    try {
      let res;
      if (actionType === 'submit') {
        res = await api.post(`/proposals/${proposalId}/submit`);
      } else if (actionType === 'verify') {
        res = await api.post(`/proposals/${proposalId}/verify`, verifyForm);
        setIsVerifyModalOpen(false);
      } else if (actionType === 'approve') {
        res = await api.post(`/proposals/${proposalId}/approve`, { remarks: 'Statutory approval granted.' });
      } else if (actionType === 'reject') {
        res = await api.post(`/proposals/${proposalId}/reject`, { reason: rejectReason });
        setIsRejectModalOpen(false);
      }

      if (res?.success) {
        setActionMsg({ type: 'success', text: res.message });
        fetchProjectDetails();
      }
    } catch (err) {
      setActionMsg({ type: 'error', text: err.message || 'Action execution failed' });
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" fullPage message="Retrieving Corridor Acquisition Dossier..." />;
  }

  if (!project) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <h3 className="text-base font-bold text-slate-800">Corridor Dossier Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">The requested infrastructure project could not be located.</p>
        <Link to="/projects" className="mt-4 inline-block">
          <Button variant="primary" size="sm">Return to Projects Registry</Button>
        </Link>
      </div>
    );
  }

  const pCode = project.projectId || project.projectCode;
  const pName = project.projectName || project.title;
  const pType = project.projectType || project.sector;
  const reqArea = project.requiredLandArea || project.targetAcquisitionAreaHectares || 0;
  const acqArea = project.acquiredLandArea || project.acquiredAreaHectares || 0;
  const pctAcq = reqArea > 0 ? Math.min(100, Math.round((acqArea / reqArea) * 100)) : 0;

  const budget = project.estimatedBudgetCrores || project.estimatedCostInCrores || 0;
  const disbursed = project.compensationDisbursedCrores || 0;
  const pctDisbursed = budget > 0 ? Math.min(100, Math.round((disbursed / budget) * 100)) : 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FolderKanban },
    { id: 'proposal', label: 'Proposal', icon: FilePlus, badge: project.proposal?.status },
    { id: 'parcels', label: 'Land Parcels', icon: MapPin, count: project.landParcels?.length },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: project.notifications?.length },
    { id: 'awards', label: 'Awards', icon: Award, count: project.awards?.length },
    { id: 'compensation', label: 'Compensation', icon: Calculator, count: project.compensations?.length },
    { id: 'families', label: 'Affected Families', icon: Users, count: project.affectedFamilies?.length },
    { id: 'rr', label: 'R&R', icon: Home, count: project.rrCases?.length },
    { id: 'possession', label: 'Possession', icon: KeyRound, count: project.possessions?.length },
    { id: 'documents', label: 'Documents', icon: FileText, count: project.documents?.length },
    { id: 'timeline', label: 'Timeline', icon: Clock, count: project.milestones?.length },
    { id: 'audit', label: 'Audit History', icon: History, count: project.auditLogs?.length }
  ];

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb
        items={[
          { label: 'Projects Registry', to: '/projects' },
          { label: pCode }
        ]}
      />

      {actionMsg && (
        <Alert
          type={actionMsg.type}
          message={actionMsg.text}
          dismissible
          onDismiss={() => setActionMsg(null)}
        />
      )}

      {/* Corridor Dossier Executive Banner */}
      <div className="bg-white rounded-xl shadow-gov border border-slate-200 overflow-hidden">
        <div className="gov-tricolor-stripe" />
        <div className="p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-gov-navy bg-slate-100 px-2.5 py-1 rounded border border-slate-300">
                  {pCode}
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                  {pType}
                </span>
                <Badge status={project.currentStage} />
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {project.status}
                </span>
              </div>

              <h1 className="text-2xl font-black text-slate-900 mt-2">{pName}</h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center space-x-1">
                  <Landmark className="w-3.5 h-3.5 text-slate-400" />
                  <span>{project.ministry}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{project.implementingAgency}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{project.district}, {project.state}</span>
                </span>
              </div>
            </div>

            {/* Officer Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsAssignModalOpen(true)}
                icon={<UserCheck className="w-4 h-4 text-gov-saffron" />}
              >
                Assign Officer
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsStatusModalOpen(true)}
                icon={<Shield className="w-4 h-4 text-white" />}
              >
                Update Status
              </Button>
            </div>
          </div>

          {/* Key Metrics Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-100">
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Required Land Extent</div>
              <div className="text-lg font-black text-slate-900 font-mono mt-0.5">{reqArea} Ha</div>
              <div className="text-xs text-emerald-600 font-bold mt-1">
                Acquired: {acqArea} Ha ({pctAcq}%)
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${pctAcq}%` }} />
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Sanctioned Budget</div>
              <div className="text-lg font-black text-slate-900 font-mono mt-0.5">₹{budget} Cr</div>
              <div className="text-xs text-blue-600 font-bold mt-1">
                Disbursed: ₹{disbursed} Cr ({pctDisbursed}%)
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pctDisbursed}%` }} />
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Survey Parcels & PAFs</div>
              <div className="text-lg font-black text-slate-900 font-mono mt-0.5">
                {project.landParcels?.length || project.khasraCount || 0} Khasras
              </div>
              <div className="text-xs text-slate-600 font-medium mt-1">
                {project.affectedFamilies?.length || project.affectedFamiliesCount || 0} Affected Families (PAFs)
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Competent Authority (CALA)</div>
              <div className="text-xs font-bold text-slate-800 mt-1 truncate">
                {project.assignedOfficers?.calaOfficerName || 'Not Assigned'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                DM: {project.assignedOfficers?.districtOfficerName || 'Collector Thane'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 12-Tab Dossier Navigation */}
      <div className="border-b border-slate-200 bg-white rounded-t-xl px-2 shadow-xs overflow-x-auto">
        <nav className="flex space-x-1 min-w-max p-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                  isActive
                    ? 'bg-gov-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gov-saffron' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded uppercase ${
                      isActive ? 'bg-gov-saffron text-slate-950 font-black' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="bg-white rounded-b-xl border border-t-0 border-slate-200 p-6 shadow-gov min-h-[450px]">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                RFCTLARR Statutory Milestone Progression
              </h3>
              <StepProgressBar currentStage={project.currentStage} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="Corridor Alignment & Jurisdiction" subtitle="Detailed geographic and administrative coverage">
                <div className="space-y-3 text-xs">
                  <p className="text-slate-600 leading-relaxed">{project.description}</p>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <div><span className="font-semibold text-slate-700">State:</span> {project.state}</div>
                    <div><span className="font-semibold text-slate-700">District:</span> {project.district}</div>
                    <div><span className="font-semibold text-slate-700">Tehsil:</span> {project.tehsil}</div>
                    <div><span className="font-semibold text-slate-700">Villages:</span> {project.village}</div>
                  </div>
                </div>
              </Card>

              <Card title="Assigned Statutory Officers" subtitle="Designated authorities under RFCTLARR provisions">
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Competent Authority (CALA/SLAO)</div>
                      <div className="text-slate-600">{project.assignedOfficers?.calaOfficerName || 'Not Assigned'}</div>
                    </div>
                    <Badge variant="success">Active CALA</Badge>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">District Magistrate & Collector</div>
                      <div className="text-slate-600">{project.assignedOfficers?.districtOfficerName || 'District Collector'}</div>
                    </div>
                    <Badge variant="default">Statutory Authority</Badge>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">Senior Revenue Field Surveyor</div>
                      <div className="text-slate-600">{project.assignedOfficers?.surveyorOfficerName || 'Field Amin / Surveyor'}</div>
                    </div>
                    <Badge variant="warning">Cadastral Team</Badge>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: PROPOSAL WORKFLOW */}
        {activeTab === 'proposal' && (
          <div className="space-y-6">
            {project.proposal ? (
              <>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-xs font-bold bg-white px-2.5 py-1 rounded border border-slate-300">
                      {project.proposal.proposalId}
                    </span>
                    <h3 className="text-base font-bold text-gov-navy mt-1">{project.proposal.projectName}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submitted by {project.proposal.submittedBy?.name} ({project.proposal.sponsoringAgency})
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500">Proposal Status:</span>
                    <span className="px-3 py-1 text-xs font-black rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {project.proposal.status}
                    </span>
                  </div>
                </div>

                {/* 7-Stage Proposal Workflow Pipeline */}
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Statutory Proposal Approval Pipeline
                  </h4>
                  {(() => {
                    const steps = [
                      'Draft',
                      'Submitted',
                      'District Verification',
                      'State Review',
                      'Central Review',
                      'Approved',
                      'Acquisition Initiated'
                    ];
                    const currentIdx = steps.indexOf(project.proposal.status);
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                        {steps.map((st, sIdx) => {
                          const isDone = currentIdx >= sIdx;
                          const isCurrent = currentIdx === sIdx;
                          return (
                            <div
                              key={st}
                              className={`p-2.5 rounded-lg border text-center transition-all ${
                                isCurrent
                                  ? 'bg-gov-navy text-white border-gov-navy shadow-sm'
                                  : isDone
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-slate-50 text-slate-400 border-slate-200'
                              }`}
                            >
                              <div className="text-[10px] font-bold">Step {sIdx + 1}</div>
                              <div className="text-xs font-bold mt-0.5 leading-tight">{st}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* Verification & Review Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card title="District Verification" subtitle="Collector / DM Review">
                    <div className="text-xs text-slate-600 space-y-2">
                      <p><span className="font-semibold">Verified By:</span> {project.proposal.districtVerification?.verifiedBy || 'Pending'}</p>
                      <p><span className="font-semibold">Land Records:</span> {project.proposal.districtVerification?.landRecordsStatus || 'Under verification'}</p>
                      <p><span className="font-semibold">Remarks:</span> {project.proposal.districtVerification?.remarks || 'Awaiting field report'}</p>
                    </div>
                  </Card>

                  <Card title="State Review" subtitle="Revenue Department / Commissioner">
                    <div className="text-xs text-slate-600 space-y-2">
                      <p><span className="font-semibold">Reviewed By:</span> {project.proposal.stateReview?.reviewedBy || 'Pending'}</p>
                      <p><span className="font-semibold">SIA Review:</span> {project.proposal.stateReview?.siaFeasibilityStatus || 'Pending'}</p>
                      <p><span className="font-semibold">Remarks:</span> {project.proposal.stateReview?.remarks || 'Awaiting state committee'}</p>
                    </div>
                  </Card>

                  <Card title="Central Sanction" subtitle="MoRTH / MoRD National Sanction">
                    <div className="text-xs text-slate-600 space-y-2">
                      <p><span className="font-semibold">Sanction Ref:</span> {project.proposal.centralReview?.cabinetSanctionRef || 'Pending'}</p>
                      <p><span className="font-semibold">Reviewed By:</span> {project.proposal.centralReview?.reviewedBy || 'Pending'}</p>
                      <p><span className="font-semibold">Remarks:</span> {project.proposal.centralReview?.remarks || 'Under ministry appraisal'}</p>
                    </div>
                  </Card>
                </div>

                {/* Proposal Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 justify-end">
                  {project.proposal.status === 'Draft' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleProposalAction('submit')}
                      icon={<Send className="w-4 h-4" />}
                    >
                      Submit Proposal
                    </Button>
                  )}

                  {project.proposal.status === 'Submitted' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsVerifyModalOpen(true)}
                      icon={<CheckCircle2 className="w-4 h-4" />}
                    >
                      District Verification (DM)
                    </Button>
                  )}

                  {(project.proposal.status === 'District Verification' ||
                    project.proposal.status === 'State Review' ||
                    project.proposal.status === 'Central Review' ||
                    project.proposal.status === 'Approved') && (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => handleProposalAction('approve')}
                      icon={<Check className="w-4 h-4" />}
                    >
                      Advance / Approve Proposal
                    </Button>
                  )}

                  {project.proposal.status !== 'Rejected' && project.proposal.status !== 'Acquisition Initiated' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setIsRejectModalOpen(true)}
                      icon={<X className="w-4 h-4" />}
                    >
                      Reject Proposal
                    </Button>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No statutory proposal record found for this project corridor.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LAND PARCELS */}
        {activeTab === 'parcels' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Khasra Survey Land Registry ({project.landParcels?.length || 0})
              </h3>
              <Link to="/gis-map" className="text-xs font-bold text-gov-navy hover:underline flex items-center">
                View Cadastral GIS Map <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Khasra No</th>
                    <th className="py-2.5 px-3">Village</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Area (Ha)</th>
                    <th className="py-2.5 px-3">Circle Rate / Ha</th>
                    <th className="py-2.5 px-3">Market Value</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.landParcels && project.landParcels.length > 0 ? (
                    project.landParcels.map((parcel) => (
                      <tr key={parcel._id || parcel.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-gov-navy">{parcel.khasraNumber}</td>
                        <td className="py-2.5 px-3">{parcel.village}</td>
                        <td className="py-2.5 px-3 text-slate-600">{parcel.landCategory}</td>
                        <td className="py-2.5 px-3 font-mono font-semibold">{parcel.acquiredAreaHectares}</td>
                        <td className="py-2.5 px-3 font-mono">₹{(parcel.circleRatePerHectare / 100000).toFixed(1)}L</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          ₹{(parcel.marketValuePerHectare / 100000).toFixed(1)}L
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            {parcel.acquisitionStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => setSelectedParcel(parcel)}
                            className="p-1 text-slate-600 hover:text-gov-navy rounded hover:bg-slate-100"
                            title="Inspect Parcel Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-6 text-center text-slate-400">
                        No Khasra parcels recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Statutory Gazette Decrees ({project.notifications?.length || 0})
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Gazette Number</th>
                    <th className="py-2.5 px-3">Statutory Section</th>
                    <th className="py-2.5 px-3">Gazette Date</th>
                    <th className="py-2.5 px-3">Area (Ha)</th>
                    <th className="py-2.5 px-3">Villages</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Gazette PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.notifications && project.notifications.length > 0 ? (
                    project.notifications.map((notif) => (
                      <tr key={notif._id || notif.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-gov-navy">{notif.notificationNumber}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{notif.section}</td>
                        <td className="py-2.5 px-3">{new Date(notif.gazetteDate).toLocaleDateString()}</td>
                        <td className="py-2.5 px-3 font-mono">{notif.totalAreaHectares} Ha</td>
                        <td className="py-2.5 px-3 text-slate-600">{notif.affectedVillages?.join(', ')}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="success">{notif.status}</Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <a
                            href={notif.documentUrl || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-gov-navy hover:underline font-bold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-slate-400">
                        No statutory notifications issued.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: AWARDS */}
        {activeTab === 'awards' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Section 23 & 30 Land Acquisition Awards ({project.awards?.length || 0})
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Award No</th>
                    <th className="py-2.5 px-3">Award Date</th>
                    <th className="py-2.5 px-3">Passed By</th>
                    <th className="py-2.5 px-3">Base Land Value</th>
                    <th className="py-2.5 px-3">100% Solatium</th>
                    <th className="py-2.5 px-3">Total Award</th>
                    <th className="py-2.5 px-3">Digital Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.awards && project.awards.length > 0 ? (
                    project.awards.map((awd) => (
                      <tr key={awd._id || awd.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-gov-navy">{awd.awardNumber}</td>
                        <td className="py-2.5 px-3">{new Date(awd.awardDate).toLocaleDateString()}</td>
                        <td className="py-2.5 px-3 text-slate-700">{awd.passedBy}</td>
                        <td className="py-2.5 px-3 font-mono">₹{(awd.assessedLandMarketValue / 10000000).toFixed(2)} Cr</td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">
                          ₹{(awd.solatiumAmount / 10000000).toFixed(2)} Cr
                        </td>
                        <td className="py-2.5 px-3 font-mono font-black text-slate-900">
                          ₹{(awd.totalAwardAmount / 10000000).toFixed(2)} Cr
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 truncate max-w-[140px]">
                          {awd.digitalSignatureHash}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-slate-400">
                        No awards determined yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: COMPENSATION & PFMS DBT */}
        {activeTab === 'compensation' && (
          <div className="space-y-4">
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
              <span>
                Statutory Arithmetic: <strong>Total = (Assessed Market Value × Multiplication Factor) + Assets + 100% Solatium + 12% Interest</strong>
              </span>
              <Badge variant="warning">PFMS Mandate</Badge>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Khasra</th>
                    <th className="py-2.5 px-3">Beneficiary</th>
                    <th className="py-2.5 px-3">Bank Details</th>
                    <th className="py-2.5 px-3">Solatium</th>
                    <th className="py-2.5 px-3">Total Payable</th>
                    <th className="py-2.5 px-3">PFMS Ref</th>
                    <th className="py-2.5 px-3">DBT Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.compensations && project.compensations.length > 0 ? (
                    project.compensations.map((cmp) => (
                      <tr key={cmp._id || cmp.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-gov-navy">{cmp.khasraNumber}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{cmp.beneficiaryName}</td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600">
                          {cmp.bankName} • {cmp.bankAccountNumber}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-emerald-700">₹{(cmp.solatiumAmount / 100000).toFixed(1)}L</td>
                        <td className="py-2.5 px-3 font-mono font-black text-slate-900">
                          ₹{(cmp.totalCompensationPayable / 100000).toFixed(1)}L
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500">{cmp.pfmsReferenceNumber}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              cmp.paymentStatus === 'DBT Disbursed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {cmp.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-slate-400">
                        No compensation records available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: AFFECTED FAMILIES (PAFS) */}
        {activeTab === 'families' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Project Affected Families (PAFs) Census ({project.affectedFamilies?.length || 0})
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">PAF Reg ID</th>
                    <th className="py-2.5 px-3">Head of Family</th>
                    <th className="py-2.5 px-3">Members</th>
                    <th className="py-2.5 px-3">Social Category</th>
                    <th className="py-2.5 px-3">Loss Type</th>
                    <th className="py-2.5 px-3">R&R Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.affectedFamilies && project.affectedFamilies.length > 0 ? (
                    project.affectedFamilies.map((fam) => (
                      <tr key={fam._id || fam.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-gov-navy">{fam.familyRegistrationId}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{fam.familyHeadName}</td>
                        <td className="py-2.5 px-3 font-mono">{fam.membersCount}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {fam.vulnerabilityCategory}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{fam.lossCategory}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="success">{fam.status}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-6 text-center text-slate-400">
                        No affected families registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: R&R SCHEMES */}
        {activeTab === 'rr' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Second Schedule Rehabilitation & Resettlement Cases ({project.rrCases?.length || 0})
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">R&R Case</th>
                    <th className="py-2.5 px-3">Beneficiary</th>
                    <th className="py-2.5 px-3">House Allotted</th>
                    <th className="py-2.5 px-3">Subsistence (₹3k/mo)</th>
                    <th className="py-2.5 px-3">Transport Grant</th>
                    <th className="py-2.5 px-3">Livelihood Package</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.rrCases && project.rrCases.length > 0 ? (
                    project.rrCases.map((rrc) => (
                      <tr key={rrc._id || rrc.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-gov-navy">{rrc.rrCaseNumber}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{rrc.familyHeadName}</td>
                        <td className="py-2.5 px-3">
                          {rrc.resettlementHouseAllotted ? (
                            <span className="text-emerald-700 font-bold">Yes ({rrc.allottedPlotNumber})</span>
                          ) : (
                            <span className="text-slate-400">Cash Grant</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono">₹{rrc.subsistenceAllowanceAmount}</td>
                        <td className="py-2.5 px-3 font-mono">₹{rrc.transportationAllowanceAmount}</td>
                        <td className="py-2.5 px-3 text-slate-700">{rrc.livelihoodSettlement}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="success">{rrc.caseStatus}</Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-slate-400">
                        No R&R cases recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 9: POSSESSION HANDOVER */}
        {activeTab === 'possession' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Section 38 Physical Possession & Form 11 Certificates ({project.possessions?.length || 0})
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Certificate No</th>
                    <th className="py-2.5 px-3">Sec 38 Notice Date</th>
                    <th className="py-2.5 px-3">Handover Date</th>
                    <th className="py-2.5 px-3">Handed Over Area</th>
                    <th className="py-2.5 px-3">Officer in Charge</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Form 11</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.possessions && project.possessions.length > 0 ? (
                    project.possessions.map((pos) => (
                      <tr key={pos._id || pos.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-gov-navy">{pos.possessionCertificateNumber}</td>
                        <td className="py-2.5 px-3">{new Date(pos.section38NoticeDate).toLocaleDateString()}</td>
                        <td className="py-2.5 px-3">
                          {pos.handoverToAgencyDate ? new Date(pos.handoverToAgencyDate).toLocaleDateString() : 'Pending'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold">{pos.totalAreaHandedOverHectares} Ha</td>
                        <td className="py-2.5 px-3 text-slate-700">{pos.officerInCharge}</td>
                        <td className="py-2.5 px-3">
                          <Badge variant="success">{pos.status}</Badge>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <a
                            href={pos.form11CertificateUrl || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-gov-navy hover:underline font-bold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Form 11</span>
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-6 text-center text-slate-400">
                        No possession records registered.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 10: DOCUMENTS REPOSITORY */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Statutory Official Archive ({project.documents?.length || 0})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.documents && project.documents.length > 0 ? (
                project.documents.map((doc) => (
                  <div key={doc._id || doc.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {doc.documentType}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-1">{doc.title}</h4>
                      <div className="text-[11px] text-slate-500">
                        Section: {doc.statutorySection || 'General'} • {doc.fileSize}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Uploaded by: {doc.uploadedBy}
                      </div>
                    </div>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded bg-white hover:bg-gov-navy hover:text-white border border-slate-200 transition-colors"
                      title="Download Official Document"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-slate-400 text-xs">
                  No documents in repository.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 11: STATUTORY LIFECYCLE TIMELINE */}
        {activeTab === 'timeline' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Statutory Benchmark Timeline (RFCTLARR Section 4 to 38)
            </h3>

            <div className="relative border-l-2 border-gov-navy/30 ml-4 space-y-6 pl-6 py-2">
              {project.milestones && project.milestones.length > 0 ? (
                project.milestones.map((m, idx) => {
                  const isCompleted = m.status === 'Completed';
                  const isPending = m.status === 'Pending';
                  return (
                    <div key={m._id || m.id || idx} className="relative">
                      <div
                        className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                          isCompleted ? 'bg-emerald-500' : isPending ? 'bg-slate-300' : 'bg-amber-500 animate-pulse'
                        }`}
                      />
                      <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-gov-navy">
                            {m.statutoryReference}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isPending
                                ? 'bg-slate-200 text-slate-600'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                        <div className="text-[11px] text-slate-500 flex flex-wrap gap-4">
                          <span>Target: {new Date(m.targetDate).toLocaleDateString()}</span>
                          {m.actualDate && (
                            <span className="text-emerald-700 font-medium">
                              Completed: {new Date(m.actualDate).toLocaleDateString()}
                            </span>
                          )}
                          <span>Officer: {m.actionOfficer || 'CALA & Collector'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-slate-400 text-xs">No milestones configured.</div>
              )}
            </div>
          </div>
        )}

        {/* TAB 12: IMMUTABLE AUDIT HISTORY */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Immutable Statutory Audit Ledger ({project.auditLogs?.length || 0} Events)
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Officer</th>
                    <th className="py-2.5 px-3">Statutory Role</th>
                    <th className="py-2.5 px-3">Action Code</th>
                    <th className="py-2.5 px-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {project.auditLogs && project.auditLogs.length > 0 ? (
                    project.auditLogs.map((log) => (
                      <tr key={log._id || log.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{log.userName}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {log.userRole}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-gov-navy">{log.action}</td>
                        <td className="py-2.5 px-3 text-slate-600 leading-relaxed">{log.description}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-slate-400">
                        No audit records recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: ASSIGN OFFICER */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Statutory Officer to Corridor"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Officer Role Type
            </label>
            <select
              value={assignForm.roleType}
              onChange={(e) => setAssignForm({ ...assignForm, roleType: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="CALA">Competent Authority for Land Acquisition (CALA)</option>
              <option value="DISTRICT_AUTHORITY">District Magistrate & Collector</option>
              <option value="SURVEYOR">Revenue Amin & Field Surveyor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Officer Full Name & Designation
            </label>
            <Input
              type="text"
              required
              value={assignForm.officerName}
              onChange={(e) => setAssignForm({ ...assignForm, officerName: e.target.value })}
              placeholder="e.g. Shri Suresh K. Patil, Deputy Collector"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: UPDATE STATUS */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="Update Corridor Statutory Status"
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Operational Status
            </label>
            <select
              value={statusForm.status}
              onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="Active Acquisition">Active Acquisition</option>
              <option value="Under Verification">Under Verification</option>
              <option value="Awards Passed">Awards Passed</option>
              <option value="Possession Taken">Possession Taken</option>
              <option value="On Hold">On Hold</option>
              <option value="Litigation Flagged">Litigation Flagged</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              RFCTLARR Statutory Stage
            </label>
            <select
              value={statusForm.currentStage}
              onChange={(e) => setStatusForm({ ...statusForm, currentStage: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs"
            >
              <option value="PROPOSAL_SUBMITTED">Proposal Submitted</option>
              <option value="SIA_INITIATED">SIA Initiated</option>
              <option value="SIA_APPROVED">SIA Approved</option>
              <option value="SECTION_11_NOTIFIED">Section 11 Preliminary Notified</option>
              <option value="SECTION_15_OBJECTIONS_REVIEWED">Section 15 Objections Reviewed</option>
              <option value="SECTION_19_DECLARED">Section 19 Declared</option>
              <option value="SECTION_23_AWARD_PASSED">Section 23 Award Passed</option>
              <option value="COMPENSATION_DISBURSED">Compensation Disbursed</option>
              <option value="RR_SETTLED">R&R Settled</option>
              <option value="POSSESSION_TAKEN">Section 38 Possession Taken</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Statutory Remarks / Gazette Ref
            </label>
            <Input
              type="text"
              value={statusForm.remarks}
              onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })}
              placeholder="e.g. Gazette Notification S.O. 1245(E) gazetted"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Update Status
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL: DISTRICT VERIFY PROPOSAL */}
      <Modal
        isOpen={isVerifyModalOpen}
        onClose={() => setIsVerifyModalOpen(false)}
        title="District Authority Land Verification"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900">
            As District Collector / Competent Authority, verify that proposed alignment land records conform with RoR registers and social impact feasibility.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Land Records Verification Status
            </label>
            <Input
              type="text"
              value={verifyForm.landRecordsStatus}
              onChange={(e) => setVerifyForm({ ...verifyForm, landRecordsStatus: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Collectorate Remarks
            </label>
            <Input
              type="text"
              value={verifyForm.remarks}
              onChange={(e) => setVerifyForm({ ...verifyForm, remarks: e.target.value })}
              placeholder="e.g. Land verified, recommended for State Government review."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsVerifyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={() => handleProposalAction('verify')}>
              Confirm Verification
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: REJECT PROPOSAL */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Acquisition Proposal"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-900">
            A formal rejection reason is mandatory under RFCTLARR Act transparency guidelines and will be logged in the public audit trail.
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Statutory Rejection Reason
            </label>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
              placeholder="Provide detailed statutory reason for rejecting proposal..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={() => handleProposalAction('reject')}>
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>

      {/* MODAL: PARCEL DETAILS */}
      {selectedParcel && (
        <Modal
          isOpen={!!selectedParcel}
          onClose={() => setSelectedParcel(null)}
          title={`Khasra Parcel ${selectedParcel.khasraNumber} Dossier`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div><span className="font-semibold text-slate-500">Village:</span> {selectedParcel.village}</div>
              <div><span className="font-semibold text-slate-500">Tehsil:</span> {selectedParcel.tehsil}</div>
              <div><span className="font-semibold text-slate-500">District:</span> {selectedParcel.district}</div>
              <div><span className="font-semibold text-slate-500">State:</span> {selectedParcel.state}</div>
              <div><span className="font-semibold text-slate-500">Acquired Extent:</span> {selectedParcel.acquiredAreaHectares} Ha</div>
              <div><span className="font-semibold text-slate-500">Land Category:</span> {selectedParcel.landCategory}</div>
              <div><span className="font-semibold text-slate-500">Circle Rate:</span> ₹{(selectedParcel.circleRatePerHectare / 100000).toFixed(2)} Lakh / Ha</div>
              <div><span className="font-semibold text-slate-500">Assessed Value:</span> ₹{(selectedParcel.marketValuePerHectare / 100000).toFixed(2)} Lakh / Ha</div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider mb-2">Registered Landowners (RoR 7/12)</h4>
              <div className="space-y-2">
                {selectedParcel.owners?.map((o, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{o.name}</span>
                      <span className="font-mono text-emerald-700">{o.sharePercentage}% Share</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>Aadhaar: {o.aadhaarMasked}</span>
                      {o.contactPhone && <span>Phone: {o.contactPhone}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" size="sm" onClick={() => setSelectedParcel(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
