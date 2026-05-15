import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { EquipmentUsageStatEndpoint } from './equipment-usage-stat-endpoint.js';

export class DashboardApi extends BaseApi {
  #statsEndpoint;

  constructor() {
    super();
    this.#statsEndpoint = new EquipmentUsageStatEndpoint(this);
  }

  getEquipmentUsageStats() { return this.#statsEndpoint.getAll(); }

  async getUsageSessions() {
    const { data } = await this.http.get('usage_sessions');
    return Array.isArray(data) ? data : [];
  }
}
