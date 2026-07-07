import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { EquipmentUsageStatAssembler } from './equipment-usage-stat-assembler.js';

const asm = new EquipmentUsageStatAssembler();

export class DashboardApi extends BaseApi {
  async getUsageStatsByAdmin(adminId) {
    const { data } = await this.http.get(`equipment-usage-stats/by-admin/${adminId}`);
    return Array.isArray(data) ? data.map(r => asm.toEntityFromResource(r)) : [];
  }

  async getPeakCapacityByAdmin(adminId) {
    const { data } = await this.http.get(`equipment-usage-stats/peak-capacity/by-admin/${adminId}`);
    return Array.isArray(data) ? data : [];
  }
}
