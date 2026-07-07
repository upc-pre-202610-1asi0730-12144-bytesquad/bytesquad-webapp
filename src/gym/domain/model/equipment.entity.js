export const EquipmentStatus = Object.freeze({
  AVAILABLE:      'AVAILABLE',
  OPERATIONAL:    'OPERATIONAL',
  MAINTENANCE:    'MAINTENANCE',
  OUT_OF_ORDER:   'OUT_OF_ORDER',
  DECOMMISSIONED: 'Decommissioned',
});

export class Equipment {
  constructor({ id, name, zoneId, status, brand, model, purchasePrice }) {
    this.id            = id;
    this.name          = name;
    this.zoneId        = zoneId;
    this.status        = status;
    this.brand         = brand;
    this.model         = model;
    this.purchasePrice = purchasePrice ?? null;
  }
}
