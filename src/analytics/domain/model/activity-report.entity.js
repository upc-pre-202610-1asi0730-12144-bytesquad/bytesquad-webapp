export class ActivityReport {
  constructor({ id, activityReportId, totalUsageTime, downtimeCost, percentageComparison, createdAt }) {
    this.id                   = id;
    this.activityReportId     = activityReportId;
    this.totalUsageTime       = totalUsageTime;       // long
    this.downtimeCost         = downtimeCost;         // long
    this.percentageComparison = percentageComparison; // double
    this.createdAt            = createdAt;            // ISO 8601 string
  }
}
