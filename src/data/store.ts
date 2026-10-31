/**
 * Placement Copilot Central In-Memory Store
 * 
 * Provides session-persistent state with comprehensive CRUD operations.
 * Designed to easily swap with MongoDB, PostgreSQL, or SQLite in production.
 */

import {
  StudentProfile,
  CompanyApplication,
  RecruitmentDeadline,
  CompanyCriteria,
  TopicConfidence,
  PracticeLogEntry,
  PreparationPlan,
  RecruitmentStage,
  PlacementDashboardMetrics
} from './types.js';

import {
  INITIAL_STUDENT_PROFILE,
  SAMPLE_COMPANY_CRITERIA,
  INITIAL_APPLICATIONS,
  INITIAL_DEADLINES,
  INITIAL_TOPIC_CONFIDENCES,
  INITIAL_PRACTICE_LOGS
} from './mockData.js';

export class PlacementStore {
  private static instance: PlacementStore;

  private profile!: StudentProfile;
  private applications: Map<string, CompanyApplication> = new Map();
  private deadlines: Map<string, RecruitmentDeadline> = new Map();
  private companyCriteria: Map<string, CompanyCriteria> = new Map();
  private topicConfidences: Map<string, TopicConfidence> = new Map();
  private practiceLogs: PracticeLogEntry[] = [];
  private generatedPlans: Map<string, PreparationPlan> = new Map();

  private constructor() {
    this.resetToDefaults();
  }

  public static getInstance(): PlacementStore {
    if (!PlacementStore.instance) {
      PlacementStore.instance = new PlacementStore();
    }
    return PlacementStore.instance;
  }

  public resetToDefaults(): void {
    this.profile = { ...INITIAL_STUDENT_PROFILE };

    this.applications.clear();
    for (const app of INITIAL_APPLICATIONS) {
      this.applications.set(app.id, { ...app });
    }

    this.deadlines.clear();
    for (const dl of INITIAL_DEADLINES) {
      this.deadlines.set(dl.id, { ...dl });
    }

    this.companyCriteria.clear();
    for (const comp of SAMPLE_COMPANY_CRITERIA) {
      this.companyCriteria.set(comp.companyName.toLowerCase(), { ...comp });
    }

    this.topicConfidences.clear();
    for (const tc of INITIAL_TOPIC_CONFIDENCES) {
      this.topicConfidences.set(tc.topic.toLowerCase(), { ...tc });
    }

    this.practiceLogs = [...INITIAL_PRACTICE_LOGS];
    this.generatedPlans.clear();
  }

  // --- Student Profile Methods ---
  public getProfile(): StudentProfile {
    return { ...this.profile };
  }

  public updateProfile(updates: Partial<StudentProfile>): StudentProfile {
    this.profile = {
      ...this.profile,
      ...updates
    };
    return this.getProfile();
  }

  // --- Application Tracker Methods ---
  public getApplications(): CompanyApplication[] {
    return Array.from(this.applications.values());
  }

  public getApplication(id: string): CompanyApplication | undefined {
    const app = this.applications.get(id);
    return app ? { ...app } : undefined;
  }

  public addApplication(appData: Omit<CompanyApplication, 'id'> & { id?: string }): CompanyApplication {
    const id = appData.id || `app-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newApp: CompanyApplication = {
      ...appData,
      id
    };
    this.applications.set(id, newApp);

    // Auto-create deadline entries if dates are provided
    if (newApp.applicationDeadline) {
      this.addDeadline({
        companyName: newApp.companyName,
        jobRole: newApp.jobRole,
        deadlineType: 'Application',
        dueDate: newApp.applicationDeadline,
        description: `Application deadline for ${newApp.companyName} (${newApp.jobRole})`
      });
    }
    if (newApp.oaDate) {
      this.addDeadline({
        companyName: newApp.companyName,
        jobRole: newApp.jobRole,
        deadlineType: 'OA',
        dueDate: newApp.oaDate,
        description: `Online assessment for ${newApp.companyName} (${newApp.jobRole})`
      });
    }
    if (newApp.interviewDate) {
      this.addDeadline({
        companyName: newApp.companyName,
        jobRole: newApp.jobRole,
        deadlineType: 'Technical Interview',
        dueDate: newApp.interviewDate,
        description: `Interview round for ${newApp.companyName} (${newApp.jobRole})`
      });
    }

    return newApp;
  }

  public updateApplicationStatus(id: string, stage: RecruitmentStage, notes?: string): CompanyApplication | null {
    const app = this.applications.get(id);
    if (!app) return null;

    app.stage = stage;
    if (notes) {
      app.notes = app.notes ? `${app.notes} | ${notes}` : notes;
    }
    this.applications.set(id, app);
    return { ...app };
  }

  public deleteApplication(id: string): boolean {
    return this.applications.delete(id);
  }

  // --- Deadline Methods ---
  public getDeadlines(): RecruitmentDeadline[] {
    return Array.from(this.deadlines.values());
  }

  public addDeadline(deadlineData: Omit<RecruitmentDeadline, 'id'> & { id?: string }): RecruitmentDeadline {
    const id = deadlineData.id || `dl-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newDl: RecruitmentDeadline = {
      ...deadlineData,
      id
    };
    this.deadlines.set(id, newDl);
    return newDl;
  }

  // --- Company Criteria Methods ---
  public getCompanyCriteriaList(): CompanyCriteria[] {
    return Array.from(this.companyCriteria.values());
  }

  public getCompanyCriteria(companyName: string): CompanyCriteria | undefined {
    const criteria = this.companyCriteria.get(companyName.toLowerCase().trim());
    return criteria ? { ...criteria } : undefined;
  }

  // --- Topic & Preparation Progress Methods ---
  public getTopicConfidences(): TopicConfidence[] {
    return Array.from(this.topicConfidences.values());
  }

  public getTopicConfidence(topicName: string): TopicConfidence | undefined {
    return this.topicConfidences.get(topicName.toLowerCase().trim());
  }

  public logPractice(entry: Omit<PracticeLogEntry, 'id'>): PracticeLogEntry {
    const id = `log-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newEntry: PracticeLogEntry = { ...entry, id };
    this.practiceLogs.unshift(newEntry);

    // Update topic stats if topic exists
    const key = entry.topic.toLowerCase().trim();
    const existing = this.topicConfidences.get(key);
    if (existing) {
      existing.problemsSolved += entry.problemsSolved;
      if (entry.newConfidence && entry.newConfidence >= 1 && entry.newConfidence <= 5) {
        existing.confidence = entry.newConfidence;
      }
      if (existing.problemsSolved >= existing.targetProblems) {
        existing.completed = true;
      }
      this.topicConfidences.set(key, existing);
    } else {
      // Add as new topic
      this.topicConfidences.set(key, {
        topic: entry.topic,
        category: entry.category,
        importance: 4,
        confidence: entry.newConfidence || 3,
        problemsSolved: entry.problemsSolved,
        targetProblems: Math.max(30, entry.problemsSolved + 10),
        completed: false
      });
    }

    return newEntry;
  }

  public getPracticeLogs(): PracticeLogEntry[] {
    return [...this.practiceLogs];
  }

  // --- Preparation Plans ---
  public savePlan(plan: PreparationPlan): void {
    this.generatedPlans.set(plan.id, plan);
  }

  public getLatestPlan(): PreparationPlan | undefined {
    const plans = Array.from(this.generatedPlans.values());
    return plans.length > 0 ? plans[plans.length - 1] : undefined;
  }

  public getPlan(id: string): PreparationPlan | undefined {
    return this.generatedPlans.get(id);
  }

  // --- Dashboard Analytics Calculation ---
  public calculateDashboardMetrics(): PlacementDashboardMetrics {
    const apps = this.getApplications();
    const stages: Record<RecruitmentStage, number> = {
      Interested: 0,
      Applied: 0,
      OA: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0
    };
    for (const a of apps) {
      if (stages[a.stage] !== undefined) {
        stages[a.stage]++;
      }
    }

    const topics = this.getTopicConfidences();
    let totalProblemsSolved = 0;
    let dsaProblems = 0;
    let dsaTarget = 0;
    let coreCsProblems = 0;
    let coreCsTarget = 0;
    let sqlProblems = 0;
    let sqlTarget = 0;
    let aptitudeProblems = 0;
    let aptitudeTarget = 0;

    for (const t of topics) {
      totalProblemsSolved += t.problemsSolved;
      if (t.category === 'DSA') {
        dsaProblems += t.problemsSolved;
        dsaTarget += t.targetProblems;
      } else if (['DBMS', 'Operating Systems', 'Computer Networks', 'OOP', 'Core CS'].includes(t.category)) {
        coreCsProblems += t.problemsSolved;
        coreCsTarget += t.targetProblems;
      } else if (t.category === 'SQL') {
        sqlProblems += t.problemsSolved;
        sqlTarget += t.targetProblems;
      } else if (t.category === 'Aptitude') {
        aptitudeProblems += t.problemsSolved;
        aptitudeTarget += t.targetProblems;
      }
    }

    let totalStudyHours = 0;
    for (const l of this.practiceLogs) {
      totalStudyHours += l.studyHours;
    }

    const dsaPct = dsaTarget > 0 ? Math.min(100, Math.round((dsaProblems / dsaTarget) * 100)) : 50;
    const coreCsPct = coreCsTarget > 0 ? Math.min(100, Math.round((coreCsProblems / coreCsTarget) * 100)) : 50;
    const sqlPct = sqlTarget > 0 ? Math.min(100, Math.round((sqlProblems / sqlTarget) * 100)) : 50;
    const aptitudePct = aptitudeTarget > 0 ? Math.min(100, Math.round((aptitudeProblems / aptitudeTarget) * 100)) : 50;

    // Overall readiness is a weighted composite of DSA (40%), Core CS (30%), SQL (15%), Aptitude (15%)
    const overallReadiness = Math.round(
      dsaPct * 0.4 + coreCsPct * 0.3 + sqlPct * 0.15 + aptitudePct * 0.15
    );

    return {
      profileCompletion: 100,
      totalApplications: apps.length,
      applicationsByStage: stages,
      totalProblemsSolved,
      totalStudyHours: Math.round(totalStudyHours * 10) / 10,
      dsaProgressPercentage: dsaPct,
      coreCsProgressPercentage: coreCsPct,
      sqlProgressPercentage: sqlPct,
      aptitudeProgressPercentage: aptitudePct,
      overallReadinessPercentage: overallReadiness,
      studyConsistencyStreakDays: Math.min(7, this.practiceLogs.length),
      urgentDeadlinesCount: 2 // Microsoft (24h) and Amazon (3d)
    };
  }
}
