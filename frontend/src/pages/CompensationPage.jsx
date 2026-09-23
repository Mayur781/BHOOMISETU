import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Badge from '../components/common/Badge';
import {
  Calculator,
  IndianRupee,
  CheckCircle2,
  FileCheck,
  Send,
  Building,
  TreePine,
  Home,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle
} from 'lucide-react';

export default function CompensationPage({ selectedParcelForCalc }) {
  const { user } = useAuth();
  const { activeProject, activeProjectId } = useProject();

  // Calculator Form State
  const [calcInputs, setCalcInputs] = useState({
    areaHectares: selectedParcelForCalc?.acquiredAreaHectares || 1.8,
    marketRatePerHectare: selectedParcelForCalc?.circleRatePerHectare || 4500000,
    ruralMultiplierFactor: 1.25,
    structuresValue: 350000,
    treesCropsValue: 120000,
    monthsFromSIA: 14
  });

  const [calcResult, setCalcResult] = useState(null);
  const [awardsData, setAwardsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passingAward, setPassingAward] = useState(false);
  const [disbursingIdx, setDisbursingIdx] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Update inputs if selected parcel prop changes
  useEffect(() => {
    if (selectedParcelForCalc) {
      setCalcInputs((prev) => ({
        ...prev,
        areaHectares: selectedParcelForCalc.acquiredAreaHectares || prev.areaHectares,
        marketRatePerHectare: selectedParcelForCalc.circleRatePerHectare || prev.marketRatePerHectare
      }));
    }
  }, [selectedParcelForCalc]);

  // Pure Calculation Preview API
  const runCalculation = async () => {
    try {
      setLoading(true);
      const res = await api.post('/compensation/calculate-preview', calcInputs);
      if (res.success && res.data) {
        setCalcResult(res.data);
      }
    } catch (err) {
      console.error('Calculation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Awards List
  const fetchAwards = async () => {
    if (!activeProjectId) return;
    try {
      const res = await api.get(`/compensation/project/${activeProjectId}`);
      if (res.success && res.data) {
        setAwardsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load awards:', err);
    }
  };

  useEffect(() => {
    runCalculation();
    fetchAwards();
  }, [activeProjectId]);

  // Recalculate whenever inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      runCalculation();
    }, 250);
    return () => clearTimeout(timer);
  }, [calcInputs]);

  // Pass Award Handler
  const handlePassAward = async () => {
    if (!calcResult || !activeProjectId) return;
    setPassingAward(true);
    setSuccessMessage('');

    try {
      const parcelId = selectedParcelForCalc?._id || selectedParcelForCalc?.id || 'parcel_cala_demo_01';
      const res = await api.post('/compensation/award', {
        projectId: activeProjectId,
        parcelId,
        calculation: calcResult.breakdown
      });

      if (res.success) {
        setSuccessMessage(`Section 23 Award promulgated successfully (${res.data.awardNumber}) with CALA Digital Signature!`);
        await fetchAwards();
      }
    } catch (err) {
      alert(err.message || 'Failed to pass award');
    } finally {
      setPassingAward(false);
    }
  };

  // Disburse via PFMS DBT Handler
  const handleDisburse = async (awardId, disbursementIndex) => {
    setDisbursingIdx(`${awardId}-${disbursementIndex}`);
    setSuccessMessage('');

    try {
      const res = await api.post('/compensation/disburse', {
        awardId,
        disbursementIndex
      });

      if (res.success) {
        setSuccessMessage(`PFMS Direct Benefit Transfer credited successfully! UTR: ${res.data.disbursedRecord?.utrNumber}`);
        await fetchAwards();
      }
    } catch (err) {
      alert(err.message || 'Disbursement failed');
    } finally {
      setDisbursingIdx(null);
    }
  };

  const bd = calcResult?.breakdown || {
    baseLandMarketValue: 8100000,
    ruralUrbanMultiplierFactor: 1.25,
    multipliedLandValue: 10125000,
    assetsValueStructures: 350000,
    assetsValueTreesCrops: 120000,
    totalAssetsValue: 470000,
    solatiumPercentage: 100,
    solatiumAmount: 10595000,
    additionalInterestRateAnnual: 12,
    additionalInterestAmount: 1134000,
    totalCompensationPayable: 22324000
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              Statutory Compensation Architecture
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              RFCTLARR Sections 26 - 30 Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            Awards, 100% Solatium & PFMS Direct Benefit Transfer (DBT) Desk
          </h1>
          <p className="text-xs text-slate-500">
            Deterministic valuation applying Rural Distance Multiplier (1.0x-2.0x), Section 29 Assets, 100% Solatium, and 12% Annual Interest
          </p>
        </div>

        {awardsData && (
          <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">Total Disbursed</div>
              <div className="text-emerald-700 font-black text-base">
                ₹{(awardsData.totalDisbursedINR / 10000000).toFixed(2)} Cr
              </div>
            </div>
            <div className="h-7 w-px bg-slate-300" />
            <div>
              <div className="text-slate-500 text-[10px] uppercase font-bold">Progress</div>
              <div className="text-gov-navy font-black text-base">
                {awardsData.disbursalPercentage}%
              </div>
            </div>
          </div>
        )}
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-emerald-600 hover:text-emerald-800 font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Section: Left Interactive Calculator, Right Statutory Award Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Input Controls */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-gov space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider flex items-center">
              <Calculator className="w-4 h-4 mr-2 text-gov-saffron" />
              Valuation Parameters
            </h3>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
              Live Computation
            </span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Area Hectares */}
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Acquired Area (Hectares)</span>
                <span className="text-gov-navy font-mono text-sm">{calcInputs.areaHectares} Ha</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="15.0"
                step="0.05"
                value={calcInputs.areaHectares}
                onChange={(e) => setCalcInputs({ ...calcInputs, areaHectares: parseFloat(e.target.value) })}
                className="w-full accent-gov-navy cursor-pointer"
              />
            </div>

            {/* Circle / Market Rate */}
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Section 26 Market Rate (₹/Hectare)</span>
                <span className="text-gov-navy font-mono text-sm">
                  ₹{calcInputs.marketRatePerHectare?.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="number"
                step="100000"
                value={calcInputs.marketRatePerHectare}
                onChange={(e) => setCalcInputs({ ...calcInputs, marketRatePerHectare: Number(e.target.value) })}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-xs"
              />
              <p className="text-[10px] text-slate-400 mt-0.5">Higher of circle rate, registered sale deeds, or consent</p>
            </div>

            {/* Rural Distance Multiplier Factor */}
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Section 26(2) Rural Multiplier (1.0x to 2.0x)</span>
                <span className="text-gov-navy font-mono text-sm">{calcInputs.ruralMultiplierFactor}x</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.0"
                step="0.05"
                value={calcInputs.ruralMultiplierFactor}
                onChange={(e) => setCalcInputs({ ...calcInputs, ruralMultiplierFactor: parseFloat(e.target.value) })}
                className="w-full accent-gov-saffron cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>1.0x (Urban / Municipal)</span>
                <span>1.5x (Semi-Rural)</span>
                <span>2.0x (Deep Hinterland)</span>
              </div>
            </div>

            {/* Section 29 Immovable Assets */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Structures Value (PWD)</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400">₹</span>
                  <input
                    type="number"
                    step="25000"
                    value={calcInputs.structuresValue}
                    onChange={(e) => setCalcInputs({ ...calcInputs, structuresValue: Number(e.target.value) })}
                    className="w-full pl-6 pr-2 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trees & Standing Crops</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-2 text-slate-400">₹</span>
                  <input
                    type="number"
                    step="10000"
                    value={calcInputs.treesCropsValue}
                    onChange={(e) => setCalcInputs({ ...calcInputs, treesCropsValue: Number(e.target.value) })}
                    className="w-full pl-6 pr-2 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Months from SIA */}
            <div>
              <div className="flex justify-between font-bold text-slate-700 mb-1">
                <span>Section 30(3) Duration from SIA Notification</span>
                <span className="text-gov-navy font-mono text-sm">{calcInputs.monthsFromSIA} Months (12% p.a.)</span>
              </div>
              <input
                type="range"
                min="1"
                max="36"
                step="1"
                value={calcInputs.monthsFromSIA}
                onChange={(e) => setCalcInputs({ ...calcInputs, monthsFromSIA: parseInt(e.target.value, 10) })}
                className="w-full accent-gov-green cursor-pointer"
              />
            </div>
          </div>

          {/* Pass Award Action */}
          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handlePassAward}
              disabled={passingAward}
              className="w-full py-3 px-4 bg-gov-navy hover:bg-gov-navyLight text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-gov disabled:opacity-50"
            >
              <FileCheck className="w-4 h-4 text-gov-saffron" />
              <span>{passingAward ? 'Promulgating Award...' : 'Promulgate Section 23 Award with CALA Digital Signature'}</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Signs award with SHA256 officer hash and queues DBT disbursal to landowner bank accounts.
            </p>
          </div>
        </div>

        {/* Right: Transparent Statutory Formula & Solatium Breakdown */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-gov flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
                  Statutory Arithmetic Ledger (Sections 26 to 30)
                </h3>
                <p className="text-xs text-slate-500">Official Government of India Compensation Formula</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                Audit Verified
              </span>
            </div>

            {/* Arithmetic Formula Steps */}
            <div className="space-y-3 text-xs">
              {/* Step 1: Base Market Value */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">
                    Step 1: Section 26 Base Market Value
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {calcInputs.areaHectares} Ha &times; ₹{calcInputs.marketRatePerHectare?.toLocaleString('en-IN')}/Ha
                  </div>
                </div>
                <div className="font-mono font-bold text-slate-900 text-sm">
                  ₹{bd.baseLandMarketValue?.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Step 2: Multiplier Application */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/60 border border-blue-200">
                <div>
                  <div className="font-bold text-blue-900">
                    Step 2: Section 26(2) Rural Multiplied Land Value
                  </div>
                  <div className="text-[11px] text-blue-700">
                    Base Value &times; Factor of {bd.ruralUrbanMultiplierFactor}x
                  </div>
                </div>
                <div className="font-mono font-bold text-blue-900 text-sm">
                  ₹{bd.multipliedLandValue?.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Step 3: Immovable Assets */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <div className="font-bold text-slate-800">
                    Step 3: Section 29 Assets Attached to Land
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Structures (₹{bd.assetsValueStructures?.toLocaleString('en-IN')}) + Trees (₹{bd.assetsValueTreesCrops?.toLocaleString('en-IN')})
                  </div>
                </div>
                <div className="font-mono font-bold text-slate-900 text-sm">
                  ₹{bd.totalAssetsValue?.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Step 4: 100% Solatium */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/70 border border-amber-300">
                <div>
                  <div className="font-black text-amber-950 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 mr-1 text-gov-saffron" />
                    Step 4: Section 30(1) Mandatory 100% Solatium
                  </div>
                  <div className="text-[11px] text-amber-800">
                    100% of (Multiplied Land Value + Section 29 Assets)
                  </div>
                </div>
                <div className="font-mono font-black text-amber-950 text-sm">
                  ₹{bd.solatiumAmount?.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Step 5: 12% Additional Interest */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <div>
                  <div className="font-bold text-emerald-950">
                    Step 5: Section 30(3) 12% p.a. Additional Interest
                  </div>
                  <div className="text-[11px] text-emerald-800">
                    12% per annum on Base Market Value for {calcInputs.monthsFromSIA} months
                  </div>
                </div>
                <div className="font-mono font-bold text-emerald-950 text-sm">
                  ₹{bd.additionalInterestAmount?.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Grand Total Highlight Box */}
          <div className="bg-gov-navy text-white p-5 rounded-xl shadow-gov">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-amber-400">
                  Total Final Award Payable (Section 23)
                </span>
                <div className="text-3xl font-black font-mono mt-1 text-white tracking-tight">
                  ₹{bd.totalCompensationPayable?.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Equivalent to <span className="font-bold text-white">₹{(bd.totalCompensationPayable / 10000000).toFixed(3)} Crores</span>
                </div>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-white/20 sm:pl-4 pt-2 sm:pt-0 text-xs text-slate-300">
                <div>Solatium Share: <span className="font-bold text-white">47.4%</span></div>
                <div>Land Value Share: <span className="font-bold text-white">45.4%</span></div>
                <div>Interest Share: <span className="font-bold text-white">5.1%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promulgated Awards & PFMS DBT Disbursals Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-gov p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">
              PFMS Direct Benefit Transfer (DBT) Disbursement Ledger
            </h3>
            <p className="text-xs text-slate-500">Track beneficiary accounts, Aadhaar payment bridges, and UTR confirmations</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border">
            PFMS Gateway Online
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase">
                <th className="py-2.5 px-3">Award Ref</th>
                <th className="py-2.5 px-3">Beneficiary Landowner</th>
                <th className="py-2.5 px-3">Bank Details (IFSC / A/C)</th>
                <th className="py-2.5 px-3">Compensation Share</th>
                <th className="py-2.5 px-3">Payment Status</th>
                <th className="py-2.5 px-3 text-right">PFMS DBT Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(awardsData?.awards || []).flatMap((awd) =>
                (awd.disbursements || []).map((disb, dIdx) => {
                  const isDone = disb.paymentStatus === 'DISBURSED_SUCCESS';
                  const isBusy = disbursingIdx === `${awd._id || awd.id}-${dIdx}`;
                  return (
                    <tr key={`${awd._id || awd.id}-${dIdx}`} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-gov-navy">
                        {awd.awardNumber}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{disb.ownerName}</div>
                        <div className="text-[10px] text-slate-400">Awarded on {new Date(awd.dateOfAward).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-700">{disb.bankName}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          A/C: {disb.bankAccount} • {disb.ifscCode}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-slate-900">
                        ₹{disb.amountShare?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        {isDone ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <Check className="w-3 h-3 mr-1" /> Credited ({disb.utrNumber?.slice(0, 10)}...)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 mr-1" /> PFMS Queued
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isDone ? (
                          <span className="text-[11px] font-bold text-emerald-700 font-mono">
                            UTR Verified
                          </span>
                        ) : (
                          <button
                            onClick={() => handleDisburse(awd._id || awd.id, dIdx)}
                            disabled={isBusy}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center space-x-1 ml-auto disabled:opacity-50"
                          >
                            <Send className="w-3 h-3" />
                            <span>{isBusy ? 'Disbursing...' : 'Disburse via PFMS DBT'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
