/**
 * Placement Copilot Data Types & Interfaces
 */

export type RecruitmentStage = 
  | 'Interested' 
  | 'Applied' 
  | 'OA' 
  | 'Interview' 
  | 'Offer' 
  | 'Rejected';

export type EligibilityStatus = 
  | 'Eligible' 
  | 'Not eligible' 
  | 'Needs verification';

export type DeadlineType = 
  | 'Application' 
  | 'OA' 
  | 'Technical Interview' 
  | 'HR Interview' 
  | 'Assessment';

export type PrepCategory = 
  | 'DSA' 
  | 'Core CS' 
  | 'DBMS' 
  | 'Operating Systems' 
  | 'Computer Networks' 
  | 'OOP' 
  | 'SQL' 
  | 'Aptitude' 
  | 'Projects' 
  | 'Technical Interviews' 
  | 'HR Interviews';

export interface StudentProfile {
  name: string;
  college: string;
  degree: string;
  branch: string;
  graduationYear: number;
  cgpa: number;
  activeBacklogs: number;
  technicalSkills: string[];
  programmingLanguages: string[];
  preferredJobRoles: string[];
  dailyAvailableHours: number;
  strongTopics: string[];
  weakTopics: string[];
}

export interface CompanyApplication {
  id: string;
  companyName: string;
  jobRole: string;
  applicationDate: string; // ISO date string YYYY-MM-DD
  stage: RecruitmentStage;
  applicationDeadline?: string;
  oaDate?: string;
  interviewDate?: string;
  notes?: string;
  eligibilityStatus: EligibilityStatus;
}

export interface RecruitmentDeadline {
  id: string;
  companyName: string;
  jobRole: string;
  deadlineType: DeadlineType;
  dueDate: string; // ISO date string YYYY-MM-DD or YYYY-MM-DDTHH:mm
  description?: string;
  isCompleted?: boolean;
}

export interface CompanyCriteria {
  companyName: string;
  jobRole: string;
  minCgpa: number;
  allowedBranches: string[];
  eligibleGraduationYears: number[];
  maxBacklogsAllowed: number;
  requiredSkills: string[];
  preferredSkills?: string[];
  recruitmentRounds: string[];
  description?: string;
  isMockData: true;
}

export interface TopicConfidence {
  topic: string;
  category: PrepCategory;
  importance: number; // Scale 1 - 5
  confidence: number; // Scale 1 - 5
  problemsSolved: number;
  targetProblems: number;
  completed: boolean;
}

export interface PracticeLogEntry {
  id: string;
  date: string; // ISO date
  topic: string;
  category: PrepCategory;
  problemsSolved: number;
  studyHours: number;
  notes?: string;
  newConfidence?: number;
}

export interface StudyTask {
  id: string;
  dayNumber: number;
  date: string;
  category: PrepCategory;
  topic: string;
  taskDescription: string;
  allocatedHours: number;
  isCompleted: boolean;
  type: 'learning' | 'practice' | 'revision' | 'mock_test';
}

export interface PreparationPlan {
  id: string;
  targetCompany: string;
  recruitmentRound: string;
  totalDays: number;
  dailyStudyHours: number;
  createdAt: string;
  prioritizedTopics: Array<{
    topic: string;
    category: PrepCategory;
    importance: number;
    confidence: number;
    calculatedPriority: number; // Priority = Topic Importance * (6 - Confidence)
    allocatedDays: number;
  }>;
  schedule: StudyTask[];
  summary: string;
}

export interface PlacementDashboardMetrics {
  profileCompletion: number;
  totalApplications: number;
  applicationsByStage: Record<RecruitmentStage, number>;
  totalProblemsSolved: number;
  totalStudyHours: number;
  dsaProgressPercentage: number;
  coreCsProgressPercentage: number;
  sqlProgressPercentage: number;
  aptitudeProgressPercentage: number;
  overallReadinessPercentage: number;
  studyConsistencyStreakDays: number;
  urgentDeadlinesCount: number;
}
