import { FinancialStat } from '../../../../../Downloads/integrante#5-Jesus/integrante#5-Jesus/commit#3/financial-impact/domain/model/financial-stat.entity.js';

export class FinancialAssembler {
  toEntityFromResource(r) {
    return new FinancialStat({
      id:                 r.id,
      equipmentId:        r.equipment_id,
      totalUsageHours:    r.total_usage_hours,
      usageCountDaily:    r.usage_count_daily,
      estimatedWearLevel: r.estimated_wear_level,
    });
  }

  toResourceFromEntity(e) {
    return {
      id:                   e.id,
      equipment_id:         e.equipmentId,
      total_usage_hours:    e.totalUsageHours,
      usage_count_daily:    e.usageCountDaily,
      estimated_wear_level: e.estimatedWearLevel,
    };
  }
}
