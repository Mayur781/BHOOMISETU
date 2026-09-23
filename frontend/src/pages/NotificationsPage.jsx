import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import Breadcrumb from '../components/common/Breadcrumb';
import Table from '../components/common/Table';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Bell, Newspaper, Plus, FileText, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const { activeProject } = useProject();

  const notifications = [
    {
      id: 'notif_01',
      number: 'SEC11/MORTH/2025/114',
      section: 'Section 11(1)',
      title: 'Preliminary Notification for Acquisition of Land in Bhiwandi Tehsil',
      publishedDate: '15-Mar-2025',
      authority: 'Collector & District Magistrate, Thane',
      newspapers: 'Dainik Jagran & The Times of India',
      slaDaysRemaining: 240,
      status: 'PUBLISHED'
    },
    {
      id: 'notif_02',
      number: 'SEC15/CALA/2025/082',
      section: 'Section 15(2)',
      title: 'Public Notice for Hearing of Citizen Objections regarding Land Extent',
      publishedDate: '02-Apr-2025',
      authority: 'CALA / Sub-Divisional Officer, Bhiwandi',
      newspapers: 'Lokmat & Indian Express',
      slaDaysRemaining: 18,
      status: 'IN_PROGRESS'
    },
    {
      id: 'notif_03',
      number: 'SEC19/MAH/2026/049',
      section: 'Section 19(1)',
      title: 'Declaration of Acquisition & Declaration of Resettlement Area',
      publishedDate: '10-Jan-2026',
      authority: 'Revenue & Forest Department, Govt of Maharashtra',
      newspapers: 'Official State Gazette Extraordinary No. 34',
      slaDaysRemaining: 310,
      status: 'SECTION_19_DECLARED'
    }
  ];

  const columns = [
    {
      header: 'Gazette ID & Section',
      render: (n) => (
        <div>
          <span className="font-mono font-bold text-gov-navy text-xs">{n.number}</span>
          <div className="font-bold text-slate-800 text-xs mt-0.5">{n.section}</div>
        </div>
      )
    },
    {
      header: 'Notification Decree Title',
      render: (n) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs">{n.title}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Published in: {n.newspapers}</div>
        </div>
      )
    },
    {
      header: 'Issuing Authority',
      render: (n) => <span className="text-xs text-slate-700">{n.authority}</span>
    },
    {
      header: 'Publication Date',
      render: (n) => <span className="font-mono text-xs">{n.publishedDate}</span>
    },
    {
      header: 'Statutory SLA Clock',
      render: (n) => (
        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          {n.slaDaysRemaining} Days Remaining
        </span>
      )
    },
    {
      header: 'Status',
      render: (n) => <Badge status={n.status} text={n.status} />
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <Breadcrumb items={[{ label: 'Statutory Gazette Notifications' }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gov-navy/10 text-gov-navy">
              Official Gazette Register
            </span>
            <span className="text-xs text-slate-500 font-medium">Corridor: {activeProject?.title}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
            Statutory Notifications & Gazette Promulgation
          </h1>
          <p className="text-xs text-slate-500">
            Official publication records for Section 4 SIA, Section 11 Preliminary Notification, and Section 19 Declarations
          </p>
        </div>

        <Link to="/statutory">
          <Button variant="primary" icon={Newspaper}>
            Publish Section 11 Gazette
          </Button>
        </Link>
      </div>

      <Table
        columns={columns}
        data={notifications}
        emptyMessage="No statutory notifications recorded."
      />
    </div>
  );
}
