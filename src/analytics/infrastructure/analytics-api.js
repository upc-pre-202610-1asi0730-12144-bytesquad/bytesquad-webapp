import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { AnalyticsEndpoint } from './analytics-endpoint.js';

export class AnalyticsApi extends BaseApi {
  #statsEndpoint;

  constructor() {
    super();
    this.#statsEndpoint = new AnalyticsEndpoint(this);
  }

  getUsageStats()  { return this.#statsEndpoint.getAll(); }

  async getEquipments() {
    const { data } = await this.http.get('equipments');
    return Array.isArray(data) ? data : [];
  }
}
