import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { PlacementStore } from '../../../data/store.js';
import { PrepCategory, PreparationPlan, StudyTask } from '../../../data/types.js';
import { prioritizeTopics } from '../../../utils/priorityUtils.js';

export class PreparationTools {
  private store = PlacementStore.getInstance();

  @Tool({
    name: 'generate_prep_plan',
    description: 'Generate an adaptive day-by-day study and revision roadmap based on target company, recruitment round, weak areas, and remaining days',
    inputSchema: z.object({
      targetCompany: z.string().describe('Target company name e.g. "Infosys", "Google", "Amazon", "Microsoft"'),
      recruitmentRound: z.enum(['OA', 'Technical Interview', 'HR Interview', 'Comprehensive']).optional().describe('Recruitment round to target (defaults to "OA")'),
      totalDays: z.number().int().min(3).max(60).optional().describe('Number of days until the assessment/round (defaults to 21 days or calculated from deadline)'),
      dailyStudyHours: z.number().min(1).max(12).optional().describe('Daily available preparation hours (defaults to student profile hours)'),
      focusTopics: z.array(z.string()).optional().describe('Specific topics to emphasize in the schedule')
    }),
    examples: {
      request: {
        targetCompany: 'Infosys',
        recruitmentRound: 'OA',
        totalDays: 21,
        dailyStudyHours: 3
      },
      response: {
        status: 'success',
        planId: 'plan-xyz',
        targetCompany: 'Infosys',
        totalDays: 21,
        dailyStudyHours: 3,
        totalHours: 63,
        summary: 'Generated 21-day adaptive preparation plan targeting Infosys Specialist Programmer OA.'
      }
    }
  })
  @Widget('weekly-planner')
  async generatePrepPlan(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating personalized preparation plan', { company: input.targetCompany, days: input.totalDays });

    const profile = this.store.getProfile();
    const storedConfidences = this.store.getTopicConfidences();

    const targetCompany = input.targetCompany.trim();
    const recruitmentRound = input.recruitmentRound || 'OA';
    const dailyHours = input.dailyStudyHours || profile.dailyAvailableHours || 3;

    // Determine total days: if not provided, check if company has upcoming deadline
    let days = input.totalDays;
    if (!days) {
      const deadlines = this.store.getDeadlines();
      const match = deadlines.find(d => d.companyName.toLowerCase() === targetCompany.toLowerCase());
      if (match) {
        const diffMs = new Date(match.dueDate).getTime() - new Date().getTime();
        const calcDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        days = Math.max(7, Math.min(60, calcDays));
      } else {
        days = 21; // Standard 3-week sprint
      }
    }

    // Prioritize topics using explainable heuristic
    const prioritized = prioritizeTopics(storedConfidences, profile, targetCompany, recruitmentRound);

    // Build day-by-day study schedule
    const schedule: StudyTask[] = [];
    const startDate = new Date();

    // Divide days into phases:
    // Phase 1 (Core & Weak Focus): ~60% of time
    // Phase 2 (Secondary topics & Core CS): ~20% of time
    // Phase 3 (Mock Assessments): ~10% of time
    // Phase 4 (Final Revision & Cheat sheets): ~10% of time
    const phase1Days = Math.max(2, Math.floor(days * 0.6));
    const phase2Days = Math.max(1, Math.floor(days * 0.2));
    const phase3Days = Math.max(1, Math.floor(days * 0.1));
    const phase4Days = Math.max(1, days - (phase1Days + phase2Days + phase3Days));

    let currentDay = 1;

    // Helper to generate concrete task description
    const getTaskDesc = (topic: string, day: number, type: StudyTask['type']): string => {
      if (type === 'learning') {
        return `Deep dive into ${topic}: Understand core patterns, time complexity bounds, and standard templates.`;
      } else if (type === 'practice') {
        return `Solve 4-5 targeted problems in ${topic} (focus on LeetCode Medium / HackerEarth company tags).`;
      } else if (type === 'revision') {
        return `Review previously solved problems, edge cases, and common bugs in ${topic}.`;
      } else {
        return `Timed 90-minute Mock Assessment for ${targetCompany} replicating the ${recruitmentRound} exam environment.`;
      }
    };

    // Populate Phase 1: High Priority Topics (Top 3-4 topics from heuristic)
    const topTopics = prioritized.slice(0, 4);
    for (let i = 0; i < phase1Days; i++) {
      const topicObj = topTopics[i % topTopics.length];
      const taskDate = new Date(startDate);
      taskDate.setDate(startDate.getDate() + (currentDay - 1));

      const isLearning = i < 2;
      schedule.push({
        id: `task-${currentDay}`,
        dayNumber: currentDay,
        date: taskDate.toISOString().split('T')[0],
        category: topicObj.category,
        topic: topicObj.topic,
        taskDescription: getTaskDesc(topicObj.topic, currentDay, isLearning ? 'learning' : 'practice'),
        allocatedHours: dailyHours,
        isCompleted: false,
        type: isLearning ? 'learning' : 'practice'
      });
      currentDay++;
    }

    // Populate Phase 2: Core CS, SQL & Secondary High Priority
    const secondaryTopics = prioritized.slice(4, 7);
    for (let i = 0; i < phase2Days; i++) {
      const topicObj = secondaryTopics[i % secondaryTopics.length] || topTopics[0];
      const taskDate = new Date(startDate);
      taskDate.setDate(startDate.getDate() + (currentDay - 1));

      schedule.push({
        id: `task-${currentDay}`,
        dayNumber: currentDay,
        date: taskDate.toISOString().split('T')[0],
        category: topicObj.category,
        topic: topicObj.topic,
        taskDescription: getTaskDesc(topicObj.topic, currentDay, 'practice'),
        allocatedHours: dailyHours,
        isCompleted: false,
        type: 'practice'
      });
      currentDay++;
    }

    // Populate Phase 3: Mock Assessments & Timed Tests
    for (let i = 0; i < phase3Days; i++) {
      const taskDate = new Date(startDate);
      taskDate.setDate(startDate.getDate() + (currentDay - 1));

      schedule.push({
        id: `task-${currentDay}`,
        dayNumber: currentDay,
        date: taskDate.toISOString().split('T')[0],
        category: 'Technical Interviews',
        topic: `${targetCompany} ${recruitmentRound} Mock Exam`,
        taskDescription: getTaskDesc(`${targetCompany} ${recruitmentRound}`, currentDay, 'mock_test'),
        allocatedHours: dailyHours,
        isCompleted: false,
        type: 'mock_test'
      });
      currentDay++;
    }

    // Populate Phase 4: Final Revision & Formula Review
    for (let i = 0; i < phase4Days; i++) {
      const taskDate = new Date(startDate);
      taskDate.setDate(startDate.getDate() + (currentDay - 1));

      schedule.push({
        id: `task-${currentDay}`,
        dayNumber: currentDay,
        date: taskDate.toISOString().split('T')[0],
        category: 'DSA',
        topic: 'Formula Sheets, Time Complexities & Cheat Sheets',
        taskDescription: `Final consolidation: Review algorithmic templates (DP states, Graph traversals, SQL joins) and rest before test day.`,
        allocatedHours: Math.min(2, dailyHours),
        isCompleted: false,
        type: 'revision'
      });
      currentDay++;
    }

    const planId = `plan-${Date.now().toString(36)}`;
    const plan: PreparationPlan = {
      id: planId,
      targetCompany,
      recruitmentRound,
      totalDays: days,
      dailyStudyHours: dailyHours,
      createdAt: new Date().toISOString(),
      prioritizedTopics: prioritized.slice(0, 6).map(p => ({
        topic: p.topic,
        category: p.category,
        importance: p.importance,
        confidence: p.confidence,
        calculatedPriority: p.priorityScore,
        allocatedDays: Math.max(1, Math.round((p.priorityScore / 100) * days))
      })),
      schedule,
      summary: `Tailored ${days}-day preparation plan for ${targetCompany} (${recruitmentRound}). Total planned study: ${days * dailyHours} hours. Top priority given to weak areas: ${topTopics.map(t => t.topic).join(', ')}.`
    };

    this.store.savePlan(plan);

    return {
      status: 'success',
      planId,
      targetCompany,
      recruitmentRound,
      totalDays: days,
      dailyStudyHours: dailyHours,
      totalStudyHoursPlanned: days * dailyHours,
      heuristicFormula: 'Priority = Topic Importance (1-5) × (6 - Confidence (1-5))',
      topPrioritizedTopics: plan.prioritizedTopics,
      scheduleBreakdown: {
        totalTasks: schedule.length,
        learningDays: phase1Days,
        coreCsAndPracticeDays: phase2Days,
        mockAssessmentDays: phase3Days,
        finalRevisionDays: phase4Days
      },
      schedule,
      summary: plan.summary
    };
  }

  @Tool({
    name: 'log_practice',
    description: 'Log completed study sessions, solved problems, and updated topic confidence ratings',
    inputSchema: z.object({
      topic: z.string().min(1).describe('Topic practiced e.g. "Dynamic Programming", "Graph Algorithms", "DBMS & SQL Queries"'),
      category: z.enum([
        'DSA', 'Core CS', 'DBMS', 'Operating Systems', 
        'Computer Networks', 'OOP', 'SQL', 'Aptitude', 
        'Projects', 'Technical Interviews', 'HR Interviews'
      ]).describe('Category of preparation'),
      problemsSolved: z.number().int().min(0).describe('Number of problems solved in this session'),
      studyHours: z.number().min(0).max(24).describe('Total hours spent studying (e.g. 1, 2, 3.5, 4)'),
      notes: z.string().optional().describe('Key algorithms learned, problem links, or hurdles faced'),
      newConfidence: z.number().int().min(1).max(5).optional().describe('Updated self-assessed confidence level (1 to 5)')
    }),
    examples: {
      request: {
        topic: 'Graph Algorithms',
        category: 'DSA',
        problemsSolved: 5,
        studyHours: 2.5,
        notes: 'Implemented BFS/DFS on grid and Dijkstra shortest path.',
        newConfidence: 3
      },
      response: {
        status: 'success',
        message: 'Practice logged: 5 problems in Graph Algorithms (DSA).',
        newConfidence: 3
      }
    }
  })
  async logPractice(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Logging student practice session', { topic: input.topic, count: input.problemsSolved });

    const entry = this.store.logPractice({
      date: new Date().toISOString().split('T')[0],
      topic: input.topic.trim(),
      category: input.category as PrepCategory,
      problemsSolved: input.problemsSolved,
      studyHours: input.studyHours,
      notes: input.notes,
      newConfidence: input.newConfidence
    });

    const updatedTopic = this.store.getTopicConfidence(input.topic);

    return {
      status: 'success',
      message: `Successfully logged practice: ${input.problemsSolved} problem(s) in '${input.topic}' (${input.studyHours} hrs).`,
      logEntry: entry,
      updatedTopicProgress: updatedTopic ? {
        topic: updatedTopic.topic,
        confidence: updatedTopic.confidence,
        problemsSolvedTotal: updatedTopic.problemsSolved,
        targetProblems: updatedTopic.targetProblems,
        completionPercentage: Math.min(100, Math.round((updatedTopic.problemsSolved / updatedTopic.targetProblems) * 100))
      } : null
    };
  }

  @Tool({
    name: 'get_prep_progress',
    description: 'Retrieve detailed preparation progress, topic-wise confidence ratings, problem counts, and recent logs',
    inputSchema: z.object({
      category: z.enum([
        'DSA', 'Core CS', 'DBMS', 'Operating Systems', 
        'Computer Networks', 'OOP', 'SQL', 'Aptitude', 
        'Projects', 'Technical Interviews', 'HR Interviews'
      ]).optional().describe('Filter topics by category')
    }),
    examples: {
      request: {
        category: 'DSA'
      },
      response: {
        status: 'success',
        totalTopics: 8,
        totalProblemsSolved: 179,
        topics: []
      }
    }
  })
  async getPrepProgress(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Retrieving preparation progress', { filterCategory: input?.category });

    let topics = this.store.getTopicConfidences();
    if (input?.category) {
      topics = topics.filter(t => t.category === input.category);
    }

    const totalProblemsSolved = topics.reduce((acc, t) => acc + t.problemsSolved, 0);
    const totalTarget = topics.reduce((acc, t) => acc + t.targetProblems, 0);
    const overallPct = totalTarget > 0 ? Math.round((totalProblemsSolved / totalTarget) * 100) : 0;

    const recentLogs = this.store.getPracticeLogs().slice(0, 5);

    return {
      status: 'success',
      totalTopicsTracked: topics.length,
      totalProblemsSolved,
      totalTargetProblems: totalTarget,
      overallCategoryProgressPct: overallPct,
      topics: topics.map(t => ({
        topic: t.topic,
        category: t.category,
        confidenceLevel: `${t.confidence}/5`,
        problemsSolved: `${t.problemsSolved} / ${t.targetProblems}`,
        percentage: Math.min(100, Math.round((t.problemsSolved / t.targetProblems) * 100)),
        isCompleted: t.completed
      })),
      recentPracticeLogs: recentLogs
    };
  }
}
