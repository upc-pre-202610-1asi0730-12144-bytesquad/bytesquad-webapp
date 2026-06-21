import { MaintenanceQuote } from '../domain/model/maintenance-quote.entity.js';

export class MaintenanceQuoteAssembler {
  toEntityFromResource(r) {
    return new MaintenanceQuote({
      id:                    r.id,
      maintenanceQuoteId:    r.maintenanceQuoteId,
      correctiveActionsCost: r.correctiveActionsCost,
      sparePartsCost:        r.sparePartsCost,
      preventiveCost:        r.preventiveCost,
      totalMaintenanceCost:  r.totalMaintenanceCost,
    });
  }
}
