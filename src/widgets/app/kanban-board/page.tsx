'use client';

import React, { useState } from 'react';
import { useTheme, useWidgetSDK } from '@nitrostack/widgets';

interface Application {
  id: string;
  companyName: string;
  jobRole: string;
  applicationDate: string;
  stage: 'Interested' | 'Applied' | 'OA' | 'Interview' | 'Offer' | 'Rejected';
  applicationDeadline?: string;
  oaDate?: string;
  interviewDate?: string;
  notes?: string;
  eligibilityStatus?: string;
}

interface ToolOutput {
  status: string;
  totalCount: number;
  stageCounts: Record<string, number>;
  applications: Application[];
}

const STAGES: Array<Application['stage']> = [
  'Interested',
  'Applied',
  'OA',
  'Interview',
  'Offer',
  'Rejected'
];

export default function KanbanBoardWidget() {
  const theme = useTheme();
  const { getToolOutput, callTool } = useWidgetSDK();
  const [filterQuery, setFilterQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const rawData = getToolOutput<ToolOutput>();

  const applications: Application[] = rawData?.applications || [
    { id: 'app-001', companyName: 'Microsoft', jobRole: 'Software Engineer', stage: 'Interested', applicationDeadline: '2026-11-01', applicationDate: '2026-10-25', notes: 'Alumni referral requested. Tailored systems resume.' },
    { id: 'app-002', companyName: 'Google', jobRole: 'Software Engineer', stage: 'Applied', applicationDeadline: '2026-10-31', oaDate: '2026-11-15', applicationDate: '2026-10-18' },
    { id: 'app-003', companyName: 'Infosys', jobRole: 'Specialist Programmer', stage: 'OA', oaDate: '2026-11-21', applicationDate: '2026-10-15', notes: 'Hackerearth 3-hour assessment. DP & Graph focus.' },
    { id: 'app-004', companyName: 'Amazon', jobRole: 'SDE-1', stage: 'Interview', interviewDate: '2026-11-03', applicationDate: '2026-09-28', notes: 'Technical Round 1 scheduled: Trees & System Decomposition.' },
    { id: 'app-005', companyName: 'TCS', jobRole: 'Digital Developer', stage: 'Offer', applicationDate: '2026-09-10', notes: 'Official offer received. 9 LPA baseline.' },
    { id: 'app-006', companyName: 'Uber', jobRole: 'Software Engineer', stage: 'Rejected', applicationDate: '2026-09-01' }
  ];

  const isDark = theme === 'dark';

  // Sophisticated Editorial/SaaS Palette
  const p = {
    bg: isDark ? '#141413' : '#F4F1E9',
    surface: isDark ? '#1E1E1C' : '#FAF9F5',
    card: isDark ? '#262624' : '#FFFFFF',
    border: isDark ? '#33332E' : '#E6E2D8',
    textPrimary: isDark ? '#F5F4F0' : '#252522',
    textSecondary: isDark ? '#9B9A91' : '#68705A',
    textMuted: isDark ? '#6B6A63' : '#8A897F',
    accent: '#5E6652',
    tagBg: isDark ? '#2A2A26' : '#EFECE4'
  };

  const stageTheme: Record<Application['stage'], { badgeBg: string; badgeColor: string }> = {
    Interested: { badgeBg: isDark ? '#282824' : '#EAE8E1', badgeColor: isDark ? '#C7C6BD' : '#57564F' },
    Applied: { badgeBg: isDark ? '#1F2937' : '#E8EEF5', badgeColor: isDark ? '#93C5FD' : '#2A5885' },
    OA: { badgeBg: isDark ? '#332714' : '#FEF3C7', badgeColor: isDark ? '#FDE68A' : '#92400E' },
    Interview: { badgeBg: isDark ? '#291D3B' : '#F1EDFA', badgeColor: isDark ? '#D8B4FE' : '#5B21B6' },
    Offer: { badgeBg: isDark ? '#143024' : '#DCFCE7', badgeColor: isDark ? '#86EFAC' : '#166534' },
    Rejected: { badgeBg: isDark ? '#301818' : '#FEE2E2', badgeColor: isDark ? '#FCA5A5' : '#991B1B' }
  };

  const getNextStage = (current: Application['stage']): Application['stage'] | null => {
    switch (current) {
      case 'Interested': return 'Applied';
      case 'Applied': return 'OA';
      case 'OA': return 'Interview';
      case 'Interview': return 'Offer';
      default: return null;
    }
  };

  const handleAdvance = async (app: Application, nextStage: Application['stage']) => {
    try {
      setUpdatingId(app.id);
      await callTool('update_application_status', { id: app.id, stage: nextStage });
      await callTool('list_applications', {});
    } catch (err) {
      console.error('Error transitioning stage', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = applications.filter(a =>
    a.companyName.toLowerCase().includes(filterQuery.toLowerCase()) ||
    a.jobRole.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      backgroundColor: p.bg,
      color: p.textPrimary,
      padding: '24px',
      borderRadius: '12px',
      minWidth: '920px',
      maxWidth: '1280px',
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      {/* Top Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${p.border}`
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', color: p.textSecondary, fontWeight: 600 }}>
              Applications
            </span>
            <span style={{ fontSize: '12px', color: p.textMuted }}>•</span>
            <span style={{ fontSize: '13px', color: p.textMuted }}>
              {applications.length} tracked companies
            </span>
          </div>
          <h1 style={{
            margin: '4px 0 0 0',
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '-0.4px',
            color: p.textPrimary
          }}>
            Recruitment Funnel
          </h1>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Search company or role..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              padding: '7px 12px',
              fontSize: '13px',
              borderRadius: '6px',
              border: `1px solid ${p.border}`,
              backgroundColor: p.surface,
              color: p.textPrimary,
              outline: 'none',
              width: '210px',
              fontFamily: 'inherit'
            }}
          />
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '12px',
        alignItems: 'start'
      }}>
        {STAGES.map((stage) => {
          const colApps = filtered.filter(a => a.stage === stage);
          const st = stageTheme[stage];

          return (
            <div
              key={stage}
              style={{
                backgroundColor: p.surface,
                borderRadius: '8px',
                border: `1px solid ${p.border}`,
                padding: '10px',
                minHeight: '420px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Column Title */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
                paddingBottom: '8px',
                borderBottom: `1px solid ${p.border}`
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.3px',
                  color: p.textPrimary
                }}>
                  {stage}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: st.badgeBg,
                  color: st.badgeColor
                }}>
                  {colApps.length}
                </span>
              </div>

              {/* Application Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {colApps.length === 0 ? (
                  <div style={{
                    padding: '32px 8px',
                    textAlign: 'center',
                    color: p.textMuted,
                    fontSize: '11px',
                    letterSpacing: '0.2px'
                  }}>
                    No records
                  </div>
                ) : (
                  colApps.map((app) => {
                    const next = getNextStage(app.stage);
                    const isBusy = updatingId === app.id;

                    return (
                      <div
                        key={app.id}
                        style={{
                          backgroundColor: p.card,
                          borderRadius: '6px',
                          border: `1px solid ${p.border}`,
                          padding: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '5px'
                        }}
                      >
                        {/* Company & Role */}
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: p.textPrimary }}>
                            {app.companyName}
                          </div>
                          <div style={{ fontSize: '11.5px', color: p.textSecondary, marginTop: '1px' }}>
                            {app.jobRole}
                          </div>
                        </div>

                        {/* Event Tags */}
                        {app.oaDate && (
                          <div style={{
                            fontSize: '11px',
                            color: '#B45309',
                            backgroundColor: isDark ? '#2D220E' : '#FEF3C7',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            width: 'fit-content',
                            marginTop: '2px'
                          }}>
                            OA • {app.oaDate}
                          </div>
                        )}
                        {app.interviewDate && (
                          <div style={{
                            fontSize: '11px',
                            color: '#6D28D9',
                            backgroundColor: isDark ? '#261938' : '#EDE9FE',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            width: 'fit-content',
                            marginTop: '2px'
                          }}>
                            Interview • {app.interviewDate}
                          </div>
                        )}
                        {app.applicationDeadline && (
                          <div style={{
                            fontSize: '11px',
                            color: '#065F46',
                            backgroundColor: isDark ? '#14291F' : '#D1FAE5',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            width: 'fit-content',
                            marginTop: '2px'
                          }}>
                            Deadline • {app.applicationDeadline}
                          </div>
                        )}

                        {app.notes && (
                          <div style={{
                            fontSize: '11px',
                            color: p.textMuted,
                            lineHeight: 1.35,
                            marginTop: '2px',
                            borderTop: `1px dashed ${p.border}`,
                            paddingTop: '4px'
                          }}>
                            {app.notes}
                          </div>
                        )}

                        {/* Transition Action */}
                        {next && (
                          <button
                            disabled={isBusy}
                            onClick={() => handleAdvance(app, next)}
                            style={{
                              marginTop: '6px',
                              padding: '4px 8px',
                              fontSize: '11px',
                              fontWeight: 500,
                              borderRadius: '4px',
                              border: `1px solid ${p.border}`,
                              backgroundColor: p.surface,
                              color: p.textPrimary,
                              cursor: isBusy ? 'wait' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              transition: 'background-color 0.15s ease'
                            }}
                          >
                            {isBusy ? 'Saving...' : `Advance to ${next} →`}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
