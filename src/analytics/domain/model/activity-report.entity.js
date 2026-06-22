export class ActivityReport {
  constructor({ id, activityReportId, totalUsageTime, downtimeCost, percentageComparison }) {
    this.id                   = id;
    this.activityReportId     = activityReportId;
    this.totalUsageTime       = totalUsageTime;       // long
    this.downtimeCost         = downtimeCost;         // long
    this.percentageComparison = percentageComparison; // double
  }
}
