import { ActivityReport } from '../domain/model/activity-report.entity.js';

export class ActivityReportAssembler {
  toEntityFromResource(r) {
    return new ActivityReport({
      id:                   r.id,
      activityReportId:     r.activityReportId,
      totalUsageTime:       r.totalUsageTime,
      downtimeCost:         r.downtimeCost,
      percentageComparison: r.percentageComparison,
      createdAt:            r.createdAt,
    });
  }
}
