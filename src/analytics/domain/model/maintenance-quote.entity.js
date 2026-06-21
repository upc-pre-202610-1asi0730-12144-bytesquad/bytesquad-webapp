export class MaintenanceQuote {
  constructor({ id, maintenanceQuoteId, correctiveActionsCost, sparePartsCost, preventiveCost, totalMaintenanceCost }) {
    this.id                   = id;
    this.maintenanceQuoteId   = maintenanceQuoteId;
    this.correctiveActionsCost = correctiveActionsCost; // double
    this.sparePartsCost       = sparePartsCost;         // double
    this.preventiveCost       = preventiveCost;         // double
    this.totalMaintenanceCost = totalMaintenanceCost;   // double
  }
}
