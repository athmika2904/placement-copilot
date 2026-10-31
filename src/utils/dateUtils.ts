/**
 * Placement Copilot Date & Urgency Calculation Utilities
 */

import { RecruitmentDeadline } from '../data/types.js';

export type UrgencyTier = 'OVERDUE' | 'WITHIN_24_HOURS' | 'WITHIN_3_DAYS' | 'WITHIN_7_DAYS' | 'UPCOMING';

export interface EnrichedDeadline extends RecruitmentDeadline {
  remainingDays: number;
  remainingHours: number;
  urgencyTier: UrgencyTier;
  urgencyLabel: string;
  isOverdue: boolean;
  formattedDueDate: string;
}

export function parseDate(dateStr: string): Date {
  // If string is YYYY-MM-DD without time, parse in local or ISO format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(`${dateStr}T23:59:59`);
  }
  return new Date(dateStr);
}

export function enrichDeadline(deadline: RecruitmentDeadline, referenceDate?: Date): EnrichedDeadline {
  const ref = referenceDate || new Date();
  const due = parseDate(deadline.dueDate);
  const diffMs = due.getTime() - ref.getTime();
  const remainingHours = Math.round(diffMs / (1000 * 60 * 60));
  const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  let urgencyTier: UrgencyTier;
  let urgencyLabel: string;
  let isOverdue = false;

  if (diffMs < 0) {
    isOverdue = true;
    urgencyTier = 'OVERDUE';
    const overdueDays = Math.abs(remainingDays);
    urgencyLabel = overdueDays === 0 ? 'Overdue today' : `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`;
  } else if (remainingHours <= 24) {
    urgencyTier = 'WITHIN_24_HOURS';
    urgencyLabel = remainingHours <= 1 ? 'Due in < 1 hour' : `Due in ${remainingHours} hours (Critical)`;
  } else if (remainingDays <= 3) {
    urgencyTier = 'WITHIN_3_DAYS';
    urgencyLabel = `Due in ${remainingDays} days (High Priority)`;
  } else if (remainingDays <= 7) {
    urgencyTier = 'WITHIN_7_DAYS';
    urgencyLabel = `Due in ${remainingDays} days (Upcoming)`;
  } else {
    urgencyTier = 'UPCOMING';
    urgencyLabel = `Due in ${remainingDays} days`;
  }

  const formattedDueDate = due.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: due.getHours() !== 23 || due.getMinutes() !== 59 ? '2-digit' : undefined,
    minute: due.getHours() !== 23 || due.getMinutes() !== 59 ? '2-digit' : undefined
  });

  return {
    ...deadline,
    remainingDays,
    remainingHours,
    urgencyTier,
    urgencyLabel,
    isOverdue,
    formattedDueDate
  };
}

export function sortDeadlinesByUrgency(deadlines: RecruitmentDeadline[], referenceDate?: Date): EnrichedDeadline[] {
  const enriched = deadlines.map(d => enrichDeadline(d, referenceDate));
  return enriched.sort((a, b) => {
    const timeA = parseDate(a.dueDate).getTime();
    const timeB = parseDate(b.dueDate).getTime();
    return timeA - timeB;
  });
}
