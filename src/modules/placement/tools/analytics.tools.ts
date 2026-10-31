import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { PlacementStore } from '../../../data/store.js';
import { sortDeadlinesByUrgency } from '../../../utils/dateUtils.js';

export class AnalyticsTools {
  private store = PlacementStore.getInstance();

  @Tool({
    name: 'get_placement_dashboard',
    description: 'Generate high-level placement command center analytics: overall readiness, category progress, application pipeline, upcoming deadlines, and weak areas',
    inputSchema: z.object({}).describe('No parameters required'),
    examples: {
      request: {},
      response: {
        status: 'success',
        overallReadiness: {
          percentage: 72,
          rating: 'Placement Ready (Solid Foundation)',
          formula: 'Weighted Composite: DSA (40%) + Core CS (30%) + SQL (15%) + Aptitude (15%)'
        },
        progressByCategory: {
          dsa: { solved: 179, target: 260, percentage: 69 },
          coreCs: { solved: 85, target: 115, percentage: 74 },
          sql: { solved: 32, target: 35, percentage: 91 },
          aptitude: { solved: 40, target: 50, percentage: 80 }
        },
        applicationsFunnel: {
          total: 6,
          byStage: { Interested: 1, Applied: 1, OA: 1, Interview: 1, Offer: 1, Rejected: 1 },
          activePipelines: 3,
          offersCount: 1
        }
      }
    }
  })
  @Widget('preparation-dashboard')
  async getPlacementDashboard(_input: any, ctx: ExecutionContext) {
    ctx.logger.info('Compiling complete placement command center dashboard');

    const profile = this.store.getProfile();
    const metrics = this.store.calculateDashboardMetrics();
    const topics = this.store.getTopicConfidences();
    const rawDeadlines = this.store.getDeadlines();
    const sortedDeadlines = sortDeadlinesByUrgency(rawDeadlines);
    const recentLogs = this.store.getPracticeLogs().slice(0, 3);

    // Filter weak topics (confidence <= 2 or percentage < 45%)
    const weakTopics = topics
      .filter(t => t.confidence <= 2 || (t.targetProblems > 0 && (t.problemsSolved / t.targetProblems) < 0.45))
      .map(t => ({
        topic: t.topic,
        category: t.category,
        confidence: `${t.confidence}/5`,
        progress: `${t.problemsSolved} / ${t.targetProblems} (${Math.round((t.problemsSolved / t.targetProblems) * 100)}%)`
      }));

    // Filter strong topics (confidence >= 4 and percentage >= 75%)
    const strongTopics = topics
      .filter(t => t.confidence >= 4 && (t.targetProblems > 0 && (t.problemsSolved / t.targetProblems) >= 0.75))
      .map(t => ({
        topic: t.topic,
        category: t.category,
        confidence: `${t.confidence}/5`,
        progress: `${t.problemsSolved} / ${t.targetProblems} (100%)`
      }));

    // Categorized deadlines
    const critical24h = sortedDeadlines.filter(d => d.urgencyTier === 'WITHIN_24_HOURS');
    const high3d = sortedDeadlines.filter(d => d.urgencyTier === 'WITHIN_3_DAYS');

    // Qualitative readiness rating
    let readinessRating: string;
    if (metrics.overallReadinessPercentage >= 85) {
      readinessRating = 'Elite Tier (High Offer Probability)';
    } else if (metrics.overallReadinessPercentage >= 70) {
      readinessRating = 'Strong Candidate (Competitive for Product Roles)';
    } else if (metrics.overallReadinessPercentage >= 50) {
      readinessRating = 'Moderate Preparation (Focus on Weak Topics & Timed Mocks)';
    } else {
      readinessRating = 'Foundation Stage (Intensive Daily Study Required)';
    }

    const activePipelines = 
      metrics.applicationsByStage.Applied + 
      metrics.applicationsByStage.OA + 
      metrics.applicationsByStage.Interview;

    const recommendations: string[] = [];
    if (critical24h.length > 0) {
      recommendations.push(`Complete urgent submission: ${critical24h.map(c => c.companyName).join(', ')} deadline within 24 hours.`);
    }
    if (high3d.length > 0) {
      recommendations.push(`Revise for upcoming interview: ${high3d.map(c => c.companyName).join(', ')} in next 3 days.`);
    }
    if (weakTopics.length > 0) {
      recommendations.push(`Prioritize study sessions for identified weak areas: ${weakTopics.map(w => w.topic).slice(0, 3).join(', ')}.`);
    }
    if (recommendations.length === 0) {
      recommendations.push('Maintain daily problem solving consistency and schedule a full-length mock assessment.');
    }

    return {
      status: 'success',
      generatedAt: new Date().toISOString(),
      studentProfile: {
        name: profile.name,
        college: profile.college,
        branch: profile.branch,
        cgpa: profile.cgpa,
        graduationYear: profile.graduationYear,
        dailyAvailableHours: profile.dailyAvailableHours
      },
      overallReadiness: {
        scorePercentage: metrics.overallReadinessPercentage,
        rating: readinessRating,
        calculationFormula: 'Weighted: DSA (40%) + Core CS (30%) + SQL (15%) + Aptitude (15%)'
      },
      categoryBreakdowns: {
        dsa: {
          percentage: metrics.dsaProgressPercentage,
          weight: '40%'
        },
        coreCs: {
          percentage: metrics.coreCsProgressPercentage,
          weight: '30%'
        },
        sql: {
          percentage: metrics.sqlProgressPercentage,
          weight: '15%'
        },
        aptitude: {
          percentage: metrics.aptitudeProgressPercentage,
          weight: '15%'
        }
      },
      applicationsFunnel: {
        totalTracked: metrics.totalApplications,
        stageBreakdown: metrics.applicationsByStage,
        activeRecruitmentPipelines: activePipelines,
        offersSecured: metrics.applicationsByStage.Offer
      },
      recruitmentDeadlines: {
        totalUpcoming: sortedDeadlines.length,
        criticalWithin24Hours: critical24h.map(d => ({
          company: d.companyName,
          role: d.jobRole,
          type: d.deadlineType,
          due: d.formattedDueDate,
          urgency: d.urgencyLabel
        })),
        highPriorityWithin3Days: high3d.map(d => ({
          company: d.companyName,
          role: d.jobRole,
          type: d.deadlineType,
          due: d.formattedDueDate,
          urgency: d.urgencyLabel
        })),
        nextImmediateEvent: sortedDeadlines.length > 0 ? {
          company: sortedDeadlines[0].companyName,
          type: sortedDeadlines[0].deadlineType,
          due: sortedDeadlines[0].formattedDueDate,
          urgency: sortedDeadlines[0].urgencyLabel
        } : null
      },
      studyConsistencyAndPractice: {
        totalStudyHoursLogged: metrics.totalStudyHours,
        totalProblemsSolved: metrics.totalProblemsSolved,
        practiceStreakDays: metrics.studyConsistencyStreakDays,
        recentPracticeLogs: recentLogs
      },
      weakTopicsNeedingAttention: weakTopics,
      strongTopicsMastered: strongTopics,
      actionableRecommendations: recommendations
    };
  }
}
