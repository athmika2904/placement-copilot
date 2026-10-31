/**
 * Placement Copilot Validation Utilities
 */

import { RecruitmentStage } from '../data/types.js';

export const VALID_RECRUITMENT_STAGES: RecruitmentStage[] = [
  'Interested',
  'Applied',
  'OA',
  'Interview',
  'Offer',
  'Rejected'
];

/**
 * Valid stage transition graph:
 * Defines allowed next stages from any current recruitment stage.
 */
export const ALLOWED_STAGE_TRANSITIONS: Record<RecruitmentStage, RecruitmentStage[]> = {
  Interested: ['Applied', 'Rejected'],
  Applied: ['OA', 'Interview', 'Rejected'],
  OA: ['Interview', 'Rejected'],
  Interview: ['Offer', 'Rejected'],
  Offer: ['Rejected'], // e.g. offer declined or retracted
  Rejected: ['Applied', 'Interested'] // reapplication or reconsideration
};

export function isValidStageTransition(currentStage: RecruitmentStage, nextStage: RecruitmentStage): {
  valid: boolean;
  reason?: string;
} {
  if (currentStage === nextStage) {
    return { valid: true };
  }

  const allowed = ALLOWED_STAGE_TRANSITIONS[currentStage];
  if (!allowed || !allowed.includes(nextStage)) {
    return {
      valid: false,
      reason: `Cannot transition application directly from '${currentStage}' to '${nextStage}'. Allowed transitions: [${(allowed || []).join(', ')}]`
    };
  }

  return { valid: true };
}
