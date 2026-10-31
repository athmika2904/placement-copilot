import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { PlacementStore } from '../../../data/store.js';

export class ProfileTools {
  private store = PlacementStore.getInstance();

  @Tool({
    name: 'get_student_profile',
    description: 'Retrieve the complete academic, technical skills, and preparation profile of the student',
    inputSchema: z.object({}).describe('No parameters required'),
    examples: {
      request: {},
      response: {
        status: 'success',
        profile: {
          name: 'Rahul Sharma',
          college: 'National Institute of Technology',
          degree: 'B.Tech',
          branch: 'Computer Science and Engineering',
          graduationYear: 2026,
          cgpa: 8.42,
          activeBacklogs: 0,
          technicalSkills: ['Data Structures & Algorithms', 'TypeScript', 'React', 'Python'],
          programmingLanguages: ['C++', 'Python', 'Java', 'TypeScript'],
          preferredJobRoles: ['Software Development Engineer (SDE)', 'Full Stack Developer'],
          dailyAvailableHours: 3,
          strongTopics: ['Arrays & Hashing', 'Two Pointers', 'SQL'],
          weakTopics: ['Dynamic Programming', 'Graph Algorithms']
        }
      }
    }
  })
  async getStudentProfile(_input: any, ctx: ExecutionContext) {
    ctx.logger.info('Fetching student profile');
    const profile = this.store.getProfile();
    return {
      status: 'success',
      message: `Profile loaded for ${profile.name} (${profile.branch}, Class of ${profile.graduationYear})`,
      profile
    };
  }

  @Tool({
    name: 'update_student_profile',
    description: 'Update the student profile with new CGPA, skills, backlog status, hours, or topics',
    inputSchema: z.object({
      name: z.string().optional().describe('Full name of student'),
      college: z.string().optional().describe('College or university name'),
      degree: z.string().optional().describe('Degree e.g. B.Tech, M.Tech, BCA, MCA'),
      branch: z.string().optional().describe('Branch or major e.g. Computer Science and Engineering'),
      graduationYear: z.number().int().min(2020).max(2035).optional().describe('Year of graduation'),
      cgpa: z.number().min(0).max(10).optional().describe('Current cumulative GPA on a 10.0 scale'),
      activeBacklogs: z.number().int().min(0).optional().describe('Current count of active backlogs/arrears'),
      technicalSkills: z.array(z.string()).optional().describe('List of technical skills and frameworks'),
      programmingLanguages: z.array(z.string()).optional().describe('List of programming languages'),
      preferredJobRoles: z.array(z.string()).optional().describe('Target job roles e.g. SDE, Data Analyst'),
      dailyAvailableHours: z.number().min(0).max(24).optional().describe('Daily available study/preparation hours (e.g. 2, 3, 4)'),
      strongTopics: z.array(z.string()).optional().describe('Topics where the student feels confident'),
      weakTopics: z.array(z.string()).optional().describe('Topics where the student needs focused preparation')
    }),
    examples: {
      request: {
        cgpa: 8.55,
        dailyAvailableHours: 4,
        weakTopics: ['Dynamic Programming', 'Graph Algorithms', 'Tries']
      },
      response: {
        status: 'success',
        message: 'Student profile updated successfully',
        updatedFields: ['cgpa', 'dailyAvailableHours', 'weakTopics'],
        profile: {
          name: 'Rahul Sharma',
          cgpa: 8.55,
          dailyAvailableHours: 4
        }
      }
    }
  })
  async updateStudentProfile(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Updating student profile', { fields: Object.keys(input) });
    
    const updatedFields = Object.keys(input).filter(k => input[k] !== undefined);
    if (updatedFields.length === 0) {
      return {
        status: 'no_change',
        message: 'No fields were provided to update.',
        profile: this.store.getProfile()
      };
    }

    const updatedProfile = this.store.updateProfile(input);
    return {
      status: 'success',
      message: `Successfully updated profile: ${updatedFields.join(', ')}`,
      updatedFields,
      profile: updatedProfile
    };
  }
}
