import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint.js';
import { FinancialAssembler } from './financial-assembler.js';

export class FinancialEndpoint extends BaseEndpoint {
  constructor(api) {
    super(api, 'equipment_usage_stats', new FinancialAssembler());
  }
}
