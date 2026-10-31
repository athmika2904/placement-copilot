import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { PlacementModule } from './modules/placement/placement.module.js';
import { SystemHealthCheck } from './health/system.health.js';

/**
 * Root Application Module
 * 
 * Bootstraps Placement Copilot MCP server.
 * Registers feature modules and health checks.
 */
@McpApp({
  module: AppModule,
  server: {
    name: 'placement-copilot-your-ai-powered-placement-command-center',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'Root application module',
  imports: [
    ConfigModule.forRoot(),
    PlacementModule
  ],
  providers: [
    // Health Checks
    SystemHealthCheck,
  ]
})
export class AppModule {}

