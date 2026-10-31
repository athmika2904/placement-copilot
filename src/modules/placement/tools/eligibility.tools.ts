import { ToolDecorator as Tool, ExecutionContext, z } from '@nitrostack/core';
import { PlacementStore } from '../../../data/store.js';
import { CompanyCriteria, EligibilityStatus } from '../../../data/types.js';

export class EligibilityTools {
  private store = PlacementStore.getInstance();

  @Tool({
    name: 'check_eligibility',
    description: 'Check whether a student meets recruitment eligibility criteria (CGPA, branch, graduation year, backlogs, skills) for a target company or custom criteria',
    inputSchema: z.object({
      companyName: z.string().optional().describe('Name of target company (e.g. "Infosys", "Google", "Amazon", "Microsoft", "TCS") to load sample criteria'),
      jobRole: z.string().optional().describe('Job role (optional)'),
      minCgpa: z.number().min(0).max(10).optional().describe('Custom minimum CGPA requirement'),
      allowedBranches: z.array(z.string()).optional().describe('Custom list of allowed academic branches'),
      eligibleGraduationYears: z.array(z.number()).optional().describe('Custom eligible graduation years (e.g. [2026])'),
      maxBacklogsAllowed: z.number().int().min(0).optional().describe('Maximum active backlogs allowed (e.g. 0)'),
      requiredSkills: z.array(z.string()).optional().describe('Custom required technical skills')
    }),
    examples: {
      request: {
        companyName: 'Infosys'
      },
      response: {
        status: 'Eligible',
        companyName: 'Infosys',
        jobRole: 'Specialist Programmer',
        isMockCriteria: true,
        criteriaBreakdown: {
          satisfiedCriteria: [
            'CGPA 8.42 exceeds minimum required 7.0',
            'Zero active backlogs satisfies policy (max 0 allowed)',
            'Branch Computer Science and Engineering is eligible',
            'Graduation year 2026 is eligible'
          ],
          unsatisfiedCriteria: [],
          missingDetails: []
        },
        skillsAnalysis: {
          matchedSkills: ['Data Structures & Algorithms', 'Java', 'Python', 'DBMS', 'OOP'],
          missingSkills: []
        },
        improvementRecommendations: [
          'Practice competitive programming speed for the 3-hour coding round.'
        ]
      }
    }
  })
  async checkEligibility(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Evaluating student eligibility', { company: input.companyName });

    const profile = this.store.getProfile();
    let criteria: CompanyCriteria | undefined;

    if (input.companyName) {
      criteria = this.store.getCompanyCriteria(input.companyName);
    }

    // Fallback or custom overrides
    const effectiveMinCgpa: number = input.minCgpa ?? criteria?.minCgpa ?? 7.0;
    const effectiveAllowedBranches: string[] = input.allowedBranches ?? criteria?.allowedBranches ?? [
      'Computer Science and Engineering',
      'Information Technology',
      'Electronics and Communication Engineering'
    ];
    const effectiveEligibleGradYears: number[] = input.eligibleGraduationYears ?? criteria?.eligibleGraduationYears ?? [2026];
    const effectiveMaxBacklogs: number = input.maxBacklogsAllowed ?? criteria?.maxBacklogsAllowed ?? 0;
    const effectiveRequiredSkills: string[] = input.requiredSkills ?? criteria?.requiredSkills ?? ['Data Structures & Algorithms'];
    const companyDisplayName: string = input.companyName || criteria?.companyName || 'Target Company';
    const jobRoleDisplayName: string = input.jobRole || criteria?.jobRole || 'Software Engineering Role';

    const satisfiedCriteria: string[] = [];
    const unsatisfiedCriteria: string[] = [];
    const missingDetails: string[] = [];
    const improvementRecommendations: string[] = [];

    let hasHardGateFailure = false;

    // 1. CGPA Check
    if (profile.cgpa !== undefined && profile.cgpa !== null) {
      if (profile.cgpa >= effectiveMinCgpa) {
        satisfiedCriteria.push(`CGPA: Student's CGPA (${profile.cgpa.toFixed(2)}) meets or exceeds minimum requirement of ${effectiveMinCgpa.toFixed(2)}.`);
      } else {
        hasHardGateFailure = true;
        const deficit = (effectiveMinCgpa - profile.cgpa).toFixed(2);
        unsatisfiedCriteria.push(`CGPA: Student's CGPA (${profile.cgpa.toFixed(2)}) is below the required minimum of ${effectiveMinCgpa.toFixed(2)} (Deficit: ${deficit}).`);
        improvementRecommendations.push(`Focus on upcoming academic semester exams to raise cumulative CGPA towards ${effectiveMinCgpa.toFixed(2)}.`);
      }
    } else {
      missingDetails.push('Student CGPA is not specified in profile.');
    }

    // 2. Active Backlogs Check
    if (profile.activeBacklogs !== undefined) {
      if (profile.activeBacklogs <= effectiveMaxBacklogs) {
        satisfiedCriteria.push(`Backlogs: ${profile.activeBacklogs} active backlogs (Meets company criterion of max ${effectiveMaxBacklogs} allowed).`);
      } else {
        hasHardGateFailure = true;
        unsatisfiedCriteria.push(`Backlogs: ${profile.activeBacklogs} active backlogs exceeds maximum allowed (${effectiveMaxBacklogs}).`);
        improvementRecommendations.push('Prioritize clearing active academic arrears in the immediate semester supplementary cycle.');
      }
    } else {
      missingDetails.push('Active backlog count is missing in student profile.');
    }

    // 3. Graduation Year Check
    if (profile.graduationYear) {
      if (effectiveEligibleGradYears.includes(profile.graduationYear)) {
        satisfiedCriteria.push(`Graduation Year: Batch of ${profile.graduationYear} is eligible.`);
      } else {
        hasHardGateFailure = true;
        unsatisfiedCriteria.push(`Graduation Year: Batch ${profile.graduationYear} is not eligible (Eligible: ${effectiveEligibleGradYears.join(', ')}).`);
      }
    } else {
      missingDetails.push('Graduation year is not specified.');
    }

    // 4. Academic Branch Check
    if (profile.branch) {
      const studentBranchLower = profile.branch.toLowerCase();
      const isBranchAllowed = effectiveAllowedBranches.some((b: string) => {
        const bLower = b.toLowerCase();
        return studentBranchLower.includes(bLower) || bLower.includes(studentBranchLower) ||
          (studentBranchLower.includes('computer') && bLower.includes('computer')) ||
          (studentBranchLower.includes('cse') && bLower.includes('computer'));
      });

      if (isBranchAllowed) {
        satisfiedCriteria.push(`Branch: '${profile.branch}' is eligible for this opportunity.`);
      } else {
        hasHardGateFailure = true;
        unsatisfiedCriteria.push(`Branch: '${profile.branch}' is not in the allowed list: [${effectiveAllowedBranches.join(', ')}].`);
      }
    } else {
      missingDetails.push('Degree branch is not specified in profile.');
    }

    // 5. Skills Analysis
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    const studentAllSkills: string[] = [
      ...profile.technicalSkills.map((s: string) => s.toLowerCase()),
      ...profile.programmingLanguages.map((s: string) => s.toLowerCase()),
      ...profile.strongTopics.map((s: string) => s.toLowerCase())
    ];

    for (const reqSkill of effectiveRequiredSkills) {
      const reqLower = reqSkill.toLowerCase();
      const isMatched = studentAllSkills.some((s: string) => s.includes(reqLower) || reqLower.includes(s));
      if (isMatched) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    }

    if (missingSkills.length === 0) {
      satisfiedCriteria.push(`Technical Skills: All ${effectiveRequiredSkills.length} required skills matched (${matchedSkills.join(', ')}).`);
    } else {
      unsatisfiedCriteria.push(`Missing Required Skills: ${missingSkills.join(', ')}.`);
      improvementRecommendations.push(`Add ${missingSkills.join(', ')} to your weekly study roadmap before company assessment.`);
    }

    // Determine Final Status
    let finalStatus: EligibilityStatus;
    let summary: string;

    if (hasHardGateFailure) {
      finalStatus = 'Not eligible';
      summary = `Student does NOT meet mandatory recruitment criteria for ${companyDisplayName}. Failed criteria: ${unsatisfiedCriteria.length}.`;
    } else if (missingDetails.length > 0 || missingSkills.length > 0) {
      finalStatus = 'Needs verification';
      summary = missingSkills.length > 0
        ? `Student meets academic criteria for ${companyDisplayName}, but has ${missingSkills.length} required skill gap(s) (${missingSkills.join(', ')}) needing verification or preparation.`
        : `Student requires verification of ${missingDetails.length} missing profile details.`;
    } else {
      finalStatus = 'Eligible';
      summary = `Student satisfies 100% of the recruitment criteria for ${companyDisplayName} (${jobRoleDisplayName}).`;
    }

    return {
      eligibilityStatus: finalStatus,
      companyName: companyDisplayName,
      jobRole: jobRoleDisplayName,
      isMockCriteria: true,
      criteriaSource: criteria ? 'Standard Sample Company Profile (Mock Data)' : 'Custom User Parameters',
      summary,
      criteriaBreakdown: {
        satisfiedCriteria,
        unsatisfiedCriteria,
        missingDetails
      },
      skillsAnalysis: {
        requiredSkills: effectiveRequiredSkills,
        matchedSkills,
        missingSkills
      },
      improvementRecommendations,
      disclaimer: '⚠️ NOTICE: Company requirements shown here are sample mock criteria for hackathon simulation and do NOT constitute official corporate recruitment policies.'
    };
  }
}
