import { ResourceDecorator as Resource, ExecutionContext } from '@nitrostack/core';
import { PlacementStore } from '../../data/store.js';

export class PlacementResources {
  private store = PlacementStore.getInstance();

  @Resource({
    uri: 'placement://student/profile',
    name: 'Student Placement Profile',
    description: 'Current academic credentials, technical skills, programming languages, and identified strengths/weaknesses',
    mimeType: 'application/json',
    examples: {
      response: {
        name: 'Rahul Sharma',
        college: 'National Institute of Technology',
        degree: 'B.Tech',
        branch: 'Computer Science and Engineering',
        graduationYear: 2026,
        cgpa: 8.42
      }
    }
  })
  async getStudentProfileResource(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Reading resource: placement://student/profile');
    const profile = this.store.getProfile();
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ profile }, null, 2)
      }]
    };
  }

  @Resource({
    uri: 'placement://companies',
    name: 'Recruitment Companies & Eligibility Criteria',
    description: 'Directory of company recruitment profiles, eligibility thresholds (CGPA, branches, batches), and recruitment stages',
    mimeType: 'application/json',
    examples: {
      response: {
        companiesCount: 5,
        companies: ['Infosys', 'Google', 'Amazon', 'Microsoft', 'TCS']
      }
    }
  })
  async getCompaniesResource(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Reading resource: placement://companies');
    const companies = this.store.getCompanyCriteriaList();
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({
          count: companies.length,
          disclaimer: 'Sample mock recruitment data for demonstration purposes.',
          companies
        }, null, 2)
      }]
    };
  }

  @Resource({
    uri: 'placement://companies/infosys',
    name: 'Infosys Recruitment Criteria & Rounds',
    description: 'Detailed recruitment rounds, syllabus, and eligibility criteria for Infosys Specialist Programmer',
    mimeType: 'application/json'
  })
  async getInfosysResource(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Reading resource: placement://companies/infosys');
    const criteria = this.store.getCompanyCriteria('infosys');
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ criteria }, null, 2)
      }]
    };
  }

  @Resource({
    uri: 'placement://companies/google',
    name: 'Google Recruitment Criteria & Rounds',
    description: 'Detailed recruitment rounds, syllabus, and eligibility criteria for Google Early Career SWE',
    mimeType: 'application/json'
  })
  async getGoogleResource(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Reading resource: placement://companies/google');
    const criteria = this.store.getCompanyCriteria('google');
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ criteria }, null, 2)
      }]
    };
  }

  @Resource({
    uri: 'placement://companies/amazon',
    name: 'Amazon Recruitment Criteria & Rounds',
    description: 'Detailed recruitment rounds, syllabus, and eligibility criteria for Amazon SDE-1',
    mimeType: 'application/json'
  })
  async getAmazonResource(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Reading resource: placement://companies/amazon');
    const criteria = this.store.getCompanyCriteria('amazon');
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ criteria }, null, 2)
      }]
    };
  }

  @Resource({
    uri: 'placement://companies/microsoft',
    name: 'Microsoft Recruitment Criteria & Rounds',
    description: 'Detailed recruitment rounds, syllabus, and eligibility criteria for Microsoft SWE',
    mimeType: 'application/json'
  })
  async getMicrosoftResource(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Reading resource: placement://companies/microsoft');
    const criteria = this.store.getCompanyCriteria('microsoft');
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ criteria }, null, 2)
      }]
    };
  }

  @Resource({
    uri: 'placement://companies/tcs',
    name: 'TCS Recruitment Criteria & Rounds',
    description: 'Detailed recruitment rounds, syllabus, and eligibility criteria for TCS Digital/Prime',
    mimeType: 'application/json'
  })
  async getTcsResource(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Reading resource: placement://companies/tcs');
    const criteria = this.store.getCompanyCriteria('tcs');
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ criteria }, null, 2)
      }]
    };
  }

  @Resource({
    uri: 'placement://topics/dsa',
    name: 'DSA Topic Mastery & Problem Counts',
    description: 'Topic-by-topic problem targets, problems solved, and confidence scores across Data Structures and Algorithms',
    mimeType: 'application/json'
  })
  async getDsaTopicsResource(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Reading resource: placement://topics/dsa');
    const dsaTopics = this.store.getTopicConfidences().filter(t => t.category === 'DSA');
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ category: 'DSA', topicsCount: dsaTopics.length, topics: dsaTopics }, null, 2)
      }]
    };
  }

  @Resource({
    uri: 'placement://topics/core-cs',
    name: 'Core CS Foundations (DBMS, OS, CN, OOP)',
    description: 'Topic-by-topic problem targets, solved counts, and confidence scores across Core Computer Science disciplines',
    mimeType: 'application/json'
  })
  async getCoreCsTopicsResource(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Reading resource: placement://topics/core-cs');
    const coreTopics = this.store.getTopicConfidences().filter(t => 
      ['DBMS', 'Operating Systems', 'Computer Networks', 'OOP', 'SQL'].includes(t.category)
    );
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ category: 'Core CS & SQL', topicsCount: coreTopics.length, topics: coreTopics }, null, 2)
      }]
    };
  }

  @Resource({
    uri: 'placement://preparation/progress',
    name: 'Preparation Progress & Activity Metrics',
    description: 'Composite preparation readiness percentage, total study hours logged, recent practice log entries, and active streaks',
    mimeType: 'application/json'
  })
  async getPreparationProgressResource(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Reading resource: placement://preparation/progress');
    const metrics = this.store.calculateDashboardMetrics();
    const logs = this.store.getPracticeLogs();
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({
          readiness: metrics.overallReadinessPercentage,
          metrics,
          recentPracticeLogs: logs.slice(0, 5)
        }, null, 2)
      }]
    };
  }
}
