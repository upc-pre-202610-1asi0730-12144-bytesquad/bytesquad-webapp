import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { FinancialEndpoint } from './financial-endpoint.js';

export class FinancialApi extends BaseApi {
  #endpoint;

  constructor() {
    super();
    this.#endpoint = new FinancialEndpoint(this);
  }

  getUsageStats()  { return this.#endpoint.getAll(); }

  async getEquipments() {
    const { data } = await this.http.get('equipments');
    return Array.isArray(data) ? data : [];
  }
}
