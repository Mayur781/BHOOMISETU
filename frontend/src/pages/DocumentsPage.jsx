import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { FileText, Download, Eye, FileCheck, Search, Filter } from 'lucide-react';

export default function DocumentsPage() {
  const { activeProject } = useProject();
  const [searchTerm, setSearchTerm] = useState('');

  const documents = [
    {
      id: 'doc_01',
      title: 'Section 11(1) Preliminary Gazette Notification Decree',
      category: 'Statutory Gazette',
      documentNumber: 'SEC11/MORTH/2025/114',
      date: '15-Mar-2025',
      fileType: 'PDF',
      size: '2.4 MB',
      verified: true
    },
    {
      id: 'doc_02',
      title: 'Comprehensive Social Impact Assessment (SIA) Expert Study Report',
      category: 'SIA Report',
      documentNumber: 'SIA/MAH/2025/082',
      date: '12-Feb-2025',
      fileType: 'PDF',
      size: '14.8 MB',
      verified: true
    },
    {
      id: 'doc_03',
      title: 'Joint Measurement Survey (JMS) Cadastral Field Verification Sheets',
      category: 'Cadastral Survey',
      documentNumber: 'JMS/BHIWANDI/2025/019',
      date: '28-Apr-2025',
      fileType: 'PDF',
      size: '8.1 MB',
      verified: true
    },
    {
      id: 'doc_04',
      title: 'Section 19 Conclusive Declaration of Public Purpose & R&R Area',
      category: 'Statutory Gazette',
      documentNumber: 'SEC19/MAH/2026/049',
      date: '10-Jan-2026',
      fileType: 'PDF',
      size: '3.1 MB',
      verified: true
    },
    {
      id: 'doc_05',
      title: 'Form 11 Certificate of Physical Possession Handover',
      category: 'Possession Certificate',
      documentNumber: 'POSS/SEC38/2026/001',
      date: '04-Feb-2026',
      fileType: 'PDF',
      size: '1.2 MB',
      verified: true
    }
  ];

  const columns = [
    {
      header: 'Document Title',
      render: (d) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{d.title}</div>
          <div className="font-mono text-[10px] text-slate-400 mt-0.5">{d.documentNumber}</div>
        </div>
      )
    },
    {
      header: 'Category',
      render: (d) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
          {d.category}
        </span>
      )
    },
    {
      header: 'Date Published',
      render: (d) => <span className="font-mono text-xs">{d.date}</span>
    },
    {
      header: 'File Size',
      render: (d) => <span className="text-xs text-slate-500 font-mono">{d.size}</span>
    },
    {
      header: 'DigiLocker Verification',
      render: (d) => (
        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          ✓ Cryptographically Signed
        </span>
      )
    },
    {
      header: 'Action',
      render: (d) => (
        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={() => alert(`Downloading verified statutory document: ${d.documentNumber}`)}
        >
          Download
        </Button>
      )
    }
  ];

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.documentNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb items={[{ label: 'Statutory Documents' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              e-Repository
            </span>
            <span className="text-xs text-slate-500 font-medium">Corridor: {activeProject?.title}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            Statutory Documents, Gazette Decrees & Form 11 Certificates
          </h1>
          <p className="text-xs text-slate-500">
            Tamper-evident digital document store integrated with DigiLocker and National Government Gazette archives
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-gov">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search document by title or gazette reference..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-gov-navy"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing {filtered.length} of {documents.length} Records
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        emptyMessage="No documents recorded."
      />
    </div>
  );
}
