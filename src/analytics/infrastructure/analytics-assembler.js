import { AnalyticsStat } from '../domain/model/analytics-stat.entity.js';

export class AnalyticsAssembler {
  toEntityFromResource(r) {
    return new AnalyticsStat({
      id:                 r.id,
      equipmentId:        r.equipmentId,
      totalUsageHours:    r.totalUsageHours,
      usageCountDaily:    r.usageCountDaily,
      estimatedWearLevel: r.estimatedWearLevel,
    });
  }

  toResourceFromEntity(e) {
    return {
      id:                 e.id,
      equipmentId:        e.equipmentId,
      totalUsageHours:    e.totalUsageHours,
      usageCountDaily:    e.usageCountDaily,
      estimatedWearLevel: e.estimatedWearLevel,
    };
  }
}
