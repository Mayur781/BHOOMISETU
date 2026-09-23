import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/common/Badge';
import StepProgressBar from '../components/common/StepProgressBar';
import {
  FileCheck2,
  Clock,
  AlertTriangle,
  Send,
  Plus,
  Calendar,
  Building,
  CheckCircle2,
  FileText,
  HelpCircle,
  X,
  Scroll,
  Newspaper,
  ShieldCheck
} from 'lucide-react';

export default function StatutoryPage() {
  const { user } = useAuth();
  const { activeProject, activeProjectId } = useProject();
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isPublishSec11Open, setIsPublishSec11Open] = useState(false);
  const [isObjectionOpen, setIsObjectionOpen] = useState(false);
  const [isDeclareSec19Open, setIsDeclareSec19Open] = useState(false);

  // Sec 11 Form
  const [sec11Data, setSec11Data] = useState({
    notificationNumber: `SEC11/MORTH/${Date.now().toString().slice(-5)}`,
    newspaperHindi: 'Dainik Jagran (State Edition)',
    newspaperEnglish: 'The Times of India (National Edition)',
    stateGazetteRef: 'Maharashtra Official Gazette Part I-A Extraordinary'
  });

  // Sec 15 Objection Form
  const [objectionData, setObjectionData] = useState({
    petitionerName: '',
    khasraNumber: '',
    objectionType: 'Measurement / Boundary Area Discrepancy',
    description: ''
  });

  // Sec 19 Form
  const [sec19Data, setSec19Data] = useState({
    declarationNumber: `SEC19/MAH/${Date.now().toString().slice(-5)}`,
    stateGazetteRef: 'Official State Gazette Part I-A No. 492'
  });

  const [actionLoading, setActionLoading] = useState(false);

  const fetchTimeline = async () => {
    if (!activeProjectId) return;
    try {
      setLoading(true);
      const res = await api.get(`/statutory/${activeProjectId}`);
      if (res.success && res.data) {
        setTimelineData(res.data);
      }
    } catch (err) {
      console.error('Failed to load statutory timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [activeProjectId]);

  const handlePublishSec11 = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/statutory/section-11/publish', {
        projectId: activeProjectId,
        ...sec11Data
      });
      if (res.success) {
        setIsPublishSec11Open(false);
        await fetchTimeline();
      }
    } catch (err) {
      alert(err.message || 'Failed to publish Section 11');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileObjection = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const stage = (timelineData?.stages || []).find((s) => s.stageCode.includes('11') || s.stageCode.includes('15')) || timelineData?.stages?.[0];
      const stageId = stage?._id || stage?.id || 'stage_sec15_01';

      const res = await api.post('/statutory/objection', {
        stageId,
        ...objectionData
      });
      if (res.success) {
        setIsObjectionOpen(false);
        setObjectionData({
          petitionerName: '',
          khasraNumber: '',
          objectionType: 'Measurement / Boundary Area Discrepancy',
          description: ''
        });
        await fetchTimeline();
      }
    } catch (err) {
      alert(err.message || 'Failed to record objection');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclareSec19 = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post('/statutory/section-19/declare', {
        projectId: activeProjectId,
        ...sec19Data
      });
      if (res.success) {
        setIsDeclareSec19Open(false);
        await fetchTimeline();
      }
    } catch (err) {
      alert(err.message || 'Failed to issue Section 19 declaration');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              RFCTLARR Act 2013 Statutory Pipeline
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Corridor: {activeProject?.title}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Statutory Notifications, Gazette Promulgation & Objections Desk
          </h1>
          <p className="text-xs text-slate-500">
            Enforced statutory SLA tracking from Section 4 SIA to Section 19 Declaration and Section 23 Award
          </p>
        </div>

        {/* Statutory Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap">
          <button
            onClick={() => setIsPublishSec11Open(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Publish Sec 11 Gazette</span>
          </button>

          <button
            onClick={() => setIsObjectionOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Record Sec 15 Objection</span>
          </button>

          <button
            onClick={() => setIsDeclareSec19Open(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-gov-navy hover:bg-gov-navyLight text-white rounded-lg text-xs font-bold transition-all shadow-sm"
          >
            <Scroll className="w-3.5 h-3.5 text-gov-saffron" />
            <span>Declare Sec 19</span>
          </button>
        </div>
      </div>

      {/* Corridor Statutory Progress Bar */}
      {activeProject && <StepProgressBar currentStage={activeProject.currentStage} />}

      {/* Statutory SLA Clocks & Legal Provisions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-gov">
          <div className="flex items-center justify-between text-xs font-bold text-purple-900 mb-1">
            <span>Section 14 Statutory Clock</span>
            <span className="bg-purple-100 px-2 py-0.5 rounded text-purple-700 font-mono">12 Months Max</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Section 19 Declaration must be promulgated within 12 months of Section 11 preliminary publication, failing which proceedings lapse.
          </p>
          <div className="mt-3 flex items-center text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            <span>Active corridor is SLA compliant</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-gov">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 mb-1">
            <span>Section 15 Citizen Objections</span>
            <span className="bg-amber-100 px-2 py-0.5 rounded text-amber-800 font-mono">60 Days Window</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Mandatory opportunity for all interested persons to raise objections on area measurement, public purpose justification, or R&R.
          </p>
          <div className="mt-3 flex items-center text-xs text-amber-700 font-semibold">
            <Clock className="w-4 h-4 mr-1" />
            <span>Public hearing desk open at CALA office</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-gov">
          <div className="flex items-center justify-between text-xs font-bold text-blue-900 mb-1">
            <span>Section 25 Statutory Award</span>
            <span className="bg-blue-100 px-2 py-0.5 rounded text-blue-800 font-mono">12 Months Max</span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Final award under Section 23 must be passed within 12 months from the date of publication of Section 19 declaration.
          </p>
          <div className="mt-3 flex items-center text-xs text-blue-700 font-semibold">
            <ShieldCheck className="w-4 h-4 mr-1" />
            <span>Section 26 valuation benchmark active</span>
          </div>
        </div>
      </div>

      {/* Detailed Statutory Dossier Progression */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-gov p-6 space-y-6">
        <h3 className="text-base font-black text-slate-900 tracking-tight">
          Statutory Milestone Gazette Register
        </h3>

        <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
          {/* Milestone 1: Section 4 SIA */}
          <div className="relative flex items-start space-x-4">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold z-10 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">
                  Section 4: Social Impact Assessment (SIA) Study & Public Hearing
                </h4>
                <Badge status="COMPLETED" text="SIA Approved" />
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Conducted by Independent State SIA Unit. Identified 120 Project Affected Families. Multidisciplinary Expert Group recommended project clearance citing public infrastructure utility.
              </p>
              <div className="mt-3 text-[11px] text-slate-500 flex flex-wrap gap-4 font-mono">
                <span>Date: 12-Feb-2025</span>
                <span>Ref: SIA/MAH/2025/082</span>
                <span>Approved by: Collector & District Magistrate</span>
              </div>
            </div>
          </div>

          {/* Milestone 2: Section 11 Preliminary Notification */}
          <div className="relative flex items-start space-x-4">
            <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold z-10 shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">
                  Section 11: Preliminary Notification Promulgated in Official Gazette
                </h4>
                <Badge status="SECTION_11_NOTIFIED" text="Gazette Published" />
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Published in two daily newspapers (Dainik Jagran & Times of India) and State Gazette. Land transactions, registration, and encumbrances legally frozen across notified Khasra parcels under Section 11(4).
              </p>
              <div className="mt-3 text-[11px] text-slate-500 flex flex-wrap gap-4 font-mono">
                <span>Gazette Ref: Part I-A Extra No. 209</span>
                <span>Statutory Deadline to Sec 19: 12 Months</span>
                <span>CALA: Sub-Divisional Officer / SLAO</span>
              </div>
            </div>
          </div>

          {/* Milestone 3: Section 15 Hearing of Citizen Objections */}
          <div className="relative flex items-start space-x-4">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold z-10 shadow-sm">
              <Clock className="w-4 h-4" />
            </div>
            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">
                  Section 15: Hearing of Citizen Objections & Joint Resurvey
                </h4>
                <Badge status="IN_PROGRESS" text="Hearings in Progress" />
              </div>
              <p className="text-xs text-slate-600 mt-1">
                60-day statutory window for receiving objections. Inquiries conducted by CALA regarding boundary verifications, tree counts, and ownership title claims.
              </p>

              {/* Objections Log Snapshot */}
              <div className="mt-3 bg-white rounded-lg border border-slate-200 p-3 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase">
                  Recorded Objections Ledger
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Shri Ramesh Patil (Khasra 104/1A)</span>: Area discrepancy of 0.2 Ha claimed.
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Resurvey Complete</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Smt. Vandana Shinde (Khasra 112/3)</span>: Fruit-bearing mango trees valuation requested.
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Horticulture Inspection</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Milestone 4: Section 19 Declaration */}
          <div className="relative flex items-start space-x-4">
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold z-10 shadow-sm">
              <Scroll className="w-4 h-4" />
            </div>
            <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">
                  Section 19: Conclusive Declaration of Acquisition & Resettlement Area
                </h4>
                <Badge status={activeProject?.currentStage === 'SECTION_19_DECLARED' || activeProject?.currentStage === 'SECTION_23_AWARD_PASSED' ? 'SECTION_19_DECLARED' : 'PENDING'} />
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Conclusive evidence under Section 19(1) that land is required for public infrastructure purpose. Publication initiates Section 21 individual claimant notices and Section 26 valuation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Publish Section 11 Modal */}
      {isPublishSec11Open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-xs">
            <div className="bg-purple-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Promulgate Section 11 Preliminary Notification</h3>
                <p className="text-[11px] text-purple-200">Enforce statutory freeze on land transactions</p>
              </div>
              <button onClick={() => setIsPublishSec11Open(false)} className="text-purple-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishSec11} className="p-6 space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Notification Gazette Number</label>
                <input
                  type="text"
                  required
                  value={sec11Data.notificationNumber}
                  onChange={(e) => setSec11Data({ ...sec11Data, notificationNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Daily Newspaper (Regional Language)</label>
                <input
                  type="text"
                  required
                  value={sec11Data.newspaperHindi}
                  onChange={(e) => setSec11Data({ ...sec11Data, newspaperHindi: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Daily Newspaper (English Edition)</label>
                <input
                  type="text"
                  required
                  value={sec11Data.newspaperEnglish}
                  onChange={(e) => setSec11Data({ ...sec11Data, newspaperEnglish: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">State Official Gazette Reference</label>
                <input
                  type="text"
                  required
                  value={sec11Data.stateGazetteRef}
                  onChange={(e) => setSec11Data({ ...sec11Data, stateGazetteRef: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPublishSec11Open(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Publishing...' : 'Promulgate in Gazette'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Citizen Objection Modal */}
      {isObjectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-xs">
            <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Record Section 15 Citizen Objection</h3>
                <p className="text-[11px] text-amber-100">Public Hearing Registry</p>
              </div>
              <button onClick={() => setIsObjectionOpen(false)} className="text-amber-200 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileObjection} className="p-6 space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Petitioner / Landowner Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smt. Savitri Devi"
                  value={objectionData.petitionerName}
                  onChange={(e) => setObjectionData({ ...objectionData, petitionerName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Survey Khasra Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 108/2B"
                  value={objectionData.khasraNumber}
                  onChange={(e) => setObjectionData({ ...objectionData, khasraNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Nature of Objection</label>
                <select
                  value={objectionData.objectionType}
                  onChange={(e) => setObjectionData({ ...objectionData, objectionType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Measurement / Boundary Area Discrepancy">Measurement / Boundary Area Discrepancy</option>
                  <option value="Title / Ownership Share Dispute">Title / Ownership Share Dispute</option>
                  <option value="Valuation of Trees or Built Structures">Valuation of Trees or Built Structures</option>
                  <option value="Feasibility of Alternate Alignment">Feasibility of Alternate Alignment</option>
                  <option value="R&R Entitlement Category Claim">R&R Entitlement Category Claim</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Detailed Objection Summary</label>
                <textarea
                  required
                  rows={3}
                  value={objectionData.description}
                  onChange={(e) => setObjectionData({ ...objectionData, description: e.target.value })}
                  placeholder="Record petitioner arguments for CALA proceeding..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsObjectionOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Recording...' : 'File Objection & Schedule Hearing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Declare Section 19 Modal */}
      {isDeclareSec19Open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-xs">
            <div className="bg-gov-navy text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Issue Section 19 Conclusive Declaration</h3>
                <p className="text-[11px] text-slate-300">Final Declaration of Acquisition & R&R Area</p>
              </div>
              <button onClick={() => setIsDeclareSec19Open(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeclareSec19} className="p-6 space-y-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Declaration Gazette Decree Number</label>
                <input
                  type="text"
                  required
                  value={sec19Data.declarationNumber}
                  onChange={(e) => setSec19Data({ ...sec19Data, declarationNumber: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Official Gazette Publication Reference</label>
                <input
                  type="text"
                  required
                  value={sec19Data.stateGazetteRef}
                  onChange={(e) => setSec19Data({ ...sec19Data, stateGazetteRef: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 leading-relaxed">
                Notice: Promulgation of Section 19 starts the statutory 12-month countdown to pass the Section 23 Final Compensation Award.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDeclareSec19Open(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gov-navy hover:bg-gov-navyLight text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? 'Promulgating...' : 'Promulgate Section 19 Decree'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
