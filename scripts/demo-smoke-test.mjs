/**
 * Placement Copilot Demo Smoke Test Script
 * 
 * Executes the complete 3-stage hackathon demo scenario:
 * 1. Eligibility evaluation & 21-day preparation planning for Infosys OA.
 * 2. Application pipeline and urgent deadline retrieval.
 * 3. Daily practice logging and reactive dashboard metrics update.
 */

import { PlacementStore } from '../dist/data/store.js';
import { ProfileTools } from '../dist/modules/placement/tools/profile.tools.js';
import { ApplicationTools } from '../dist/modules/placement/tools/application.tools.js';
import { DeadlineTools } from '../dist/modules/placement/tools/deadline.tools.js';
import { EligibilityTools } from '../dist/modules/placement/tools/eligibility.tools.js';
import { PreparationTools } from '../dist/modules/placement/tools/preparation.tools.js';
import { AnalyticsTools } from '../dist/modules/placement/tools/analytics.tools.js';

// Mock ExecutionContext for testing
const mockCtx = {
  logger: {
    info: (msg, data) => console.log(`[INFO] ${msg}`, data ? JSON.stringify(data) : ''),
    warn: (msg, data) => console.warn(`[WARN] ${msg}`, data ? JSON.stringify(data) : ''),
    error: (msg, data) => console.error(`[ERROR] ${msg}`, data ? JSON.stringify(data) : '')
  }
};

async function runDemo() {
  console.log('====================================================');
  console.log('   PLACEMENT COPILOT - HACKATHON DEMO VERIFICATION   ');
  console.log('====================================================\n');

  const profileTools = new ProfileTools();
  const eligibilityTools = new EligibilityTools();
  const prepTools = new PreparationTools();
  const appTools = new ApplicationTools();
  const deadlineTools = new DeadlineTools();
  const analyticsTools = new AnalyticsTools();

  // -----------------------------------------------------------------
  // SCENARIO 1: "I have three weeks before my Infosys online assessment.
  //             Am I eligible, and what should I prepare?"
  // -----------------------------------------------------------------
  console.log('--- STEP 1: Student Profile Retrieval ---');
  const profileRes = await profileTools.getStudentProfile({}, mockCtx);
  console.log(`Student: ${profileRes.profile.name} (${profileRes.profile.branch})`);
  console.log(`CGPA: ${profileRes.profile.cgpa} | Backlogs: ${profileRes.profile.activeBacklogs}`);
  console.log(`Identified Weak Topics: ${profileRes.profile.weakTopics.join(', ')}`);
  console.log(`✓ Profile loaded successfully.\n`);

  console.log('--- STEP 2: Check Eligibility for Infosys ---');
  const eligRes = await eligibilityTools.checkEligibility({ companyName: 'Infosys' }, mockCtx);
  console.log(`Status: ${eligRes.eligibilityStatus}`);
  console.log(`Summary: ${eligRes.summary}`);
  console.log(`Satisfied: ${eligRes.criteriaBreakdown.satisfiedCriteria.length} criteria`);
  console.log(`Skills Matched: ${eligRes.skillsAnalysis.matchedSkills.join(', ')}`);
  if (eligRes.eligibilityStatus !== 'Eligible') {
    throw new Error('Expected student to be eligible for Infosys!');
  }
  console.log(`✓ Eligibility check passed.\n`);

  console.log('--- STEP 3: Generate 21-Day Adaptive Preparation Plan ---');
  const planRes = await prepTools.generatePrepPlan({
    targetCompany: 'Infosys',
    recruitmentRound: 'OA',
    totalDays: 21,
    dailyStudyHours: 3
  }, mockCtx);
  console.log(`Plan ID: ${planRes.planId}`);
  console.log(`Total Days: ${planRes.totalDays} | Total Study Hours: ${planRes.totalStudyHoursPlanned}h`);
  console.log(`Tasks Generated: ${planRes.schedule.length}`);
  console.log(`Top Priority Topics:`);
  for (const t of planRes.topPrioritizedTopics.slice(0, 3)) {
    console.log(`  - ${t.topic} (${t.category}): Priority ${t.calculatedPriority} [Importance: ${t.importance}, Confidence: ${t.confidence}]`);
  }
  console.log(`Sample Day 1 Task: Day ${planRes.schedule[0].dayNumber} - ${planRes.schedule[0].taskDescription}`);
  console.log(`Sample Day 21 Task: Day ${planRes.schedule[20].dayNumber} - ${planRes.schedule[20].taskDescription}`);
  console.log(`✓ 21-day plan generated successfully.\n`);

  // -----------------------------------------------------------------
  // SCENARIO 2: "Show me my applications and upcoming deadlines."
  // -----------------------------------------------------------------
  console.log('--- STEP 4: Applications Kanban Retrieval ---');
  const appsRes = await appTools.listApplications({}, mockCtx);
  console.log(`Total Tracked Applications: ${appsRes.totalCount}`);
  console.log(`Stage Distribution:`, appsRes.stageCounts);
  console.log(`Companies: ${appsRes.applications.map(a => `${a.companyName} (${a.stage})`).join(', ')}`);
  console.log(`✓ Applications listed successfully.\n`);

  console.log('--- STEP 5: Deadlines & Urgency Inspection ---');
  const deadRes = await deadlineTools.listUpcomingDeadlines({ maxDaysAhead: 30 }, mockCtx);
  console.log(`Total Upcoming Deadlines: ${deadRes.summary.total}`);
  console.log(`Critical (< 24h): ${deadRes.summary.within24Hours}`);
  console.log(`High Priority (< 3d): ${deadRes.summary.within3Days}`);
  for (const d of deadRes.deadlines) {
    console.log(`  • ${d.companyName} (${d.deadlineType}): ${d.formattedDueDate} [${d.urgencyLabel}]`);
  }
  console.log(`✓ Deadlines retrieved successfully.\n`);

  // -----------------------------------------------------------------
  // SCENARIO 3: "I solved 5 graph problems today."
  // -----------------------------------------------------------------
  console.log('--- STEP 6: Pre-Practice Progress Snapshot ---');
  const preAnalytics = await analyticsTools.getPlacementDashboard({}, mockCtx);
  const preSolved = preAnalytics.studyConsistencyAndPractice.totalProblemsSolved;
  const preHours = preAnalytics.studyConsistencyAndPractice.totalStudyHoursLogged;
  const preReadiness = preAnalytics.overallReadiness.scorePercentage;
  console.log(`Pre-Practice Solved: ${preSolved} | Hours: ${preHours}h | Readiness: ${preReadiness}%\n`);

  console.log('--- STEP 7: Log 5 Graph Problems Practice ---');
  const logRes = await prepTools.logPractice({
    topic: 'Graph Algorithms',
    category: 'DSA',
    problemsSolved: 5,
    studyHours: 2.5,
    notes: 'Implemented BFS/DFS on grid and Dijkstra shortest path.',
    newConfidence: 3
  }, mockCtx);
  console.log(`Log Status: ${logRes.status}`);
  console.log(`Log Message: ${logRes.message}`);
  console.log(`Updated Topic Stats: Solved ${logRes.updatedTopicProgress.problemsSolvedTotal}/${logRes.updatedTopicProgress.targetProblems} (Confidence: ${logRes.updatedTopicProgress.confidence}/5)\n`);

  console.log('--- STEP 8: Post-Practice Reactive Metrics Verification ---');
  const postAnalytics = await analyticsTools.getPlacementDashboard({}, mockCtx);
  const postSolved = postAnalytics.studyConsistencyAndPractice.totalProblemsSolved;
  const postHours = postAnalytics.studyConsistencyAndPractice.totalStudyHoursLogged;
  const postReadiness = postAnalytics.overallReadiness.scorePercentage;

  console.log(`Post-Practice Solved: ${postSolved} (Delta: +${postSolved - preSolved})`);
  console.log(`Post-Practice Hours: ${postHours}h (Delta: +${(postHours - preHours).toFixed(1)}h)`);
  console.log(`Post-Practice Readiness: ${postReadiness}%`);

  if (postSolved !== preSolved + 5) {
    throw new Error(`Solved count mismatch: expected ${preSolved + 5}, got ${postSolved}`);
  }
  if (Math.abs((postHours - preHours) - 2.5) > 0.01) {
    throw new Error(`Study hours mismatch: expected delta 2.5, got ${postHours - preHours}`);
  }

  console.log('\n====================================================');
  console.log('   ALL 8 DEMO STEPS PASSED VERIFICATION (100% OK)    ');
  console.log('====================================================');
}

runDemo().catch(err => {
  console.error('Demo verification failed:', err);
  process.exit(1);
});
