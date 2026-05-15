import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint.js';
import { EquipmentUsageStatAssembler } from './equipment-usage-stat-assembler.js';

export class EquipmentUsageStatEndpoint extends BaseEndpoint {
  constructor(api) {
    super(api, 'equipment_usage_stats', new EquipmentUsageStatAssembler());
  }
}
