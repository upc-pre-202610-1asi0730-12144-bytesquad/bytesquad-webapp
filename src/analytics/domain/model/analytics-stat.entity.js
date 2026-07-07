export class AnalyticsStat {
  constructor({ id, equipmentId, totalUsageHours, usageCountDaily, estimatedWearLevel }) {
    this.id                 = id;
    this.equipmentId        = equipmentId;
    this.totalUsageHours    = totalUsageHours;
    this.usageCountDaily    = usageCountDaily;
    this.estimatedWearLevel = estimatedWearLevel;
  }
}
