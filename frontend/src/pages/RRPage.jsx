import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/common/Badge';
import {
  Users,
  Home,
  HeartHandshake,
  ShieldAlert,
  CheckCircle2,
  Plus,
  IndianRupee,
  Clock,
  Briefcase,
  AlertCircle,
  X,
  UserCheck
} from 'lucide-react';

export default function RRPage() {
  const { user } = useAuth();
  const { activeProject, activeProjectId } = useProject();
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [settlingId, setSettlingId] = useState(null);

  // New Family Form
  const [familyData, setFamilyData] = useState({
    familyHeadName: '',
    aadhaarHash: 'XXXX-XXXX-8921',
    membersCount: 4,
    village: 'Padgha',
    isSC: false,
    isST: false,
    isBPL: true,
    isWomanHeaded: false,
    isLandlessLabourer: false,
    houseAllotmentChosen: true,
    annuityOptionChosen: 'One-time ₹5 Lakh Grant'
  });

  const [formLoading, setFormLoading] = useState(false);

  const fetchFamilies = async () => {
    if (!activeProjectId) return;
    try {
      setLoading(true);
      const res = await api.get(`/rr/families/${activeProjectId}`);
      if (res.success && res.data) {
        setFamilies(res.data);
      }
    } catch (err) {
      console.error('Failed to load affected families:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, [activeProjectId]);

  const handleEnrollFamily = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        projectId: activeProjectId,
        familyHeadName: familyData.familyHeadName,
        aadhaarHash: familyData.aadhaarHash,
        membersCount: Number(familyData.membersCount),
        village: familyData.village,
        vulnerability: {
          isSC: familyData.isSC,
          isST: familyData.isST,
          isBPL: familyData.isBPL,
          isWomanHeaded: familyData.isWomanHeaded,
          isLandlessLabourer: familyData.isLandlessLabourer
        },
        entitlements: {
          houseAllotmentChosen: familyData.houseAllotmentChosen,
          resettlementAllowanceGiven: false,
          annuityOptionChosen: familyData.annuityOptionChosen,
          status: 'COMMENCED'
        }
      };

      const res = await api.post('/rr/families', payload);
      if (res.success) {
        setIsEnrollModalOpen(false);
        setFamilyData({
          familyHeadName: '',
          aadhaarHash: 'XXXX-XXXX-8921',
          membersCount: 4,
          village: 'Padgha',
          isSC: false,
          isST: false,
          isBPL: true,
          isWomanHeaded: false,
          isLandlessLabourer: false,
          houseAllotmentChosen: true,
          annuityOptionChosen: 'One-time ₹5 Lakh Grant'
        });
        await fetchFamilies();
      }
    } catch (err) {
      alert(err.message || 'Enrollment failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSettleEntitlement = async (familyId) => {
    setSettlingId(familyId);
    try {
      const res = await api.put(`/rr/families/${familyId}/settle`, {
        remarks: 'Second Schedule house site allotment and resettlement grant verified by CALA officer.'
      });
      if (res.success) {
        await fetchFamilies();
      }
    } catch (err) {
      alert(err.message || 'Settlement failed');
    } finally {
      setSettlingId(null);
    }
  };

  // Metrics
  const totalFamilies = families.length;
  const settledCount = families.filter((f) => f.entitlements?.status === 'COMPLETED' || f.entitlements?.status === 'SETTLED').length;
  const vulnerableCount = families.filter((f) => f.vulnerability?.isSC || f.vulnerability?.isST || f.vulnerability?.isBPL || f.vulnerability?.isWomanHeaded).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              RFCTLARR Second Schedule
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Corridor: {activeProject?.title}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Rehabilitation & Resettlement (R&R) Scheme & PAF Registry
          </h1>
          <p className="text-xs text-slate-500">
            Mandatory Second Schedule entitlements, SC/ST special provisions, housing site allotments, and annuity grants
          </p>
        </div>

        <button
          onClick={() => setIsEnrollModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-gov-navy hover:bg-gov-navyLight text-white rounded-lg text-xs font-bold transition-all shadow-gov"
        >
          <Plus className="w-4 h-4 text-gov-saffron" />
          <span>Enroll Affected Family (PAF)</span>
        </button>
      </div>

      {/* R&R Key Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-gov">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Enrolled Families (PAFs)</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalFamilies}</div>
          <div className="text-xs text-slate-500 mt-1">Verified via Baseline Social Census</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-gov">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>Vulnerable Households</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1 font-mono">{vulnerableCount}</div>
          <div className="text-xs text-amber-700 mt-1">SC / ST / BPL / Women-Headed Priority</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-gov">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase">
            <span>R&R Settlements Settled</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            {settledCount} / {totalFamilies}
          </div>
          <div className="text-xs text-emerald-700 mt-1">Housing Grants & Annuities Delivered</div>
        </div>
      </div>

      {/* PAF Master Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-gov p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
              Project Affected Families (PAF) Enrolment & Entitlements Ledger
            </h3>
            <p className="text-xs text-slate-500">Statutory census under Section 16 & Section 31 R&R Scheme</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border">
            Second Schedule Protected
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase">
                <th className="py-2.5 px-3">Head of Household</th>
                <th className="py-2.5 px-3">Village / Jurisdiction</th>
                <th className="py-2.5 px-3">Members</th>
                <th className="py-2.5 px-3">Vulnerability Category</th>
                <th className="py-2.5 px-3">Statutory Entitlements</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {families.map((fam) => {
                const isSettled = fam.entitlements?.status === 'COMPLETED' || fam.entitlements?.status === 'SETTLED';
                const isBusy = settlingId === (fam._id || fam.id);
                return (
                  <tr key={fam._id || fam.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{fam.familyHeadName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Aadhaar: {fam.aadhaarHash}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {fam.village}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {fam.membersCount} Persons
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {fam.vulnerability?.isSC && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                            SC
                          </span>
                        )}
                        {fam.vulnerability?.isST && (
                          <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                            ST
                          </span>
                        )}
                        {fam.vulnerability?.isBPL && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                            BPL
                          </span>
                        )}
                        {fam.vulnerability?.isWomanHeaded && (
                          <span className="px-1.5 py-0.5 rounded bg-pink-100 text-pink-800 text-[10px] font-bold">
                            Woman-Headed
                          </span>
                        )}
                        {fam.vulnerability?.isLandlessLabourer && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                            Landless
                          </span>
                        )}
                        {!fam.vulnerability?.isSC &&
                          !fam.vulnerability?.isST &&
                          !fam.vulnerability?.isBPL &&
                          !fam.vulnerability?.isWomanHeaded &&
                          !fam.vulnerability?.isLandlessLabourer && (
                            <span className="text-slate-400 text-[10px]">General</span>
                          )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-0.5 text-[11px]">
                        <div className="font-semibold text-slate-800">
                          {fam.entitlements?.houseAllotmentChosen ? '✓ Resettlement Housing Site' : 'Cash in Lieu'}
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          {fam.entitlements?.annuityOptionChosen || 'One-time ₹5L grant'}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {isSettled ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Settled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3 mr-1" /> Commenced
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {isSettled ? (
                        <span className="text-[10px] text-slate-400 font-mono">Discharged</span>
                      ) : (
                        <button
                          onClick={() => handleSettleEntitlement(fam._id || fam.id)}
                          disabled={isBusy}
                          className="px-3 py-1 bg-gov-navy hover:bg-gov-navyLight text-white rounded-md text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                        >
                          {isBusy ? 'Settling...' : 'Settle Entitlements'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Family Modal */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden text-xs">
            <div className="bg-gov-navy text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Enroll Project Affected Family (Section 16 Census)</h3>
                <p className="text-[11px] text-slate-300">Baseline R&R Entitlements Registration</p>
              </div>
              <button onClick={() => setIsEnrollModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnrollFamily} className="p-6 space-y-3 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Head of Household Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shri Shankar Narayan Bhoir"
                  value={familyData.familyHeadName}
                  onChange={(e) => setFamilyData({ ...familyData, familyHeadName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Village</label>
                  <input
                    type="text"
                    required
                    value={familyData.village}
                    onChange={(e) => setFamilyData({ ...familyData, village: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">Members Count</label>
                  <input
                    type="number"
                    required
                    value={familyData.membersCount}
                    onChange={(e) => setFamilyData({ ...familyData, membersCount: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Vulnerability Checklist */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 uppercase text-[11px]">
                  Vulnerability Criteria (Second Schedule Protections)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={familyData.isSC}
                      onChange={(e) => setFamilyData({ ...familyData, isSC: e.target.checked })}
                      className="accent-gov-navy"
                    />
                    <span>Scheduled Caste (SC)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={familyData.isST}
                      onChange={(e) => setFamilyData({ ...familyData, isST: e.target.checked })}
                      className="accent-gov-navy"
                    />
                    <span>Scheduled Tribe (ST)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={familyData.isBPL}
                      onChange={(e) => setFamilyData({ ...familyData, isBPL: e.target.checked })}
                      className="accent-gov-navy"
                    />
                    <span>Below Poverty Line (BPL)</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={familyData.isWomanHeaded}
                      onChange={(e) => setFamilyData({ ...familyData, isWomanHeaded: e.target.checked })}
                      className="accent-gov-navy"
                    />
                    <span>Woman-Headed</span>
                  </label>
                </div>
              </div>

              {/* Entitlement Options */}
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Second Schedule Annuity / Employment Choice</label>
                <select
                  value={familyData.annuityOptionChosen}
                  onChange={(e) => setFamilyData({ ...familyData, annuityOptionChosen: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  <option value="One-time ₹5 Lakh Grant">One-time ₹5 Lakh Lump Sum Grant</option>
                  <option value="Annuity of ₹2,000/month for 20 years">Monthly Annuity (₹2,000/month for 20 years)</option>
                  <option value="Mandatory Project Employment">Mandatory Project Operational Employment</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 bg-gov-navy hover:bg-gov-navyLight text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {formLoading ? 'Enrolling...' : 'Enroll PAF into R&R Scheme'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
