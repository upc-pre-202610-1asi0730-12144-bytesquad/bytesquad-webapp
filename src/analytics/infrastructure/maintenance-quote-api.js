import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { MaintenanceQuoteAssembler } from './maintenance-quote-assembler.js';

const asm = new MaintenanceQuoteAssembler();

export class MaintenanceQuoteApi extends BaseApi {
  async create(correctiveActionsCost) {
    const { data } = await this.http.post('maintenance-quotes', { correctiveActionsCost });
    return asm.toEntityFromResource(data);
  }

  async updateSparePartsCost(maintenanceQuoteId, sparePartsCost) {
    const { data } = await this.http.post('maintenance-quotes/spare-parts-cost', { maintenanceQuoteId, sparePartsCost });
    return asm.toEntityFromResource(data);
  }

  async updatePreventiveCost(maintenanceQuoteId, preventiveCost) {
    const { data } = await this.http.post('maintenance-quotes/preventive-cost', { maintenanceQuoteId, preventiveCost });
    return asm.toEntityFromResource(data);
  }

  async consolidateTotal(maintenanceQuoteId) {
    const { data } = await this.http.post('maintenance-quotes/total-cost', { maintenanceQuoteId });
    return asm.toEntityFromResource(data);
  }
}
