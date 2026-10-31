'use client';

import React from 'react';
import { useTheme, useWidgetSDK } from '@nitrostack/widgets';

interface DashboardOutput {
  status?: string;
  studentProfile?: {
    name?: string;
    college?: string;
    branch?: string;
    cgpa?: number;
    graduationYear?: number;
    dailyAvailableHours?: number;
  };
  overallReadiness?: {
    scorePercentage?: number;
    rating?: string;
    calculationFormula?: string;
  };
  categoryBreakdowns?: {
    dsa?: { percentage?: number; weight?: string };
    coreCs?: { percentage?: number; weight?: string };
    sql?: { percentage?: number; weight?: string };
    aptitude?: { percentage?: number; weight?: string };
  };
  applicationsFunnel?: {
    totalTracked?: number;
    stageBreakdown?: Record<string, number>;
    activeRecruitmentPipelines?: number;
    offersSecured?: number;
  };
  studyConsistencyAndPractice?: {
    totalStudyHoursLogged?: number;
    totalProblemsSolved?: number;
    practiceStreakDays?: number;
    recentPracticeLogs?: Array<{ topic: string; category: string; problemsSolved: number; studyHours: number; date: string }>;
  };
  weakTopicsNeedingAttention?: Array<{ topic: string; category: string; confidence: string; progress: string }>;
  strongTopicsMastered?: Array<{ topic: string; category: string; confidence: string; progress: string }>;
  actionableRecommendations?: string[];
}

export default function PreparationDashboardWidget() {
  const theme = useTheme();
  const { getToolOutput } = useWidgetSDK();
  const raw = getToolOutput<any>();

  // Deep safe resolution
  const profile = {
    name: raw?.studentProfile?.name || 'Rahul Sharma',
    college: raw?.studentProfile?.college || 'National Institute of Technology',
    branch: raw?.studentProfile?.branch || 'Computer Science and Engineering',
    cgpa: raw?.studentProfile?.cgpa ?? 8.42,
    graduationYear: raw?.studentProfile?.graduationYear || 2026,
    dailyAvailableHours: raw?.studentProfile?.dailyAvailableHours || 3
  };

  const readiness = {
    scorePercentage: raw?.overallReadiness?.scorePercentage ?? 72,
    rating: raw?.overallReadiness?.rating || 'Strong Candidate (Competitive for Product Roles)',
    formula: raw?.overallReadiness?.calculationFormula || 'Weighted: DSA (40%) + Core CS (30%) + SQL (15%) + Aptitude (15%)'
  };

  const categories = {
    dsa: raw?.categoryBreakdowns?.dsa?.percentage ?? 69,
    coreCs: raw?.categoryBreakdowns?.coreCs?.percentage ?? 74,
    sql: raw?.categoryBreakdowns?.sql?.percentage ?? 91,
    aptitude: raw?.categoryBreakdowns?.aptitude?.percentage ?? 80
  };

  const funnel = {
    total: raw?.applicationsFunnel?.totalTracked ?? 6,
    active: raw?.applicationsFunnel?.activeRecruitmentPipelines ?? 3,
    offers: raw?.applicationsFunnel?.offersSecured ?? 1
  };

  const consistency = {
    hours: raw?.studyConsistencyAndPractice?.totalStudyHoursLogged ?? 7.5,
    problems: raw?.studyConsistencyAndPractice?.totalProblemsSolved ?? 179,
    streak: raw?.studyConsistencyAndPractice?.practiceStreakDays ?? 3
  };

  const weakTopics = Array.isArray(raw?.weakTopicsNeedingAttention) && raw.weakTopicsNeedingAttention.length > 0
    ? raw.weakTopicsNeedingAttention
    : [
        { topic: 'Dynamic Programming', category: 'DSA', confidence: '2/5', progress: '16 / 50 (32%)' },
        { topic: 'Graph Algorithms', category: 'DSA', confidence: '2/5', progress: '12 / 45 (27%)' },
        { topic: 'Operating Systems (Concurrency)', category: 'OS', confidence: '2/5', progress: '14 / 30 (47%)' }
      ];

  const recommendations = Array.isArray(raw?.actionableRecommendations) && raw.actionableRecommendations.length > 0
    ? raw.actionableRecommendations
    : [
        'Focus next 2 study sessions on Dynamic Programming and Graph BFS/DFS.',
        'Submit Microsoft application before 24-hour portal close deadline.',
        'Revise Amazon Leadership Principles ahead of Technical Round 1.'
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
    accent: '#5E6652',
    barBg: isDark ? '#33332D' : '#E8E5DC',
    barFill: isDark ? '#7E876F' : '#5E6652'
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      backgroundColor: p.bg,
      color: p.textPrimary,
      padding: '24px',
      borderRadius: '12px',
      maxWidth: '880px',
      margin: '0 auto',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${p.border}`
      }}>
        <div>
          <span style={{ fontSize: '13px', letterSpacing: '1px', textTransform: 'uppercase', color: p.textSecondary, fontWeight: 600 }}>
            Readiness Analytics
          </span>
          <h1 style={{
            margin: '4px 0 0 0',
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '-0.4px',
            color: p.textPrimary
          }}>
            Placement Command Center
          </h1>
          <div style={{ fontSize: '12.5px', color: p.textMuted, marginTop: '2px' }}>
            {profile.name} • {profile.branch} (CGPA {profile.cgpa.toFixed(2)})
          </div>
        </div>

        {/* Readiness Pill */}
        <div style={{
          backgroundColor: p.surface,
          border: `1px solid ${p.border}`,
          borderRadius: '8px',
          padding: '8px 14px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '11px', color: p.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Overall Readiness
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: p.textPrimary, letterSpacing: '-0.5px' }}>
            {readiness.scorePercentage}%
          </div>
        </div>
      </div>

      {/* Top 4 Key Metric Tiles */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {[
          { label: 'Problems Solved', value: consistency.problems, sub: 'Across all topics' },
          { label: 'Hours Dedicated', value: `${consistency.hours}h`, sub: 'Logged practice time' },
          { label: 'Active Pipelines', value: funnel.active, sub: 'Applied • OA • Interview' },
          { label: 'Offers Secured', value: funnel.offers, sub: `${funnel.offers} offer in hand` }
        ].map((tile, i) => (
          <div
            key={i}
            style={{
              backgroundColor: p.card,
              borderRadius: '8px',
              border: `1px solid ${p.border}`,
              padding: '12px 14px'
            }}
          >
            <div style={{ fontSize: '11px', color: p.textSecondary, fontWeight: 500 }}>
              {tile.label}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: p.textPrimary, margin: '4px 0 2px 0' }}>
              {tile.value}
            </div>
            <div style={{ fontSize: '11px', color: p.textMuted }}>
              {tile.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Categories vs Topic Diagnostics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Category Progress Bars */}
        <div style={{
          backgroundColor: p.card,
          borderRadius: '8px',
          border: `1px solid ${p.border}`,
          padding: '16px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: p.textPrimary, marginBottom: '14px' }}>
            Category Mastery
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Data Structures & Algorithms', pct: categories.dsa, weight: '40% weight' },
              { label: 'Core Computer Science (DBMS, OS, OOP)', pct: categories.coreCs, weight: '30% weight' },
              { label: 'SQL & Query Optimization', pct: categories.sql, weight: '15% weight' },
              { label: 'Quantitative & Analytical Aptitude', pct: categories.aptitude, weight: '15% weight' }
            ].map((cat, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 500, color: p.textPrimary }}>{cat.label}</span>
                  <span style={{ color: p.textSecondary, fontWeight: 600 }}>{cat.pct}%</span>
                </div>
                <div style={{
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: p.barBg,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${cat.pct}%`,
                    height: '100%',
                    backgroundColor: p.barFill,
                    borderRadius: '3px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            fontSize: '11px',
            color: p.textMuted,
            marginTop: '16px',
            paddingTop: '10px',
            borderTop: `1px dashed ${p.border}`
          }}>
            {readiness.formula}
          </div>
        </div>

        {/* Weak Topics Needing Attention */}
        <div style={{
          backgroundColor: p.card,
          borderRadius: '8px',
          border: `1px solid ${p.border}`,
          padding: '16px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: p.textPrimary, marginBottom: '12px' }}>
            Areas for Focused Review
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {weakTopics.map((t, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: p.surface,
                  borderRadius: '6px',
                  border: `1px solid ${p.border}`,
                  padding: '9px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 500, color: p.textPrimary }}>
                    {t.topic}
                  </div>
                  <div style={{ fontSize: '11px', color: p.textMuted }}>
                    {t.progress}
                  </div>
                </div>

                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: isDark ? '#332714' : '#FEF3C7',
                  color: isDark ? '#FDE68A' : '#92400E'
                }}>
                  Conf: {t.confidence}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            fontSize: '11px',
            color: p.textSecondary,
            marginTop: '12px',
            lineHeight: 1.4
          }}>
            Prioritized by algorithm: <code style={{ fontSize: '10.5px' }}>Importance × (6 - Confidence)</code>
          </div>
        </div>
      </div>

      {/* Actionable Next Steps Banner */}
      <div style={{
        backgroundColor: p.surface,
        borderRadius: '8px',
        border: `1px solid ${p.border}`,
        padding: '14px 16px'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 600, color: p.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
          Recommended Next Steps
        </div>
        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: p.textPrimary, lineHeight: 1.6 }}>
          {recommendations.map((rec, i) => (
            <li key={i}>{rec}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
