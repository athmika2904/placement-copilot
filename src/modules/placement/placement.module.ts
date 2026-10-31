import { Module } from '@nitrostack/core';
import { ProfileTools } from './tools/profile.tools.js';
import { ApplicationTools } from './tools/application.tools.js';
import { DeadlineTools } from './tools/deadline.tools.js';
import { EligibilityTools } from './tools/eligibility.tools.js';
import { PreparationTools } from './tools/preparation.tools.js';
import { AnalyticsTools } from './tools/analytics.tools.js';
import { PlacementResources } from './placement.resources.js';
import { PlacementPrompts } from './placement.prompts.js';

@Module({
  name: 'placement',
  description: 'Placement Copilot - AI-powered Placement Preparation & Recruitment Command Center',
  controllers: [
    ProfileTools,
    ApplicationTools,
    DeadlineTools,
    EligibilityTools,
    PreparationTools,
    AnalyticsTools,
    PlacementResources,
    PlacementPrompts
  ]
})
export class PlacementModule {}
