'use client';

import React, { useState, useMemo } from 'react';
import { useTheme, useWidgetSDK } from '@nitrostack/widgets';

interface StudyTask {
  id: string;
  dayNumber: number;
  date: string;
  category: string;
  topic: string;
  taskDescription: string;
  allocatedHours: number;
  isCompleted: boolean;
  type: 'learning' | 'practice' | 'revision' | 'mock_test';
}

interface PlanOutput {
  status?: string;
  planId?: string;
  targetCompany?: string;
  recruitmentRound?: string;
  totalDays?: number;
  dailyStudyHours?: number;
  totalStudyHoursPlanned?: number;
  schedule?: StudyTask[];
  summary?: string;
}

const DEFAULT_SCHEDULE: StudyTask[] = [
  { id: 'task-1', dayNumber: 1, date: '2026-11-01', category: 'DSA', topic: 'Dynamic Programming', taskDescription: 'Understand 1D Memoization vs Tabulation. Solve Climbing Stairs & House Robber.', allocatedHours: 3, isCompleted: true, type: 'learning' },
  { id: 'task-2', dayNumber: 2, date: '2026-11-02', category: 'DSA', topic: 'Dynamic Programming', taskDescription: '0/1 Knapsack patterns. Solve Coin Change I & II, Subset Sum.', allocatedHours: 3, isCompleted: true, type: 'practice' },
  { id: 'task-3', dayNumber: 3, date: '2026-11-03', category: 'DSA', topic: 'Graph Algorithms', taskDescription: 'Graph representation, BFS, DFS, and cycle detection in directed graphs.', allocatedHours: 3, isCompleted: false, type: 'learning' },
  { id: 'task-4', dayNumber: 4, date: '2026-11-04', category: 'DSA', topic: 'Graph Algorithms', taskDescription: 'Dijkstra shortest path algorithm & Topological Sort (Kahn\'s algorithm).', allocatedHours: 3, isCompleted: false, type: 'practice' },
  { id: 'task-5', dayNumber: 5, date: '2026-11-05', category: 'DSA', topic: 'Trees & BST', taskDescription: 'Lowest Common Ancestor, Tree diameters, and BST validation.', allocatedHours: 3, isCompleted: false, type: 'practice' },
  { id: 'task-6', dayNumber: 6, date: '2026-11-06', category: 'DBMS', topic: 'DBMS & SQL Queries', taskDescription: 'Practice complex SQL joins and window functions (RANK, DENSE_RANK).', allocatedHours: 3, isCompleted: false, type: 'practice' },
  { id: 'task-7', dayNumber: 7, date: '2026-11-07', category: 'Technical Interviews', topic: 'Infosys Specialist Mock OA', taskDescription: 'Timed 3-hour mock coding contest (3 questions) replicating HackerEarth exam.', allocatedHours: 3, isCompleted: false, type: 'mock_test' }
];

export default function WeeklyPlannerWidget() {
  const theme = useTheme();
  const { getToolOutput, callTool } = useWidgetSDK();
  const rawData = getToolOutput<any>();

  // Defensively extract schedule array
  const schedule: StudyTask[] = useMemo(() => {
    if (rawData && Array.isArray(rawData.schedule) && rawData.schedule.length > 0) {
      return rawData.schedule;
    }
    if (rawData?.plan && Array.isArray(rawData.plan.schedule) && rawData.plan.schedule.length > 0) {
      return rawData.plan.schedule;
    }
    return DEFAULT_SCHEDULE;
  }, [rawData]);

  const targetCompany = rawData?.targetCompany || rawData?.plan?.targetCompany || 'Infosys';
  const recruitmentRound = rawData?.recruitmentRound || rawData?.plan?.recruitmentRound || 'Online Assessment (OA)';
  const totalDays = rawData?.totalDays || rawData?.plan?.totalDays || schedule.length || 21;
  const dailyStudyHours = rawData?.dailyStudyHours || rawData?.plan?.dailyStudyHours || 3;
  const totalStudyHoursPlanned = rawData?.totalStudyHoursPlanned || (totalDays * dailyStudyHours);
  const summary = rawData?.summary || rawData?.plan?.summary || `21-day adaptive preparation roadmap targeting ${targetCompany} (${recruitmentRound}). Top priority given to weak areas: Dynamic Programming and Graph Algorithms.`;

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed'>('all');

  const isDark = theme === 'dark';

  const p = {
    bg: isDark ? '#141413' : '#F4F1E9',
    surface: isDark ? '#1E1E1C' : '#FAF9F5',
    card: isDark ? '#262624' : '#FFFFFF',
    border: isDark ? '#33332E' : '#E6E2D8',
    textPrimary: isDark ? '#F5F4F0' : '#252522',
    textSecondary: isDark ? '#9B9A91' : '#68705A',
    textMuted: isDark ? '#6B6A63' : '#8A897F',
    accent: '#5E6652'
  };

  const handleToggleTask = async (task: StudyTask) => {
    const nextState = !completedTasks[task.id];
    setCompletedTasks(prev => ({ ...prev, [task.id]: nextState }));

    if (nextState) {
      try {
        await callTool('log_practice', {
          topic: task.topic,
          category: task.category,
          problemsSolved: 4,
          studyHours: task.allocatedHours,
          notes: `Completed planned study task: ${task.taskDescription}`
        });
      } catch (e) {
        console.error('Failed to log practice for completed task', e);
      }
    }
  };

  const totalTasks = schedule.length;
  const doneCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPct = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

  const visibleTasks = schedule.filter(t => {
    const isDone = !!completedTasks[t.id] || (t.isCompleted && completedTasks[t.id] === undefined);
    if (activeTab === 'pending') return !isDone;
    if (activeTab === 'completed') return isDone;
    return true;
  });

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
      backgroundColor: p.bg,
      color: p.textPrimary,
      padding: '24px',
      borderRadius: '12px',
      maxWidth: '820px',
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
            Study Roadmap
          </span>
          <h1 style={{
            margin: '4px 0 0 0',
            fontSize: '22px',
            fontWeight: 600,
            letterSpacing: '-0.4px',
            color: p.textPrimary
          }}>
            {targetCompany} • {recruitmentRound}
          </h1>
          <div style={{ fontSize: '12.5px', color: p.textMuted, marginTop: '2px' }}>
            {totalDays}-Day Sprint • {dailyStudyHours} hours/day ({totalStudyHoursPlanned} total study hours)
          </div>
        </div>

        {/* Progress Metric */}
        <div style={{
          backgroundColor: p.surface,
          border: `1px solid ${p.border}`,
          borderRadius: '8px',
          padding: '8px 14px',
          textAlign: 'right'
        }}>
          <div style={{ fontSize: '11px', color: p.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Schedule Completion
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: p.textPrimary }}>
            {doneCount} / {totalTasks} ({progressPct}%)
          </div>
        </div>
      </div>

      {/* Summary Note */}
      <div style={{
        backgroundColor: p.surface,
        borderRadius: '6px',
        border: `1px solid ${p.border}`,
        padding: '10px 14px',
        fontSize: '12.5px',
        color: p.textSecondary,
        lineHeight: 1.45,
        marginBottom: '18px'
      }}>
        {summary}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px'
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'all', label: `All Tasks (${totalTasks})` },
            { id: 'pending', label: `Pending (${Math.max(0, totalTasks - doneCount)})` },
            { id: 'completed', label: `Completed (${doneCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: 500,
                borderRadius: '6px',
                border: `1px solid ${activeTab === tab.id ? p.textPrimary : p.border}`,
                backgroundColor: activeTab === tab.id ? p.textPrimary : p.surface,
                color: activeTab === tab.id ? (isDark ? '#141413' : '#FFFFFF') : p.textSecondary,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Daily Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {visibleTasks.map((task) => {
          const isDone = !!completedTasks[task.id] || (task.isCompleted && completedTasks[task.id] === undefined);

          return (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task)}
              style={{
                backgroundColor: p.card,
                borderRadius: '8px',
                border: `1px solid ${p.border}`,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer',
                opacity: isDone ? 0.7 : 1,
                transition: 'opacity 0.2s ease, background-color 0.15s ease'
              }}
            >
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={isDone}
                onChange={() => {}} // handled by parent onClick
                style={{
                  marginTop: '3px',
                  cursor: 'pointer',
                  accentColor: p.accent,
                  width: '16px',
                  height: '16px'
                }}
              />

              {/* Task Details */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '0.3px',
                    color: p.textSecondary,
                    textTransform: 'uppercase'
                  }}>
                    Day {task.dayNumber}
                  </span>
                  <span style={{ fontSize: '11px', color: p.textMuted }}>•</span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: isDark ? '#2D2D27' : '#EDEAE1',
                    color: p.textPrimary
                  }}>
                    {task.topic}
                  </span>
                  <span style={{ fontSize: '11px', color: p.textMuted }}>•</span>
                  <span style={{ fontSize: '11px', color: p.textMuted }}>
                    {task.allocatedHours} hrs
                  </span>
                </div>

                <div style={{
                  fontSize: '13px',
                  color: isDone ? p.textMuted : p.textPrimary,
                  textDecoration: isDone ? 'line-through' : 'none',
                  lineHeight: 1.4
                }}>
                  {task.taskDescription}
                </div>
              </div>

              {/* Task Type Badge */}
              <span style={{
                fontSize: '10.5px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: p.surface,
                color: p.textMuted,
                border: `1px solid ${p.border}`,
                textTransform: 'capitalize'
              }}>
                {task.type.replace('_', ' ')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
