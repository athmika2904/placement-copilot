/**
 * Placement Copilot Sample Mock Data
 * 
 * NOTE: All company recruitment criteria and schedules are sample mock datasets
 * designed for demonstration and hackathon evaluation. They do NOT represent
 * official recruitment policies.
 */

import {
  StudentProfile,
  CompanyCriteria,
  CompanyApplication,
  RecruitmentDeadline,
  TopicConfidence,
  PracticeLogEntry
} from './types.js';

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  name: 'Rahul Sharma',
  college: 'National Institute of Technology',
  degree: 'B.Tech',
  branch: 'Computer Science and Engineering',
  graduationYear: 2026,
  cgpa: 8.42,
  activeBacklogs: 0,
  technicalSkills: [
    'Data Structures & Algorithms',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'Java',
    'PostgreSQL',
    'Git',
    'REST APIs',
    'Docker'
  ],
  programmingLanguages: ['C++', 'Python', 'Java', 'TypeScript'],
  preferredJobRoles: [
    'Software Development Engineer (SDE)',
    'Full Stack Developer',
    'Backend Engineer'
  ],
  dailyAvailableHours: 3,
  strongTopics: [
    'Arrays & Hashing',
    'Two Pointers',
    'Sliding Window',
    'Binary Search',
    'SQL Joins & Aggregations',
    'Object-Oriented Programming (OOP)',
    'DBMS Normalization'
  ],
  weakTopics: [
    'Dynamic Programming',
    'Graph Algorithms',
    'Tries',
    'Operating Systems Concurrency',
    'Computer Networks Subnetting'
  ]
};

export const SAMPLE_COMPANY_CRITERIA: CompanyCriteria[] = [
  {
    companyName: 'Infosys',
    jobRole: 'Specialist Programmer',
    minCgpa: 7.0,
    allowedBranches: [
      'Computer Science and Engineering',
      'Information Technology',
      'Electronics and Communication Engineering',
      'Electrical and Electronics Engineering'
    ],
    eligibleGraduationYears: [2026],
    maxBacklogsAllowed: 0,
    requiredSkills: ['Data Structures & Algorithms', 'Java', 'Python', 'DBMS', 'OOP'],
    preferredSkills: ['Problem Solving', 'Competitive Programming'],
    recruitmentRounds: [
      'Online Coding Assessment (3 Problems - 3 Hours)',
      'Technical Interview (DSA & Project Deep-dive)',
      'HR Discussion'
    ],
    description: 'Premier coding role focusing on algorithmic problem-solving and full-stack development.',
    isMockData: true
  },
  {
    companyName: 'Google',
    jobRole: 'Software Engineer (Early Career)',
    minCgpa: 8.0,
    allowedBranches: [
      'Computer Science and Engineering',
      'Information Technology',
      'Electronics and Communication Engineering',
      'Electrical Engineering',
      'Mathematics and Computing'
    ],
    eligibleGraduationYears: [2026],
    maxBacklogsAllowed: 0,
    requiredSkills: ['Data Structures & Algorithms', 'C++', 'Java', 'Python'],
    preferredSkills: ['Distributed Systems', 'System Design Basics', 'Open Source Contributions'],
    recruitmentRounds: [
      'Online Assessment (2 Algorithmic Challenges)',
      'Technical Phone Screen (45 Mins)',
      'Onsite Virtual Rounds (3x Technical Interviews)'
    ],
    description: 'Core software engineering role focusing on large-scale scalable systems.',
    isMockData: true
  },
  {
    companyName: 'Amazon',
    jobRole: 'Software Development Engineer (SDE)',
    minCgpa: 7.5,
    allowedBranches: [
      'Computer Science and Engineering',
      'Information Technology',
      'Electronics and Communication Engineering'
    ],
    eligibleGraduationYears: [2026],
    maxBacklogsAllowed: 0,
    requiredSkills: ['Data Structures & Algorithms', 'OOP', 'Operating Systems', 'DBMS'],
    preferredSkills: ['Leadership Principles', 'AWS Basics', 'Clean Architecture'],
    recruitmentRounds: [
      'Online Assessment (Debugging, 2 Coding Qs, Work Styles)',
      'Technical Interview 1 (DSA & Problem Solving)',
      'Technical Interview 2 (OOP & System Design)',
      'Bar Raiser Interview (Behavioral & Problem Solving)'
    ],
    description: 'High-impact customer-obsessed engineering role across AWS and Consumer teams.',
    isMockData: true
  },
  {
    companyName: 'Microsoft',
    jobRole: 'Software Engineer',
    minCgpa: 7.5,
    allowedBranches: [
      'Computer Science and Engineering',
      'Information Technology',
      'Electronics and Communication Engineering',
      'Electrical Engineering'
    ],
    eligibleGraduationYears: [2026],
    maxBacklogsAllowed: 0,
    requiredSkills: ['Data Structures & Algorithms', 'C++', 'C#', 'Java', 'OOP', 'SQL'],
    preferredSkills: ['Cloud Computing', 'Git Collaboration'],
    recruitmentRounds: [
      'Online Assessment (Codility 3 Questions)',
      'Technical Round 1 (Data Structures)',
      'Technical Round 2 (Algorithms & System Architecture)',
      'Director / AA Round (Technical + Behavioral)'
    ],
    description: 'Empower every person and organization through world-class software.',
    isMockData: true
  },
  {
    companyName: 'TCS',
    jobRole: 'TCS Digital / Prime Developer',
    minCgpa: 6.5,
    allowedBranches: [
      'Computer Science and Engineering',
      'Information Technology',
      'Electronics and Communication Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering'
    ],
    eligibleGraduationYears: [2026],
    maxBacklogsAllowed: 1,
    requiredSkills: ['Python', 'Java', 'Data Structures & Algorithms', 'SQL', 'Aptitude'],
    preferredSkills: ['Cloud Basics', 'Machine Learning Basics'],
    recruitmentRounds: [
      'TCS NQT Assessment (Aptitude + Advanced Coding)',
      'Technical + HR Combined Interview'
    ],
    description: 'Premium technical cadre working on enterprise digital transformation and AI solutions.',
    isMockData: true
  }
];

export const INITIAL_APPLICATIONS: CompanyApplication[] = [
  {
    id: 'app-001',
    companyName: 'Microsoft',
    jobRole: 'Software Engineer',
    applicationDate: '2026-10-25',
    stage: 'Interested',
    applicationDeadline: '2026-11-01',
    notes: 'Referral requested from alum. Resume tailored for systems and cloud.',
    eligibilityStatus: 'Eligible'
  },
  {
    id: 'app-002',
    companyName: 'Google',
    jobRole: 'Software Engineer (Early Career)',
    applicationDate: '2026-10-18',
    stage: 'Applied',
    applicationDeadline: '2026-10-31',
    oaDate: '2026-11-15',
    notes: 'Application submitted via careers portal. Waiting for OA link.',
    eligibilityStatus: 'Eligible'
  },
  {
    id: 'app-003',
    companyName: 'Infosys',
    jobRole: 'Specialist Programmer',
    applicationDate: '2026-10-15',
    stage: 'OA',
    oaDate: '2026-11-21',
    notes: 'Scheduled for Online Assessment on Hackerearth platform. High focus on DP and Graphs.',
    eligibilityStatus: 'Eligible'
  },
  {
    id: 'app-004',
    companyName: 'Amazon',
    jobRole: 'Software Development Engineer (SDE)',
    applicationDate: '2026-09-28',
    stage: 'Interview',
    oaDate: '2026-10-10',
    interviewDate: '2026-11-03',
    notes: 'Cleared OA! Technical Round 1 scheduled with Senior SDE. Focus on Trees and Amazon LP.',
    eligibilityStatus: 'Eligible'
  },
  {
    id: 'app-005',
    companyName: 'TCS',
    jobRole: 'TCS Digital / Prime Developer',
    applicationDate: '2026-09-10',
    stage: 'Offer',
    oaDate: '2026-09-25',
    interviewDate: '2026-10-08',
    notes: 'Offer letter received! Base package 9 LPA. Accepting as strong backup.',
    eligibilityStatus: 'Eligible'
  },
  {
    id: 'app-006',
    companyName: 'Uber',
    jobRole: 'Software Engineer',
    applicationDate: '2026-09-01',
    stage: 'Rejected',
    oaDate: '2026-09-15',
    notes: 'Eliminated after OA coding round. Need to improve competitive programming speed.',
    eligibilityStatus: 'Eligible'
  }
];

export const INITIAL_DEADLINES: RecruitmentDeadline[] = [
  {
    id: 'dl-001',
    companyName: 'Microsoft',
    jobRole: 'Software Engineer',
    deadlineType: 'Application',
    dueDate: '2026-11-01T23:59:00',
    description: 'Portal closing in 24 hours. Submit final application and referral code.'
  },
  {
    id: 'dl-002',
    companyName: 'Amazon',
    jobRole: 'Software Development Engineer (SDE)',
    deadlineType: 'Technical Interview',
    dueDate: '2026-11-03T14:00:00',
    description: 'Chime interview round 1: Live coding on binary trees and system decomposition.'
  },
  {
    id: 'dl-003',
    companyName: 'Google',
    jobRole: 'Software Engineer (Early Career)',
    deadlineType: 'OA',
    dueDate: '2026-11-15T18:00:00',
    description: 'Google Online Challenge 90-minute assessment window.'
  },
  {
    id: 'dl-004',
    companyName: 'Infosys',
    jobRole: 'Specialist Programmer',
    deadlineType: 'OA',
    dueDate: '2026-11-21T10:00:00',
    description: 'Infosys Specialist Programmer 3-hour national coding contest.'
  }
];

export const INITIAL_TOPIC_CONFIDENCES: TopicConfidence[] = [
  // DSA
  { topic: 'Arrays & Strings', category: 'DSA', importance: 5, confidence: 5, problemsSolved: 45, targetProblems: 45, completed: true },
  { topic: 'Two Pointers & Sliding Window', category: 'DSA', importance: 4, confidence: 4, problemsSolved: 28, targetProblems: 30, completed: false },
  { topic: 'Binary Search', category: 'DSA', importance: 4, confidence: 4, problemsSolved: 22, targetProblems: 25, completed: false },
  { topic: 'Trees & Binary Search Trees', category: 'DSA', importance: 5, confidence: 3, problemsSolved: 25, targetProblems: 40, completed: false },
  { topic: 'Dynamic Programming', category: 'DSA', importance: 5, confidence: 2, problemsSolved: 16, targetProblems: 50, completed: false },
  { topic: 'Graph Algorithms', category: 'DSA', importance: 5, confidence: 2, problemsSolved: 12, targetProblems: 45, completed: false },
  { topic: 'Heap & Priority Queue', category: 'DSA', importance: 4, confidence: 3, problemsSolved: 14, targetProblems: 25, completed: false },
  { topic: 'Backtracking & Recursion', category: 'DSA', importance: 4, confidence: 3, problemsSolved: 15, targetProblems: 25, completed: false },
  
  // Core CS
  { topic: 'DBMS & SQL Queries', category: 'DBMS', importance: 5, confidence: 4, problemsSolved: 32, targetProblems: 35, completed: false },
  { topic: 'Operating Systems (Concurrency & Paging)', category: 'Operating Systems', importance: 5, confidence: 2, problemsSolved: 14, targetProblems: 30, completed: false },
  { topic: 'Computer Networks (OSI, TCP/IP, Routing)', category: 'Computer Networks', importance: 4, confidence: 3, problemsSolved: 15, targetProblems: 25, completed: false },
  { topic: 'OOP & Design Patterns', category: 'OOP', importance: 5, confidence: 4, problemsSolved: 24, targetProblems: 25, completed: false },
  
  // Aptitude & Interviews
  { topic: 'Quantitative Aptitude', category: 'Aptitude', importance: 3, confidence: 4, problemsSolved: 40, targetProblems: 50, completed: false },
  { topic: 'Technical & HR Mock Scenarios', category: 'Technical Interviews', importance: 4, confidence: 3, problemsSolved: 6, targetProblems: 15, completed: false }
];

export const INITIAL_PRACTICE_LOGS: PracticeLogEntry[] = [
  {
    id: 'log-001',
    date: '2026-10-28',
    topic: 'Trees & Binary Search Trees',
    category: 'DSA',
    problemsSolved: 4,
    studyHours: 2.5,
    notes: 'Solved Lowest Common Ancestor, Binary Tree Maximum Path Sum.',
    newConfidence: 3
  },
  {
    id: 'log-002',
    date: '2026-10-29',
    topic: 'DBMS & SQL Queries',
    category: 'DBMS',
    problemsSolved: 6,
    studyHours: 2.0,
    notes: 'Practiced Window Functions (DENSE_RANK, LEAD, LAG) on LeetCode SQL 50.',
    newConfidence: 4
  },
  {
    id: 'log-003',
    date: '2026-10-30',
    topic: 'Dynamic Programming',
    category: 'DSA',
    problemsSolved: 3,
    studyHours: 3.0,
    notes: 'Studied 0/1 Knapsack patterns and Coin Change I & II.',
    newConfidence: 2
  }
];
