import React, { useState } from 'react';
import api from '../services/api';
import {
  ShieldCheck,
  Search,
  Database,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  FileCheck,
  AlertCircle
} from 'lucide-react';

export default function IntegrationsPage() {
  // Tab within integrations
  const [activeDPI, setActiveDPI] = useState('bhulekh'); // 'bhulekh' | 'pfms' | 'digilocker'

  // Bhulekh State
  const [khasraInput, setKhasraInput] = useState('104/1A');
  const [bhulekhResult, setBhulekhResult] = useState(null);
  const [bhulekhLoading, setBhulekhLoading] = useState(false);

  // PFMS State
  const [accountNumber, setAccountNumber] = useState('38194019280');
  const [ifscCode, setIfscCode] = useState('SBIN0001824');
  const [ownerName, setOwnerName] = useState('Ramesh Baburao Patil');
  const [pfmsResult, setPfmsResult] = useState(null);
  const [pfmsLoading, setPfmsLoading] = useState(false);

  // DigiLocker State
  const [gazetteNumber, setGazetteNumber] = useState('SEC11/MORTH/2026/089');
  const [gazetteResult, setGazetteResult] = useState(null);
  const [gazetteLoading, setGazetteLoading] = useState(false);

  const handleLookupBhulekh = async (e) => {
    e.preventDefault();
    setBhulekhLoading(true);
    setBhulekhResult(null);
    try {
      const res = await api.get(`/mock-gov/bhulekh/khasra/${encodeURIComponent(khasraInput)}`);
      if (res.success && res.data) {
        setBhulekhResult(res.data);
      }
    } catch (err) {
      alert(err.message || 'Bhulekh query failed');
    } finally {
      setBhulekhLoading(false);
    }
  };

  const handleValidatePFMS = async (e) => {
    e.preventDefault();
    setPfmsLoading(true);
    setPfmsResult(null);
    try {
      const res = await api.post('/mock-gov/pfms/validate-account', {
        accountNumber,
        ifscCode,
        ownerName
      });
      if (res.success && res.data) {
        setPfmsResult(res.data);
      }
    } catch (err) {
      alert(err.message || 'PFMS validation failed');
    } finally {
      setPfmsLoading(false);
    }
  };

  const handleVerifyGazette = async (e) => {
    e.preventDefault();
    setGazetteLoading(true);
    setGazetteResult(null);
    try {
      const res = await api.get(`/mock-gov/digilocker/gazette/${encodeURIComponent(gazetteNumber)}`);
      if (res.success && res.data) {
        setGazetteResult(res.data);
      }
    } catch (err) {
      alert(err.message || 'DigiLocker verification failed');
    } finally {
      setGazetteLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              Digital Public Infrastructure (DPI)
            </span>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Mock Integration Engine
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
            National e-Governance API Gateway & Sandbox
          </h1>
          <p className="text-xs text-slate-500">
            Clean, pre-configured interfaces for State Bhulekh (7/12 RoR), PFMS Direct Benefit Transfer, and DigiLocker Gazette
          </p>
        </div>

        {/* DPI Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveDPI('bhulekh')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeDPI === 'bhulekh' ? 'bg-gov-navy text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            State Bhulekh RoR
          </button>
          <button
            onClick={() => setActiveDPI('pfms')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeDPI === 'pfms' ? 'bg-gov-navy text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            PFMS Bank DBT
          </button>
          <button
            onClick={() => setActiveDPI('digilocker')}
            className={`px-3 py-1.5 rounded-md transition-all ${
              activeDPI === 'digilocker' ? 'bg-gov-navy text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            DigiLocker Gazette
          </button>
        </div>
      </div>

      {/* Main DPI Active Panel */}
      {activeDPI === 'bhulekh' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-gov space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center">
                <Database className="w-4 h-4 mr-2 text-gov-saffron" />
                State Land Records (Bhulekh / Mahabhulekh / Dharani)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Direct cadastral lookup of Record of Rights (RoR 7/12, Khasra-Khatauni, and encumbrance register)
              </p>
            </div>

            <form onSubmit={handleLookupBhulekh} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Survey Khasra Number
                </label>
                <input
                  type="text"
                  required
                  value={khasraInput}
                  onChange={(e) => setKhasraInput(e.target.value)}
                  placeholder="e.g. 104/1A or 142/2"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">State Revenue Department</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium">
                  <option>Maharashtra (MahaBhulekh - e-Ferfar)</option>
                  <option>Gujarat (AnyRoR)</option>
                  <option>Uttar Pradesh (Bhulekh UP)</option>
                  <option>Madhya Pradesh (MP Bhulekh)</option>
                  <option>Telangana (Dharani Portal)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={bhulekhLoading}
                className="w-full py-2.5 bg-gov-navy hover:bg-gov-navyLight text-white font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{bhulekhLoading ? 'Querying State Registry...' : 'Lookup Digital Record of Rights (RoR)'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-gov">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">
              RoR 7/12 Digital Extract Response
            </h3>

            {bhulekhResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-emerald-900 font-bold">
                    <span className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Authenticated via State Bhulekh
                    </span>
                    <span className="font-mono text-[10px] bg-emerald-200 px-2 py-0.5 rounded">
                      Ref: {bhulekhResult.digitalSignatureHash?.slice(0, 16)}...
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-200">
                    <div>Khasra Number: <strong>{bhulekhResult.khasraNumber}</strong></div>
                    <div>Village / Tehsil: <strong>{bhulekhResult.village}, {bhulekhResult.tehsil}</strong></div>
                    <div>Land Classification: <strong>{bhulekhResult.landCategory}</strong></div>
                    <div>Total Extent: <strong>{bhulekhResult.totalAreaHectares} Ha</strong></div>
                    <div>Circle Rate: <strong>₹{bhulekhResult.circleRatePerHectare?.toLocaleString('en-IN')}/Ha</strong></div>
                    <div>Encumbrance Status: <strong>{bhulekhResult.encumbranceStatus || 'Free of Mutation Disputes'}</strong></div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                  <div className="font-bold text-slate-800 uppercase text-[11px] mb-2">Registered Landowners</div>
                  <div className="space-y-1">
                    {(bhulekhResult.registeredOwners || []).map((o, idx) => (
                      <div key={idx} className="flex justify-between p-2 bg-white rounded border border-slate-200">
                        <span className="font-semibold text-slate-800">{o.name}</span>
                        <span className="font-bold text-gov-navy">{o.sharePercentage}% Share</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-2 my-auto">
                <Database className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Enter a Khasra number and query the mock State Bhulekh registry to test live verification.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PFMS Panel */}
      {activeDPI === 'pfms' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-gov space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center">
                <Building className="w-4 h-4 mr-2 text-emerald-600" />
                Public Financial Management System (PFMS DBT)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Validate landowner bank accounts, Aadhaar seeding, and NPCI mapper before releasing compensation
              </p>
            </div>

            <form onSubmit={handleValidatePFMS} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Landowner Full Name</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Bank Account Number</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Bank IFSC Code</label>
                <input
                  type="text"
                  required
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={pfmsLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{pfmsLoading ? 'Querying PFMS & NPCI Gateway...' : 'Validate Bank Account via PFMS'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-gov">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">
              PFMS Account Verification Response
            </h3>

            {pfmsResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-emerald-900 font-bold">
                    <span className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" /> Account Active & Name Matched
                    </span>
                    <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded font-mono">
                      NPCI Seeding: Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-200">
                    <div>Bank Name: <strong>{pfmsResult.bankName}</strong></div>
                    <div>Account Status: <strong>{pfmsResult.accountStatus}</strong></div>
                    <div>Aadhaar Seeding: <strong>{pfmsResult.aadhaarSeeded ? 'Verified (NPCI Mapper)' : 'Pending'}</strong></div>
                    <div>Name Match Score: <strong>{pfmsResult.nameMatchScore}% (High Confidence)</strong></div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 leading-relaxed">
                  ✓ This account is authenticated and pre-cleared for direct DBT crediting under Section 23 Award Disbursals.
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-2 my-auto">
                <Building className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Submit bank details to test the PFMS DBT Account Validation API.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DigiLocker Gazette Panel */}
      {activeDPI === 'digilocker' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-gov space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center">
                <FileCheck className="w-4 h-4 mr-2 text-purple-600" />
                DigiLocker Official Gazette Verification
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Cryptographic authentication of Gazette Preliminary & Final Declarations
              </p>
            </div>

            <form onSubmit={handleVerifyGazette} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Gazette Notification ID</label>
                <input
                  type="text"
                  required
                  value={gazetteNumber}
                  onChange={(e) => setGazetteNumber(e.target.value)}
                  placeholder="e.g. SEC11/MORTH/2026/089"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                disabled={gazetteLoading}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{gazetteLoading ? 'Verifying with DigiLocker Repository...' : 'Verify Gazette Authenticity'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-gov">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">
              DigiLocker Digital Signature Verification
            </h3>

            {gazetteResult ? (
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-purple-900 font-bold">
                    <span className="flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-purple-600" /> Cryptographically Validated
                    </span>
                    <span className="text-[10px] bg-purple-200 px-2 py-0.5 rounded font-mono">
                      e-Sign Active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-purple-200">
                    <div>Notification ID: <strong>{gazetteResult.notificationNumber}</strong></div>
                    <div>Publication Date: <strong>{new Date(gazetteResult.publicationDate).toLocaleDateString('en-IN')}</strong></div>
                    <div>Issuing Ministry: <strong>{gazetteResult.ministry}</strong></div>
                    <div>Digital Hash: <strong>{gazetteResult.digitalSignatureHash?.slice(0, 20)}...</strong></div>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed font-mono text-[11px]">
                  Signer Identity: Controller of Publications, Government of India Press. Verified tamper-evident.
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-2 my-auto">
                <FileCheck className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">Query the DigiLocker repository to verify official government gazette decrees.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
