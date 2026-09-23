import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Shield,
  KeyRound,
  Building,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileCheck,
  Lock,
  Landmark,
  Save,
  Sparkles
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Alert from '../components/common/Alert';
import RoleSwitcherModal from '../components/common/RoleSwitcherModal';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    designation: user?.designation || '',
    department: user?.department || '',
    phone: user?.phone || ''
  });
  const [profileMsg, setProfileMsg] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Password Form State
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passMsg, setPassMsg] = useState(null);
  const [passLoading, setPassLoading] = useState(false);

  // Evaluator switcher modal state
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setProfileLoading(true);

    const res = await updateProfile(profileForm);
    if (res.success) {
      setProfileMsg({ type: 'success', text: 'Officer profile records updated successfully.' });
    } else {
      setProfileMsg({ type: 'error', text: res.message || 'Failed to update profile records.' });
    }
    setProfileLoading(false);
  };

  // Handle Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg(null);

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassMsg({ type: 'error', text: 'New passphrase and confirmation do not match.' });
      return;
    }

    if (passForm.newPassword.length < 6) {
      setPassMsg({ type: 'error', text: 'Passphrase must be at least 6 characters long.' });
      return;
    }

    setPassLoading(true);
    const res = await changePassword(passForm.currentPassword, passForm.newPassword);
    if (res.success) {
      setPassMsg({ type: 'success', text: 'Officer security passphrase updated successfully.' });
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPassMsg({ type: 'error', text: res.message || 'Failed to update passphrase.' });
    }
    setPassLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Officer Credential Dossier Header */}
      <div className="bg-white rounded-xl shadow-gov border border-slate-200 overflow-hidden">
        <div className="gov-tricolor-stripe" />
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gov-navy text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-gov-saffron">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OF'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-gov-navy">{user?.name}</h1>
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                    {user?.roleDetails?.badge || user?.role}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  {user?.designation} • {user?.department}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                  <span className="flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{user?.email}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {user?.jurisdiction?.district === 'All'
                        ? 'National Jurisdiction'
                        : `${user?.jurisdiction?.district}, ${user?.jurisdiction?.state}`}
                    </span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Session Status: Active (Authenticated)</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsSwitcherOpen(true)}
                icon={<Shield className="w-4 h-4 text-gov-saffron" />}
              >
                Switch Role Persona
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Information & Passphrase Management */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profile Edit Card */}
          <Card
            title="Officer Administrative Particulars"
            subtitle="Update jurisdictional contact and departmental details"
            headerAction={<Badge variant="default">Verified Officer</Badge>}
          >
            {profileMsg && (
              <div className="mb-4">
                <Alert
                  type={profileMsg.type}
                  message={profileMsg.text}
                  dismissible
                  onDismiss={() => setProfileMsg(null)}
                />
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Legal Name
                  </label>
                  <Input
                    type="text"
                    disabled
                    value={user?.name || ''}
                    className="bg-slate-100 text-slate-500 cursor-not-allowed"
                    helperText="Official name locked by Ministry Public Key Infrastructure."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official NIC / Gov Email
                  </label>
                  <Input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="bg-slate-100 text-slate-500 cursor-not-allowed"
                    helperText="Institutional email registered for statutory gazette broadcasts."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Official Designation
                  </label>
                  <Input
                    type="text"
                    required
                    value={profileForm.designation}
                    onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                    placeholder="e.g. Competent Authority (CALA)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department / Ministry
                  </label>
                  <Input
                    type="text"
                    required
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    placeholder="e.g. Ministry of Road Transport & Highways"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Official Phone / Contact
                </label>
                <Input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+91-XXXXXXXXXX"
                  helperText="Used for automated PFMS DBT dispatch alerts & SMS notices."
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={profileLoading}
                  icon={<Save className="w-4 h-4" />}
                >
                  Save Officer Profile
                </Button>
              </div>
            </form>
          </Card>

          {/* Change Security Passphrase Card */}
          <Card
            title="Authentication & Passphrase Security"
            subtitle="Maintain compliance with Ministry of Electronics & IT (MeitY) cybersecurity guidelines"
            headerAction={<Badge variant="warning">MeitY Certified</Badge>}
          >
            {passMsg && (
              <div className="mb-4">
                <Alert
                  type={passMsg.type}
                  message={passMsg.text}
                  dismissible
                  onDismiss={() => setPassMsg(null)}
                />
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Current Passphrase
                </label>
                <Input
                  type="password"
                  required
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                  placeholder="Enter current security passphrase"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    New Passphrase
                  </label>
                  <Input
                    type="password"
                    required
                    value={passForm.newPassword}
                    onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm New Passphrase
                  </label>
                  <Input
                    type="password"
                    required
                    value={passForm.confirmPassword}
                    onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new passphrase"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start space-x-2">
                <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  Default prototype seeded passphrase is <code className="font-bold bg-amber-200/60 px-1 py-0.5 rounded">Admin@123</code>. Changes made here persist to active session memory and the audit trail.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={passLoading}
                  icon={<KeyRound className="w-4 h-4" />}
                >
                  Update Passphrase
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Statutory Permissions Matrix & Jurisdictional Clearance */}
        <div className="lg:col-span-5 space-y-6">
          {/* Statutory Clearances Matrix */}
          <Card
            title="Statutory Clearance Matrix"
            subtitle="Permissions enacted under RFCTLARR Act, 2013"
            headerAction={<Badge variant="success">Legally Enforceable</Badge>}
          >
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-600">Active Statutory Role:</span>
                  <span className="font-bold text-gov-navy">{user?.roleDetails?.name || user?.role}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-600">Statutory Authority:</span>
                  <span className="font-semibold text-slate-800">
                    {user?.role === 'LAND_ACQUISITION_OFFICER'
                      ? 'Competent Authority (CALA/SLAO)'
                      : user?.role === 'SUPER_ADMIN'
                      ? 'Chief Administrator (MoRD / NIC)'
                      : user?.roleDetails?.badge || user?.role}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-600">Jurisdictional Boundary:</span>
                  <span className="font-semibold text-slate-800">
                    {user?.jurisdiction?.district === 'All'
                      ? 'Pan-India National Coordination'
                      : `${user?.jurisdiction?.district}, ${user?.jurisdiction?.state}`}
                  </span>
                </div>
              </div>

              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider pt-2">
                Granted Statutory Capabilities ({user?.permissions?.length || 0})
              </div>

              <div className="max-h-80 overflow-y-auto pr-1 space-y-1.5">
                {user?.permissions && user.permissions.length > 0 ? (
                  user.permissions.map((perm) => (
                    <div
                      key={perm}
                      className="flex items-center space-x-2 text-xs p-2 rounded-lg bg-emerald-50/60 border border-emerald-200 text-emerald-900"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="font-mono text-[11px] font-medium">{perm}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 text-center">
                    No active statutory permissions allocated.
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Audit & Compliance Card */}
          <Card
            title="Integrity & Audit Safeguards"
            subtitle="Immutable tracking of all statutory transactions"
          >
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <FileCheck className="w-4 h-4 text-gov-navy flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Cryptographic Signing:</span>
                  <p className="mt-0.5 text-slate-600">
                    All Section 11 notices and Section 23 awards passed by this officer are timestamped and signed with SHA-256 integrity hashes.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <Landmark className="w-4 h-4 text-gov-saffron flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">PFMS Direct Benefit Transfer:</span>
                  <p className="mt-0.5 text-slate-600">
                    Disbursements trigger dual-custody PFMS batch file generation with Aadhaar-linked beneficiary validation.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </div>
  );
}
