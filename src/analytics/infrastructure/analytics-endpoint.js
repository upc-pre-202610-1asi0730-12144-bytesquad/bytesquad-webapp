import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint.js';
import { AnalyticsAssembler } from './analytics-assembler.js';

export class AnalyticsEndpoint extends BaseEndpoint {
  constructor(api) {
    super(api, 'equipment_usage_stats', new AnalyticsAssembler());
  }
}
