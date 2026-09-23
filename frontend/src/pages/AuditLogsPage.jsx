import React from 'react';
import Breadcrumb from '../components/common/Breadcrumb';
import AuditPage from './AuditPage';

export default function AuditLogsPage() {
  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: 'Immutable Audit Trail' }]} />
      <AuditPage />
    </div>
  );
}
