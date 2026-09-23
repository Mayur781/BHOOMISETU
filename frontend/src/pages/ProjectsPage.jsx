import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/common/Badge';
import StepProgressBar from '../components/common/StepProgressBar';
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  Layers,
  MapPin,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  X,
  AlertCircle
} from 'lucide-react';

import { useNavigate, Link } from 'react-router-dom';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { projects, activeProjectId, setActiveProjectId, refreshProjects } = useProject();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [selectedProjectForAdvance, setSelectedProjectForAdvance] = useState(null);
  const [nextStage, setNextStage] = useState('');
  const [advanceRemarks, setAdvanceRemarks] = useState('');
  const [advanceLoading, setAdvanceLoading] = useState(false);

  // New Project Form State
  const [formData, setFormData] = useState({
    projectCode: '',
    projectName: '',
    title: '',
    projectType: 'Highway',
    sector: 'Highway',
    implementingAgency: 'NHAI (National Highways Authority of India)',
    ministry: 'Ministry of Road Transport and Highways (MoRTH)',
    state: 'Maharashtra',
    district: 'Thane',
    tehsil: 'Bhiwandi',
    village: 'Padgha',
    alignmentLengthKm: 120,
    totalProjectArea: 450,
    requiredLandArea: 320,
    targetAcquisitionAreaHectares: 320,
    estimatedBudgetCrores: 5800,
    startDate: new Date().toISOString().split('T')[0],
    expectedCompletionDate: new Date(Date.now() + 730 * 86400000).toISOString().split('T')[0],
    purpose: 'Infrastructure corridor under PM GatiShakti National Master Plan'
  });

  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const sectors = [
    'ALL',
    'Highway',
    'Railway',
    'Industrial Corridor',
    'Irrigation',
    'Urban Development',
    'Renewable Energy',
    'Defense',
    'Other Infrastructure'
  ];

  const filteredProjects = projects.filter((p) => {
    const matchesSector =
      selectedSector === 'ALL' ||
      p.projectType === selectedSector ||
      p.sector === selectedSector ||
      (selectedSector === 'Highway' && p.sector === 'National Highways') ||
      (selectedSector === 'Railway' && p.sector === 'Dedicated Freight Corridor') ||
      (selectedSector === 'Renewable Energy' && p.sector?.includes('Renewable')) ||
      (selectedSector === 'Urban Development' && p.sector?.includes('Urban'));
    const matchesSearch =
      (p.projectName || p.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.projectCode || p.projectId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.state || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.district || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSector && matchesSearch;
  });

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    try {
      const payload = {
        ...formData,
        projectName: formData.projectName || formData.title,
        title: formData.title || formData.projectName,
        projectType: formData.projectType || formData.sector,
        sector: formData.sector || formData.projectType,
        totalProjectArea: Number(formData.totalProjectArea || formData.requiredLandArea || formData.targetAcquisitionAreaHectares),
        requiredLandArea: Number(formData.requiredLandArea || formData.targetAcquisitionAreaHectares),
        targetAcquisitionAreaHectares: Number(formData.requiredLandArea || formData.targetAcquisitionAreaHectares),
        status: 'Active Acquisition',
        currentStage: 'PROPOSAL_SUBMITTED'
      };
      const res = await api.post('/projects', payload);
      if (res.success) {
        setIsCreateModalOpen(false);
        setFormData({
          projectCode: '',
          projectName: '',
          title: '',
          projectType: 'Highway',
          sector: 'Highway',
          implementingAgency: 'NHAI (National Highways Authority of India)',
          ministry: 'Ministry of Road Transport and Highways (MoRTH)',
          state: 'Maharashtra',
          district: 'Thane',
          tehsil: 'Bhiwandi',
          village: 'Padgha',
          alignmentLengthKm: 120,
          totalProjectArea: 450,
          requiredLandArea: 320,
          targetAcquisitionAreaHectares: 320,
          estimatedBudgetCrores: 5800,
          startDate: new Date().toISOString().split('T')[0],
          expectedCompletionDate: new Date(Date.now() + 730 * 86400000).toISOString().split('T')[0],
          purpose: ''
        });
        await refreshProjects();
      } else {
        setFormError(res.message || 'Failed to register project.');
      }
    } catch (err) {
      setFormError(err.message || 'Project registration failed.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAdvanceStage = async (e) => {
    e.preventDefault();
    if (!selectedProjectForAdvance || !nextStage) return;
    setAdvanceLoading(true);

    try {
      const projId = selectedProjectForAdvance._id || selectedProjectForAdvance.id;
      const res = await api.post(`/projects/${projId}/advance-stage`, {
        stage: nextStage,
        remarks: advanceRemarks
      });
      if (res.success) {
        setIsAdvanceModalOpen(false);
        setSelectedProjectForAdvance(null);
        setNextStage('');
        setAdvanceRemarks('');
        await refreshProjects();
      }
    } catch (err) {
      alert(err.message || 'Failed to advance stage');
    } finally {
      setAdvanceLoading(false);
    }
  };

  const stagesList = [
    'PROPOSAL_SUBMITTED',
    'SIA_INITIATED',
    'SECTION_11_NOTIFIED',
    'SECTION_15_OBJECTIONS_REVIEWED',
    'SECTION_19_DECLARED',
    'SECTION_23_AWARD_PASSED',
    'COMPENSATION_DISBURSED',
    'RR_SETTLED',
    'POSSESSION_TAKEN'
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & New Proposal Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              Corridor Master Registry
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {projects.length} Statutory Infrastructure Projects Enrolled
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            National Infrastructure Projects & Acquisition Dossiers
          </h1>
          <p className="text-xs text-slate-500">
            Monitor corridor hectarage, alignment lengths, statutory milestones, and compensation budgets
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gov-navy hover:bg-gov-navyLight text-white rounded-lg text-xs font-bold transition-all shadow-gov"
        >
          <Plus className="w-4 h-4 text-gov-saffron" />
          <span>Submit Project Proposal</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-gov flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by project name, corridor code, or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gov-navy"
          />
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 flex-shrink-0" />
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSector === sec
                  ? 'bg-gov-navy text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((p) => {
          const isActive = (p._id || p.id) === activeProjectId;
          return (
            <div
              key={p._id || p.id}
              className={`bg-white rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-gov hover:shadow-gov-md ${
                isActive ? 'ring-2 ring-gov-navy border-gov-navy' : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-bold text-gov-navy bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    {p.projectCode}
                  </span>
                  <Badge status={p.currentStage} />
                </div>

                <h3 className="text-base font-black text-slate-900 mt-3 leading-snug">
                  {p.title}
                </h3>
                <div className="flex items-center text-xs text-slate-500 mt-1 space-x-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.implementingAgency}</span>
                </div>
              </div>

              {/* Card Stats Grid */}
              <div className="p-5 bg-slate-50/50 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Target Area</div>
                    <div className="font-black text-slate-900 text-sm mt-0.5">
                      {p.targetAcquisitionAreaHectares} Ha
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      Acquired: {p.acquiredAreaHectares || 0} Ha
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Sanctioned Budget</div>
                    <div className="font-black text-slate-900 text-sm mt-0.5">
                      ₹{p.totalCompensationSanctionedCrores || p.estimatedBudgetCrores} Cr
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                      Disbursed: ₹{p.compensationDisbursedCrores || 0} Cr
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-600 pt-1">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{p.state} ({p.district})</span>
                  </div>
                  <div>Length: <span className="font-semibold text-slate-800">{p.alignmentLengthKm} km</span></div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
                <button
                  onClick={() => {
                    setActiveProjectId(p._id || p.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-slate-100 hover:bg-gov-navy hover:text-white text-slate-700'
                  }`}
                >
                  {isActive ? '✓ Active Corridor' : 'Select Corridor'}
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => {
                      setSelectedProjectForAdvance(p);
                      setIsAdvanceModalOpen(true);
                    }}
                    className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-bold transition-colors"
                    title="Advance statutory stage under RFCTLARR Act"
                  >
                    Advance Stage
                  </button>

                  <button
                    onClick={() => {
                      setActiveProjectId(p._id || p.id);
                      navigate('/gis-map');
                    }}
                    className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-gov-navy rounded-lg transition-colors"
                    title="View on Cadastral GIS Map"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Advance Stage Modal */}
      {isAdvanceModalOpen && selectedProjectForAdvance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-gov-navy text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Advance RFCTLARR Statutory Stage</h3>
                <p className="text-xs text-slate-300">
                  {selectedProjectForAdvance.projectCode} - {selectedProjectForAdvance.title}
                </p>
              </div>
              <button
                onClick={() => setIsAdvanceModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdvanceStage} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Current Stage
                </label>
                <div className="p-2.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-800">
                  {selectedProjectForAdvance.currentStage}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Target Statutory Stage
                </label>
                <select
                  required
                  value={nextStage}
                  onChange={(e) => setNextStage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                >
                  <option value="">Select Milestone to Advance...</option>
                  {stagesList.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Officer Statutory Order & Remarks
                </label>
                <textarea
                  required
                  rows={3}
                  value={advanceRemarks}
                  onChange={(e) => setAdvanceRemarks(e.target.value)}
                  placeholder="Record Collector / CALA statutory gazette decree or proceeding reference number..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdvanceModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={advanceLoading}
                  className="px-4 py-2 bg-gov-navy hover:bg-gov-navyLight text-white font-bold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {advanceLoading ? 'Promulgating...' : 'Promulgate Statutory Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden">
            <div className="bg-gov-navy text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Submit New Land Acquisition Proposal (Section 3A)</h3>
                <p className="text-xs text-slate-300">Enroll new national infrastructure alignment into BhoomiSetu</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateProject} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Project Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. NHAI-PKG-04"
                    value={formData.projectCode}
                    onChange={(e) => setFormData({ ...formData, projectCode: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Project Type / Sector
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value, sector: e.target.value })}
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Corridor / Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai-Goa Expressway Coastal Extension Package III"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value, projectName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Implementing Agency
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.implementingAgency}
                    onChange={(e) => setFormData({ ...formData, implementingAgency: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Sponsoring Ministry
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ministry}
                    onChange={(e) => setFormData({ ...formData, ministry: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
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
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tehsil / Taluka
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.tehsil}
                    onChange={(e) => setFormData({ ...formData, tehsil: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Village / Sector
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Total Project Area (Ha)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.totalProjectArea}
                    onChange={(e) => setFormData({ ...formData, totalProjectArea: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Required Land Area (Ha)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.requiredLandArea}
                    onChange={(e) => setFormData({ ...formData, requiredLandArea: Number(e.target.value), targetAcquisitionAreaHectares: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Estimated Budget (₹ Cr)
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.estimatedBudgetCrores}
                    onChange={(e) => setFormData({ ...formData, estimatedBudgetCrores: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Statutory Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={formData.expectedCompletionDate}
                    onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Statutory Public Purpose (RFCTLARR Sec 2(1))
                </label>
                <textarea
                  rows={2}
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Specify strategic infrastructure necessity under RFCTLARR Act..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-gov-navy outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-gov-navy hover:bg-gov-navyLight text-white font-bold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {formLoading ? 'Submitting...' : 'Register Project Corridor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
