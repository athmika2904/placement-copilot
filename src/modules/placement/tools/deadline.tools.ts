import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { PlacementStore } from '../../../data/store.js';
import { DeadlineType } from '../../../data/types.js';
import { sortDeadlinesByUrgency, enrichDeadline } from '../../../utils/dateUtils.js';

export class DeadlineTools {
  private store = PlacementStore.getInstance();

  @Tool({
    name: 'add_deadline',
    description: 'Add a new recruitment deadline for an application, online assessment, or interview',
    inputSchema: z.object({
      companyName: z.string().min(1).describe('Company name e.g. Google, Infosys, Amazon'),
      jobRole: z.string().min(1).describe('Job role e.g. SDE-1, Cloud Engineer'),
      deadlineType: z.enum(['Application', 'OA', 'Technical Interview', 'HR Interview', 'Assessment']).describe('Type of deadline event'),
      dueDate: z.string().min(1).describe('Due date and time in ISO or YYYY-MM-DD or YYYY-MM-DDTHH:mm format'),
      description: z.string().optional().describe('Details such as platform, test syllabus, interviewer name, or links')
    }),
    examples: {
      request: {
        companyName: 'Flipkart',
        jobRole: 'SDE-1',
        deadlineType: 'OA',
        dueDate: '2026-11-05T18:00:00',
        description: 'HackerEarth 90 min coding challenge'
      },
      response: {
        status: 'success',
        message: 'Deadline added successfully for Flipkart (OA)',
        deadline: {
          id: 'dl-xyz',
          companyName: 'Flipkart',
          dueDate: '2026-11-05T18:00:00'
        }
      }
    }
  })
  async addDeadline(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Adding deadline', { company: input.companyName, type: input.deadlineType });

    const newDeadline = this.store.addDeadline({
      companyName: input.companyName.trim(),
      jobRole: input.jobRole.trim(),
      deadlineType: input.deadlineType as DeadlineType,
      dueDate: input.dueDate,
      description: input.description
    });

    const enriched = enrichDeadline(newDeadline);

    return {
      status: 'success',
      message: `Added ${newDeadline.deadlineType} deadline for ${newDeadline.companyName} (${enriched.urgencyLabel}).`,
      deadline: enriched
    };
  }

  @Tool({
    name: 'list_upcoming_deadlines',
    description: 'List recruitment deadlines sorted chronologically by urgency with remaining days/hours and overdue flags',
    inputSchema: z.object({
      deadlineType: z.enum(['Application', 'OA', 'Technical Interview', 'HR Interview', 'Assessment']).optional().describe('Filter by deadline event type'),
      maxDaysAhead: z.number().int().min(1).max(90).optional().describe('Only show deadlines occurring within this many days')
    }),
    examples: {
      request: {
        maxDaysAhead: 7
      },
      response: {
        status: 'success',
        total: 2,
        deadlines: [
          {
            id: 'dl-001',
            companyName: 'Microsoft',
            deadlineType: 'Application',
            remainingHours: 24,
            urgencyTier: 'WITHIN_24_HOURS'
          }
        ]
      }
    }
  })
  @Widget('deadline-timeline')
  async listUpcomingDeadlines(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Listing upcoming deadlines', { filterType: input?.deadlineType, maxDays: input?.maxDaysAhead });

    let rawDeadlines = this.store.getDeadlines();
    if (input?.deadlineType) {
      rawDeadlines = rawDeadlines.filter(d => d.deadlineType === input.deadlineType);
    }

    let enriched = sortDeadlinesByUrgency(rawDeadlines);

    if (input?.maxDaysAhead !== undefined) {
      enriched = enriched.filter(d => d.remainingDays <= input.maxDaysAhead);
    }

    const summary = {
      within24Hours: enriched.filter(d => d.urgencyTier === 'WITHIN_24_HOURS').length,
      within3Days: enriched.filter(d => d.urgencyTier === 'WITHIN_3_DAYS').length,
      within7Days: enriched.filter(d => d.urgencyTier === 'WITHIN_7_DAYS').length,
      overdue: enriched.filter(d => d.urgencyTier === 'OVERDUE').length,
      total: enriched.length
    };

    return {
      status: 'success',
      summary,
      deadlines: enriched
    };
  }

  @Tool({
    name: 'get_urgent_applications',
    description: 'Get recruitment applications that require immediate attention (within 24 hours, 3 days, or 7 days)',
    inputSchema: z.object({}).describe('No parameters required'),
    examples: {
      request: {},
      response: {
        status: 'success',
        urgentCount: 3,
        urgentApplications: {
          criticalWithin24Hours: [],
          highPriorityWithin3Days: [],
          upcomingWithin7Days: []
        }
      }
    }
  })
  async getUrgentApplications(_input: any, ctx: ExecutionContext) {
    ctx.logger.info('Getting urgent recruitment applications');

    const rawDeadlines = this.store.getDeadlines();
    const sorted = sortDeadlinesByUrgency(rawDeadlines);
    const applications = this.store.getApplications();

    const critical24h = sorted.filter(d => d.urgencyTier === 'WITHIN_24_HOURS');
    const high3d = sorted.filter(d => d.urgencyTier === 'WITHIN_3_DAYS');
    const upcoming7d = sorted.filter(d => d.urgencyTier === 'WITHIN_7_DAYS');
    const overdue = sorted.filter(d => d.urgencyTier === 'OVERDUE');

    // Cross-reference with applications
    const matchApps = (items: typeof sorted) => {
      return items.map(item => {
        const app = applications.find(a => a.companyName.toLowerCase() === item.companyName.toLowerCase());
        return {
          ...item,
          applicationStage: app?.stage || 'Unknown',
          applicationId: app?.id
        };
      });
    };

    return {
      status: 'success',
      totalUrgent: critical24h.length + high3d.length + upcoming7d.length + overdue.length,
      overdue: matchApps(overdue),
      within24Hours: matchApps(critical24h),
      within3Days: matchApps(high3d),
      within7Days: matchApps(upcoming7d),
      recommendedAction: critical24h.length > 0 
        ? `CRITICAL: You have ${critical24h.length} deadline(s) due within 24 hours (${critical24h.map(c => c.companyName).join(', ')}). Action required immediately!`
        : high3d.length > 0
        ? `HIGH PRIORITY: ${high3d.length} deadline(s) due in the next 3 days. Focus preparation on these companies.`
        : 'No immediate critical deadlines in the next 24 hours.'
    };
  }
}
