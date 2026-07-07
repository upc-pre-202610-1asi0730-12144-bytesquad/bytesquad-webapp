import { AnalyticsStat } from '../domain/model/analytics-stat.entity.js';

export class AnalyticsAssembler {
  toEntityFromResource(r) {
    return new AnalyticsStat({
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
