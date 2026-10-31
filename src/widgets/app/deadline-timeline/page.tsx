'use client';

import React, { useState } from 'react';
import { useTheme, useWidgetSDK } from '@nitrostack/widgets';

interface DeadlineItem {
  id: string;
  companyName: string;
  jobRole: string;
  deadlineType: 'Application' | 'OA' | 'Technical Interview' | 'HR Interview' | 'Assessment';
  dueDate: string;
  description?: string;
  remainingDays: number;
  remainingHours: number;
  urgencyTier: 'OVERDUE' | 'WITHIN_24_HOURS' | 'WITHIN_3_DAYS' | 'WITHIN_7_DAYS' | 'UPCOMING';
  urgencyLabel: string;
  isOverdue: boolean;
  formattedDueDate: string;
}

interface DeadlinesToolOutput {
  status: string;
  summary: {
    within24Hours: number;
    within3Days: number;
    within7Days: number;
    overdue: number;
    total: number;
  };
  deadlines: DeadlineItem[];
}

export default function DeadlineTimelineWidget() {
  const theme = useTheme();
  const { getToolOutput } = useWidgetSDK();
  const [filterType, setFilterType] = useState<string>('ALL');

  const rawData = getToolOutput<DeadlinesToolOutput>();

  const deadlines: DeadlineItem[] = rawData?.deadlines || [
    {
      id: 'dl-001',
      companyName: 'Microsoft',
      jobRole: 'Software Engineer',
      deadlineType: 'Application',
      dueDate: '2026-11-01T23:59:00',
      description: 'Portal closing in 24 hours. Submit final application and referral code.',
      remainingDays: 1,
      remainingHours: 24,
      urgencyTier: 'WITHIN_24_HOURS',
      urgencyLabel: 'Due in 24 hours (Critical)',
      isOverdue: false,
      formattedDueDate: 'Sun, Nov 1, 2026'
    },
    {
      id: 'dl-002',
      companyName: 'Amazon',
      jobRole: 'Software Development Engineer',
      deadlineType: 'Technical Interview',
      dueDate: '2026-11-03T14:00:00',
      description: 'Chime interview round 1: Live coding on binary trees and system decomposition.',
      remainingDays: 3,
      remainingHours: 72,
      urgencyTier: 'WITHIN_3_DAYS',
      urgencyLabel: 'Due in 3 days (High Priority)',
      isOverdue: false,
      formattedDueDate: 'Tue, Nov 3, 2026, 02:00 PM'
    },
    {
      id: 'dl-003',
      companyName: 'Google',
      jobRole: 'Software Engineer (Early Career)',
      deadlineType: 'OA',
      dueDate: '2026-11-15T18:00:00',
      description: 'Google Online Challenge 90-minute assessment window.',
      remainingDays: 15,
      remainingHours: 360,
      urgencyTier: 'UPCOMING',
      urgencyLabel: 'Due in 15 days',
      isOverdue: false,
      formattedDueDate: 'Sun, Nov 15, 2026, 06:00 PM'
    },
    {
      id: 'dl-004',
      companyName: 'Infosys',
      jobRole: 'Specialist Programmer',
      deadlineType: 'OA',
      dueDate: '2026-11-21T10:00:00',
      description: 'Infosys Specialist Programmer 3-hour national coding contest.',
      remainingDays: 21,
      remainingHours: 504,
      urgencyTier: 'UPCOMING',
      urgencyLabel: 'Due in 21 days',
      isOverdue: false,
      formattedDueDate: 'Sat, Nov 21, 2026, 10:00 AM'
    }
  ];

  const isDark = theme === 'dark';

  const p = {
    bg: isDark ? '#141413' : '#F4F1E9',
    surface: isDark ? '#1E1E1C' : '#FAF9F5',
    card: isDark ? '#262624' : '#FFFFFF',
    border: isDark ? '#33332E' : '#E6E2D8',
    textPrimary: isDark ? '#F5F4F0' : '#252522',
    textSecondary: isDark ? '#9B9A91' : '#68705A',
    textMuted: isDark ? '#6B6A63' : '#8A897F',
    timelineLine: isDark ? '#383832' : '#DFDBD0'
  };

  const getUrgencyBadge = (tier: DeadlineItem['urgencyTier']) => {
    switch (tier) {
      case 'OVERDUE':
        return { bg: isDark ? '#3A1818' : '#FEE2E2', color: isDark ? '#FCA5A5' : '#991B1B', label: 'Overdue' };
      case 'WITHIN_24_HOURS':
        return { bg: isDark ? '#331B1B' : '#FEF2F2', color: isDark ? '#F87171' : '#B91C1C', label: 'Critical • < 24h' };
      case 'WITHIN_3_DAYS':
        return { bg: isDark ? '#332714' : '#FEF3C7', color: isDark ? '#FDE68A' : '#92400E', label: 'High Priority • < 3d' };
      case 'WITHIN_7_DAYS':
        return { bg: isDark ? '#1F2937' : '#E0F2FE', color: isDark ? '#93C5FD' : '#0369A1', label: 'Next 7 Days' };
      default:
        return { bg: isDark ? '#262622' : '#F0EDE5', color: isDark ? '#A8A69D' : '#57564E', label: 'Scheduled' };
    }
  };

  const filtered = filterType === 'ALL'
    ? deadlines
    : deadlines.filter(d => d.deadlineType.toLowerCase().includes(filterType.toLowerCase()));

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      backgroundColor: p.bg,
      color: p.textPrimary,
      padding: '24px',
      borderRadius: '12px',
      maxWidth: '780px',
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${p.border}`
      }}>
        <div>
          <span style={{ fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', color: p.textSecondary, fontWeight: 600 }}>
            Timeline
          </span>
          <h1 style={{
            margin: '4px 0 0 0',
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '-0.4px',
            color: p.textPrimary
          }}>
            Recruitment Deadlines
          </h1>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'OA', 'Technical Interview', 'Application'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 500,
                borderRadius: '14px',
                border: `1px solid ${filterType === type ? p.textPrimary : p.border}`,
                backgroundColor: filterType === type ? p.textPrimary : p.surface,
                color: filterType === type ? (isDark ? '#141413' : '#FFFFFF') : p.textSecondary,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {type === 'Technical Interview' ? 'Interview' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div style={{ position: 'relative', paddingLeft: '24px' }}>
        {/* Vertical Rule */}
        <div style={{
          position: 'absolute',
          left: '7px',
          top: '12px',
          bottom: '12px',
          width: '2px',
          backgroundColor: p.timelineLine
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map((item) => {
            const urgency = getUrgencyBadge(item.urgencyTier);

            return (
              <div
                key={item.id}
                style={{
                  position: 'relative',
                  backgroundColor: p.card,
                  borderRadius: '8px',
                  border: `1px solid ${p.border}`,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                {/* Timeline Dot Indicator */}
                <div style={{
                  position: 'absolute',
                  left: '-24px',
                  top: '18px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: item.urgencyTier === 'WITHIN_24_HOURS'
                    ? '#DC2626'
                    : item.urgencyTier === 'WITHIN_3_DAYS'
                    ? '#D97706'
                    : p.accent,
                  border: `2px solid ${p.bg}`
                }} />

                {/* Top Row: Company & Urgency Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px', color: p.textPrimary }}>
                      {item.companyName}
                    </span>
                    <span style={{ fontSize: '12.5px', color: p.textSecondary }}>
                      {item.jobRole}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: urgency.bg,
                    color: urgency.color
                  }}>
                    {urgency.label}
                  </span>
                </div>

                {/* Due Date & Type */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '12px',
                  color: p.textSecondary,
                  marginTop: '2px'
                }}>
                  <span style={{ fontWeight: 500, color: p.textPrimary }}>
                    {item.formattedDueDate}
                  </span>
                  <span>•</span>
                  <span>{item.deadlineType}</span>
                  <span>•</span>
                  <span style={{ fontStyle: 'italic', color: p.textMuted }}>
                    {item.urgencyLabel}
                  </span>
                </div>

                {/* Description / Instructions */}
                {item.description && (
                  <div style={{
                    fontSize: '12px',
                    color: p.textMuted,
                    backgroundColor: p.surface,
                    padding: '8px 10px',
                    borderRadius: '5px',
                    marginTop: '4px',
                    lineHeight: 1.4
                  }}>
                    {item.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
