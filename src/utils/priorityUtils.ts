/**
 * Placement Copilot Topic Prioritization Heuristic
 * 
 * Heuristic: Priority = Topic Importance × (6 - Confidence)
 * Topic Importance: 1 (Lowest) to 5 (Highest)
 * Student Confidence: 1 (Novice) to 5 (Mastery)
 * 
 * Maximum Priority = 5 × (6 - 1) = 25 (High importance, lowest confidence)
 * Minimum Priority = 1 × (6 - 5) = 1  (Low importance, high confidence)
 */

import { PrepCategory, TopicConfidence, StudentProfile } from '../data/types.js';

export interface PrioritizedTopic {
  topic: string;
  category: PrepCategory;
  importance: number;
  confidence: number;
  priorityScore: number;
  reason: string;
}

export function calculatePriorityScore(importance: number, confidence: number): number {
  const boundedImportance = Math.max(1, Math.min(5, importance));
  const boundedConfidence = Math.max(1, Math.min(5, confidence));
  return boundedImportance * (6 - boundedConfidence);
}

export function prioritizeTopics(
  storedConfidences: TopicConfidence[],
  profile: StudentProfile,
  targetCompany?: string,
  targetRound?: string
): PrioritizedTopic[] {
  const result: PrioritizedTopic[] = [];

  for (const tc of storedConfidences) {
    let effectiveConfidence = tc.confidence;
    let effectiveImportance = tc.importance;

    // If topic is in weakTopics, lower confidence if higher
    const isExplicitlyWeak = profile.weakTopics.some(w => 
      tc.topic.toLowerCase().includes(w.toLowerCase()) || w.toLowerCase().includes(tc.topic.toLowerCase())
    );
    if (isExplicitlyWeak) {
      effectiveConfidence = Math.min(effectiveConfidence, 2);
    }

    // If topic is in strongTopics, raise confidence if lower
    const isExplicitlyStrong = profile.strongTopics.some(s => 
      tc.topic.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(tc.topic.toLowerCase())
    );
    if (isExplicitlyStrong) {
      effectiveConfidence = Math.max(effectiveConfidence, 4);
    }

    // Company specific importance boost (e.g. Infosys / Google heavily focus on DP & Graphs)
    if (targetCompany) {
      const compLower = targetCompany.toLowerCase();
      if ((compLower.includes('infosys') || compLower.includes('google')) && 
          (tc.topic.toLowerCase().includes('graph') || tc.topic.toLowerCase().includes('dynamic programming'))) {
        effectiveImportance = 5;
      }
      if (compLower.includes('amazon') && 
          (tc.topic.toLowerCase().includes('tree') || tc.category === 'OOP' || tc.category === 'Operating Systems')) {
        effectiveImportance = 5;
      }
    }

    // Round specific boost
    if (targetRound?.toLowerCase().includes('oa')) {
      if (tc.category === 'DSA') {
        effectiveImportance = Math.min(5, effectiveImportance + 1);
      }
    } else if (targetRound?.toLowerCase().includes('interview')) {
      if (['Core CS', 'DBMS', 'Operating Systems', 'OOP', 'Technical Interviews'].includes(tc.category)) {
        effectiveImportance = Math.min(5, effectiveImportance + 1);
      }
    }

    const priorityScore = calculatePriorityScore(effectiveImportance, effectiveConfidence);

    let reason = '';
    if (effectiveConfidence <= 2 && effectiveImportance >= 4) {
      reason = 'High-frequency recruitment topic with identified skill gap. Top preparation priority.';
    } else if (effectiveConfidence <= 3) {
      reason = 'Moderate confidence topic requiring structured problem practice.';
    } else {
      reason = 'Strong baseline topic. Scheduled for light revision and timed mock sessions.';
    }

    result.push({
      topic: tc.topic,
      category: tc.category,
      importance: effectiveImportance,
      confidence: effectiveConfidence,
      priorityScore,
      reason
    });
  }

  // Sort descending by priority score
  return result.sort((a, b) => b.priorityScore - a.priorityScore);
}
