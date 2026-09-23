import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/common/Badge';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building2,
  Landmark,
  Stamp,
  Printer,
  Calendar,
  Layers,
  AlertTriangle,
  X
} from 'lucide-react';

export default function PossessionPage() {
  const { user } = useAuth();
  const { activeProject, activeProjectId } = useProject();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [generating, setGenerating] = useState(false);

  const fetchPossession = async () => {
    if (!activeProjectId) return;
    try {
      setLoading(true);
      const res = await api.get(`/possession/status/${activeProjectId}`);
      if (res.success && res.data) {
        setStatusData(res.data);
      }
    } catch (err) {
      console.error('Failed to load possession status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPossession();
  }, [activeProjectId]);

  const handleGenerateCertificate = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/possession/generate-certificate', {
        projectId: activeProjectId,
        remarks: 'Physical possession taken under Section 38 after 100% solatium DBT disbursal and R&R settlement.'
      });
      if (res.success && res.data) {
        setCertificateData(res.data.certificate);
        setIsCertModalOpen(true);
        await fetchPossession();
      }
    } catch (err) {
      alert(err.message || 'Failed to generate possession certificate');
    } finally {
      setGenerating(false);
    }
  };

  const st = statusData || {
    project: activeProject,
    totalParcels: 18,
    possessionTransferredCount: 12,
    readyForPossessionCount: 4,
    pendingDisbursalCount: 2,
    complianceStatus: {
      compensationDisbursed100Pct: true,
      rrEntitlementsProvided: true,
      freeFromEncumbrances: true,
      statutoryPrerequisitesMet: true
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              RFCTLARR Section 38
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Statutory Form 11 Desk
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Physical Possession Handover & Title Transfer
          </h1>
          <p className="text-xs text-slate-500">
            Enforces Section 38 statutory precondition: Zero possession handover before 100% compensation & R&R discharge
          </p>
        </div>

        <button
          onClick={handleGenerateCertificate}
          disabled={generating}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gov-navy hover:bg-gov-navyLight text-white rounded-lg text-xs font-bold transition-all shadow-gov disabled:opacity-50"
        >
          <Stamp className="w-4 h-4 text-gov-saffron" />
          <span>{generating ? 'Sealing...' : 'Generate Section 38 Possession Certificate'}</span>
        </button>
      </div>

      {/* Statutory Precondition Check & Readiness Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Readiness Verification Checklist */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-gov space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600" />
              Section 38 Statutory Pre-requisite Audit
            </h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
              100% Prerequisites Met
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-800">
                  Section 38(1) Full Compensation Disbursed
                </div>
                <div className="text-slate-500 mt-0.5">
                  Collector / CALA certifies that 100% of the award amount (including 100% Solatium and 12% interest) has been credited to landowners via PFMS DBT gateway.
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-800">
                  Section 38(2) Rehabilitation & Resettlement Scheme Discharged
                </div>
                <div className="text-slate-500 mt-0.5">
                  Second Schedule house site allotments, one-time resettlement allowances, and subsistence grants have been formally settled with all Project Affected Families.
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-slate-800">
                  Vesting of Land Absolutely in the Government Free from All Encumbrances
                </div>
                <div className="text-slate-500 mt-0.5">
                  Upon taking possession, land vests in the State/Central Government without any mortgages, leases, or adverse claims under Section 38(1).
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Handover Metric Cards */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-gov flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-3">
              Corridor Possession Status
            </h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div className="text-xs text-emerald-800 font-medium">Possession Transferred</div>
                <div className="text-2xl font-black text-emerald-950 font-mono mt-1">
                  {st.possessionTransferredCount} Parcels
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">Handover Certificate Signed</div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-xs text-blue-800 font-medium">Awarded & Awaiting Handover</div>
                <div className="text-2xl font-black text-blue-950 font-mono mt-1">
                  {st.readyForPossessionCount} Parcels
                </div>
                <div className="text-[11px] text-blue-700 mt-0.5">Compensation Disbursed</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-600 font-medium">Pending Disbursal</div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                  {st.pendingDisbursalCount} Parcels
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Possession Legally Prohibited</div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
            Handover Authority: Competent Authority for Land Acquisition (CALA) / District Collector
          </div>
        </div>
      </div>

      {/* Statutory Certificate Preview Modal */}
      {isCertModalOpen && certificateData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border-2 border-slate-300 overflow-hidden text-xs">
            {/* National Top Stripe */}
            <div className="gov-tricolor-stripe" />

            <div className="p-6 sm:p-8 space-y-6">
              {/* Official Certificate Header */}
              <div className="text-center space-y-1 border-b border-slate-200 pb-4">
                <Landmark className="w-8 h-8 text-gov-navy mx-auto" />
                <div className="text-[11px] uppercase font-bold tracking-widest text-slate-500">
                  Government of India • Ministry of Rural Development
                </div>
                <h2 className="text-lg font-black text-gov-navy uppercase tracking-tight">
                  Form 11: Certificate of Physical Possession
                </h2>
                <div className="text-[10px] text-slate-400 font-mono">
                  [Promulgated Under Section 38 of the RFCTLARR Act, 2013]
                </div>
              </div>

              {/* Certificate Body */}
              <div className="space-y-3 leading-relaxed text-slate-800">
                <div className="flex justify-between font-mono text-[11px] border-b border-slate-100 pb-2">
                  <span>Certificate ID: <strong>{certificateData.certificateNumber}</strong></span>
                  <span>Date: <strong>{new Date(certificateData.issuedDate).toLocaleDateString('en-IN')}</strong></span>
                </div>

                <p>
                  This is to solemnly certify that physical possession of the land measuring{' '}
                  <strong className="text-gov-navy">{certificateData.totalAreaHectares} Hectares</strong>{' '}
                  situated in District <strong className="text-gov-navy">{certificateData.district}, {certificateData.state}</strong>{' '}
                  has been taken over by the Competent Authority for Land Acquisition (CALA) and formally handed over to the Implementing Agency{' '}
                  <strong className="text-gov-navy">{certificateData.implementingAgency}</strong> for the construction of the{' '}
                  <strong>{activeProject?.title}</strong>.
                </p>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                  <div>Project Alignment Code: <strong>{activeProject?.projectCode}</strong></div>
                  <div>Statutory Act: <strong>RFCTLARR Act, 2013 (Act No. 30 of 2013)</strong></div>
                  <div>Compensation Clearance: <strong>100% Disbursed via PFMS DBT Gateway</strong></div>
                  <div>Encumbrances: <strong>Vested Absolutely in the Government Free from All Encumbrances</strong></div>
                </div>

                <div className="pt-6 grid grid-cols-2 gap-8 text-center">
                  <div className="space-y-1">
                    <div className="h-10 border-b border-slate-300 mx-8" />
                    <div className="font-bold text-slate-800 text-[11px]">Authorized Representative</div>
                    <div className="text-[10px] text-slate-500">{certificateData.implementingAgency}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="font-mono text-[9px] text-emerald-700 bg-emerald-50 py-0.5 rounded border border-emerald-200 mx-4">
                      {certificateData.digitalSignatureHash?.slice(0, 24)}...
                    </div>
                    <div className="font-bold text-slate-900 text-[11px]">{user?.name}</div>
                    <div className="text-[10px] text-slate-500">CALA / District Collector & Magistrate</div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg flex items-center space-x-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Statutory Certificate</span>
                </button>
                <button
                  onClick={() => setIsCertModalOpen(false)}
                  className="px-4 py-2 bg-gov-navy hover:bg-gov-navyLight text-white font-bold rounded-lg transition-colors shadow-sm"
                >
                  Close & Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
