
import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { PlacementStore } from '../../../data/store.js';
import { RecruitmentStage, EligibilityStatus } from '../../../data/types.js';
import { isValidStageTransition } from '../../../utils/validation.js';

export class ApplicationTools {
  private store = PlacementStore.getInstance();

  @Tool({
    name: 'add_application',
    description: 'Track a new company recruitment application with role, stage, deadlines, and notes',
    inputSchema: z.object({
      companyName: z.string().min(1).describe('Company name e.g. Google, Infosys, Amazon'),
      jobRole: z.string().min(1).describe('Job role e.g. Software Engineer, SDE Intern'),
      stage: z.enum(['Interested', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected']).optional().describe('Current recruitment stage (defaults to Applied)'),
      applicationDate: z.string().optional().describe('Date of application (YYYY-MM-DD), defaults to today'),
      applicationDeadline: z.string().optional().describe('Application portal closing deadline (YYYY-MM-DD)'),
      oaDate: z.string().optional().describe('Scheduled online assessment date (YYYY-MM-DD)'),
      interviewDate: z.string().optional().describe('Scheduled interview date (YYYY-MM-DD)'),
      notes: z.string().optional().describe('Referral details, syllabus notes, preparation focus'),
      eligibilityStatus: z.enum(['Eligible', 'Not eligible', 'Needs verification']).optional().describe('Initial eligibility status (defaults to Needs verification)')
    }),
    examples: {
      request: {
        companyName: 'Atlassian',
        jobRole: 'Graduate Software Engineer',
        stage: 'Applied',
        applicationDeadline: '2026-11-10',
        notes: 'Applied with referral. Focus on graphs and system design.'
      },
      response: {
        status: 'success',
        message: 'Application added successfully for Atlassian (Graduate Software Engineer)',
        application: {
          id: 'app-xyz',
          companyName: 'Atlassian',
          jobRole: 'Graduate Software Engineer',
          stage: 'Applied',
          eligibilityStatus: 'Needs verification'
        }
      }
    }
  })
  async addApplication(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Adding new application', {
      company: input.companyName,
      role: input.jobRole
    });

    const todayStr = new Date().toISOString().split('T')[0];

    const newApplication = this.store.addApplication({
      companyName: input.companyName.trim(),
      jobRole: input.jobRole.trim(),
      stage: (input.stage as RecruitmentStage) || 'Applied',
      applicationDate: input.applicationDate || todayStr,
      applicationDeadline: input.applicationDeadline,
      oaDate: input.oaDate,
      interviewDate: input.interviewDate,
      notes: input.notes,
      eligibilityStatus:
        (input.eligibilityStatus as EligibilityStatus) || 'Needs verification'
    });

    return {
      status: 'success',
      message: `Successfully tracked application for ${newApplication.companyName} as '${newApplication.stage}'.`,
      application: newApplication
    };
  }

  @Tool({
    name: 'list_applications',
    description: 'List all tracked company applications with optional filtering by recruitment stage or company',
    inputSchema: z.object({
      stage: z.enum(['Interested', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected']).optional().describe('Filter by recruitment stage'),
      companyName: z.string().optional().describe('Filter by company name substring')
    }),
    examples: {
      request: {
        stage: 'OA'
      },
      response: {
        status: 'success',
        total: 1,
        applications: [
          {
            id: 'app-003',
            companyName: 'Infosys',
            jobRole: 'Specialist Programmer',
            stage: 'OA',
            oaDate: '2026-11-21'
          }
        ]
      }
    }
  })
  @Widget('kanban-board')
  async listApplications(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Listing applications', {
      filterStage: input?.stage,
      filterCompany: input?.companyName
    });

    let applications = this.store.getApplications();

    if (input?.stage) {
      applications = applications.filter(a => a.stage === input.stage);
    }

    if (input?.companyName) {
      const query = input.companyName.toLowerCase().trim();
      applications = applications.filter(a =>
        a.companyName.toLowerCase().includes(query)
      );
    }

    const allApps = this.store.getApplications();

    const stageCounts: Record<RecruitmentStage, number> = {
      Interested: 0,
      Applied: 0,
      OA: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0
    };

    for (const application of allApps) {
      if (stageCounts[application.stage] !== undefined) {
        stageCounts[application.stage]++;
      }
    }

    return {
      status: 'success',
      totalCount: applications.length,
      stageCounts,
      applications
    };
  }

  @Tool({
    name: 'update_application_status',
    description: 'Update the recruitment stage and notes for an existing application with state transition validation',
    inputSchema: z.object({
      id: z.string().min(1).describe('Application ID to update'),
      stage: z.enum(['Interested', 'Applied', 'OA', 'Interview', 'Offer', 'Rejected']).describe('Target recruitment stage'),
      notes: z.string().optional().describe('Additional notes or feedback for this stage update')
    }),
    examples: {
      request: {
        id: 'app-001',
        stage: 'Applied',
        notes: 'Submitted application on careers portal'
      },
      response: {
        status: 'success',
        message: 'Updated application status for Microsoft to Applied',
        application: {
          id: 'app-001',
          stage: 'Applied'
        }
      }
    }
  })
  async updateApplicationStatus(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Updating application status', {
      id: input.id,
      stage: input.stage
    });

    const existing = this.store.getApplication(input.id);

    if (!existing) {
      return {
        status: 'error',
        message: `Application with ID '${input.id}' was not found. Use list_applications to see valid IDs.`
      };
    }

    const transitionCheck = isValidStageTransition(
      existing.stage,
      input.stage as RecruitmentStage
    );

    if (!transitionCheck.valid) {
      throw new Error(`Invalid stage transition: ${transitionCheck.reason}`);
    }

    const updated = this.store.updateApplicationStatus(
      input.id,
      input.stage as RecruitmentStage,
      input.notes
    );

    return {
      status: 'success',
      message: `Successfully progressed ${existing.companyName} application from '${existing.stage}' to '${input.stage}'.`,
      application: updated
    };
  }

  @Tool({
    name: 'delete_application',
    description: 'Remove a company application from the tracker by its ID',
    inputSchema: z.object({
      id: z.string().min(1).describe('Application ID to delete')
    }),
    examples: {
      request: {
        id: 'app-006'
      },
      response: {
        status: 'success',
        message: 'Application app-006 deleted successfully'
      }
    }
  })
  async deleteApplication(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Deleting application', { id: input.id });

    const existing = this.store.getApplication(input.id);

    if (!existing) {
      return {
        status: 'error',
        message: `Application with ID '${input.id}' does not exist.`
      };
    }

    const deleted = this.store.deleteApplication(input.id);

    return {
      status: deleted ? 'success' : 'error',
      message: deleted
        ? `Successfully removed ${existing.companyName} (${existing.jobRole}) from tracked applications.`
        : `Could not delete application '${input.id}'.`
    };
  }
}
