import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { AnalyticsAssembler } from './analytics-assembler.js';

const asm = new AnalyticsAssembler();

export class AnalyticsApi extends BaseApi {
  async getUsageStatsByAdmin(adminId) {
    const { data } = await this.http.get(`equipment-usage-stats/by-admin/${adminId}`);
    return Array.isArray(data) ? data.map(r => asm.toEntityFromResource(r)) : [];
  }
}
