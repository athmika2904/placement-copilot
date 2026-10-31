import { PromptDecorator as Prompt, ExecutionContext } from '@nitrostack/core';
import { PlacementStore } from '../../data/store.js';

export class PlacementPrompts {
  private store = PlacementStore.getInstance();

  @Prompt({
    name: 'company-preparation',
    description: 'Prepare a student for a specific company recruitment round with targeted problem sets, syllabus review, and strategy',
    arguments: [
      {
        name: 'company',
        description: 'Target company name (e.g. "Infosys", "Google", "Amazon", "Microsoft", "TCS")',
        required: true
      },
      {
        name: 'round',
        description: 'Recruitment round (e.g. "Online Assessment (OA)", "Technical Interview 1", "Bar Raiser / HR")',
        required: false
      }
    ]
  })
  async companyPreparation(args: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating company-preparation prompt', { company: args.company, round: args.round });

    const companyName = args.company || 'Infosys';
    const roundName = args.round || 'Online Assessment (OA)';
    const profile = this.store.getProfile();
    const criteria = this.store.getCompanyCriteria(companyName);

    const userMessage = `I need a structured preparation strategy for my upcoming ${roundName} round at ${companyName}. Please analyze my profile, identify high-priority focus areas, and provide a targeted study session outline.`;

    const assistantBrief = `### 🎯 Targeted Recruitment Strategy: ${companyName} (${roundName})

**Student Context:**
- **Candidate:** ${profile.name} (${profile.degree} ${profile.branch}, Class of ${profile.graduationYear})
- **Academic Score:** ${profile.cgpa.toFixed(2)} CGPA | Active Backlogs: ${profile.activeBacklogs}
- **Primary Languages:** ${profile.programmingLanguages.join(', ')}
- **Identified Weak Areas:** ${profile.weakTopics.join(', ')}
- **Strong Foundation:** ${profile.strongTopics.join(', ')}
- **Daily Prep Capacity:** ${profile.dailyAvailableHours} hours/day

${criteria ? `**${companyName} Recruitment Blueprint (Sample Criteria):**
- **Target Role:** ${criteria.jobRole}
- **Mandatory Skills:** ${criteria.requiredSkills.join(', ')}
- **Selection Process:** ${criteria.recruitmentRounds.join(' ➔ ')}
- **Key Pattern:** ${criteria.description}` : ''}

**Recommended Immediate Action Plan:**
1. **Focus on Identified Gap Areas:** Pay immediate attention to ${profile.weakTopics.slice(0, 2).join(' and ')}, which frequently appear in ${companyName}'s coding rounds.
2. **Standard Company Problem Patterns:** Prioritize questions with medium/hard difficulty tags on LeetCode/HackerEarth specifically matching ${companyName}'s past interview patterns.
3. **Core CS Review:** Dedicate 45 minutes daily to DBMS and OOP design principles.
4. **Time-Management Drill:** Complete at least one 90-minute timed mock assessment 48 hours before the actual test.`;

    return [
      {
        role: 'user' as const,
        content: userMessage
      },
      {
        role: 'assistant' as const,
        content: assistantBrief
      }
    ];
  }

  @Prompt({
    name: 'mock-interview',
    description: 'Conduct a realistic technical or behavioral mock interview tailored to candidate skills and target job role',
    arguments: [
      {
        name: 'role',
        description: 'Target job role (e.g. "Software Development Engineer (SDE)", "Full Stack Developer")',
        required: false
      },
      {
        name: 'roundType',
        description: 'Interview focus: "DSA & Problem Solving", "Core CS & System Design", or "Behavioral / HR"',
        required: false
      },
      {
        name: 'difficulty',
        description: 'Interview question difficulty level: "Medium" or "Hard"',
        required: false
      }
    ]
  })
  async mockInterview(args: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating mock-interview prompt', { role: args.role, roundType: args.roundType });

    const profile = this.store.getProfile();
    const role = args.role || profile.preferredJobRoles[0] || 'Software Development Engineer (SDE)';
    const roundType = args.roundType || 'DSA & Problem Solving';
    const difficulty = args.difficulty || 'Medium';

    const userMessage = `Please act as a Senior Technical Interviewer conducting a ${difficulty}-level mock interview for a ${role} position focusing on ${roundType}. Start by asking me my first technical problem or scenario, and evaluate my response iteratively.`;

    const assistantBrief = `Welcome ${profile.name}! I will be your Technical Interviewer today for the **${role}** role focusing on **${roundType}**.

Here is how we will proceed:
1. I will present a real-world coding/algorithmic scenario matching ${difficulty} difficulty.
2. Before writing code, you should clarify constraints, verify edge cases, and describe your high-level approach with Big-O time and space complexities.
3. Then write clean, modular ${profile.programmingLanguages[0] || 'TypeScript/Java/C++'} code.
4. I will follow up with optimizations, edge tests, and architectural trade-offs.

---

### First Problem:
Given an undirected, weighted graph with **N** server nodes and **M** communication links, some nodes are experiencing data packet loss. You are tasked with determining the shortest reliable route from server **S** to destination **D** where no packet loss exceeds threshold **K**.

*Please outline your clarifying questions, chosen data structure, and approach.*`;

    return [
      {
        role: 'user' as const,
        content: userMessage
      },
      {
        role: 'assistant' as const,
        content: assistantBrief
      }
    ];
  }

  @Prompt({
    name: 'resume-review',
    description: 'Evaluate student resume against target tech roles, analyzing keyword ATS compatibility, impact framing, and skill gaps',
    arguments: [
      {
        name: 'targetRole',
        description: 'Target job role e.g. "Software Engineer" or "Full Stack Developer"',
        required: false
      },
      {
        name: 'resumeText',
        description: 'Text content of the student resume or project bullets to review',
        required: false
      }
    ]
  })
  async resumeReview(args: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating resume-review prompt', { targetRole: args.targetRole });

    const profile = this.store.getProfile();
    const targetRole = args.targetRole || profile.preferredJobRoles[0] || 'Software Engineer';
    const resumeText = args.resumeText || `[Using Profile Data]: ${profile.name}, ${profile.degree} ${profile.branch}, CGPA ${profile.cgpa}. Skills: ${profile.technicalSkills.join(', ')}.`;

    const userMessage = `Please review my technical profile and resume for the target role of "${targetRole}". Check for ATS compatibility, quantify project impact using Google's XYZ formula, and highlight any skill gaps.

Resume / Profile Details:
${resumeText}`;

    const assistantBrief = `### 📋 Comprehensive Placement Resume Review

**Evaluation against Target Role:** **${targetRole}**

#### 1. ATS Keyword Alignment (Score: 85/100)
- **Detected Strong Keywords:** ${profile.technicalSkills.slice(0, 5).join(', ')}
- **Recommended Missing High-Value Keywords:** Distributed Systems, Unit Testing (Jest/Mocha), CI/CD Pipelines, Microservices Architecture.

#### 2. Bullet Point Impact (Google XYZ Formula Analysis)
> **Formula:** *"Accomplished [X] as measured by [Y], by doing [Z]"*
- ⚠️ *Common Weakness:* Listing generic responsibilities (e.g., *"Built a full stack web app using React and Node"*).
- ✅ *Strong Revision Example:* *"Engineered a scalable full-stack real-time collaboration portal using React, Node.js, and WebSockets, reducing latency by 38% for 500+ concurrent users."*

#### 3. Core CS & Problem Solving Highlights
- Explicitly emphasize algorithmic problem solving: Include your LeetCode/HackerRank rating or solved problem milestone (e.g. *"Solved 200+ Data Structures & Algorithms problems"*).

#### 4. Actionable Next Steps:
1. Re-format top 2 project bullets using the XYZ impact formula.
2. Ensure GitHub repository links are clean, with descriptive READMEs and live deployment URLs.
3. Tailor the top skills section to match company job descriptions.`;

    return [
      {
        role: 'user' as const,
        content: userMessage
      },
      {
        role: 'assistant' as const,
        content: assistantBrief
      }
    ];
  }
}
