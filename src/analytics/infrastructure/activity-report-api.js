import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { ActivityReportAssembler } from './activity-report-assembler.js';

const asm = new ActivityReportAssembler();

export class ActivityReportApi extends BaseApi {
  async create(totalUsageTime, downtimeCost, percentageComparison) {
    const { data } = await this.http.post('activity-reports', { totalUsageTime, downtimeCost, percentageComparison });
    return asm.toEntityFromResource(data);
  }

  async updateUsageTime(activityReportId, totalUsageTime) {
    const { data } = await this.http.post('activity-reports/total-usage-time', { activityReportId, totalUsageTime });
    return asm.toEntityFromResource(data);
  }

  async updateDowntimeCost(activityReportId, downtimeCost) {
    const { data } = await this.http.post('activity-reports/downtime-cost', { activityReportId, downtimeCost });
    return asm.toEntityFromResource(data);
  }

  async updatePercentageComparison(activityReportId, percentageComparison) {
    const { data } = await this.http.post('activity-reports/percentage-comparison', { activityReportId, percentageComparison });
    return asm.toEntityFromResource(data);
  }

  async getByAdmin(adminId) {
    const { data } = await this.http.get(`activity-reports/by-admin/${adminId}`);
    return Array.isArray(data) ? data.map(r => asm.toEntityFromResource(r)) : [];
  }
}
