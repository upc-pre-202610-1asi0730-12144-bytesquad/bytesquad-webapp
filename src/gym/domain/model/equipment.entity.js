export const EquipmentStatus = Object.freeze({
  AVAILABLE:    'AVAILABLE',
  OPERATIONAL:  'OPERATIONAL',
  MAINTENANCE:  'MAINTENANCE',
  OUT_OF_ORDER: 'OUT_OF_ORDER',
});

export class Equipment {
  constructor({ id, name, zoneId, status,
    brand, model, purchasePrice }) {      // TODO: UI-only, not in API contract
    this.id            = id;
    this.name          = name;
    this.zoneId        = zoneId;
    this.status        = status;
    this.brand         = brand;           // TODO: UI-only
    this.model         = model;           // TODO: UI-only
    this.purchasePrice = purchasePrice;   // TODO: UI-only
  }
}
