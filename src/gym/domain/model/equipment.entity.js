export const EquipmentStatus = Object.freeze({
  OPERATIONAL: 'OPERATIONAL',
  MAINTENANCE:  'MAINTENANCE',
  OUT_OF_ORDER: 'OUT_OF_ORDER',
});

export class Equipment {
  constructor({ id, zoneId, name, brand, model, purchasePrice, status }) {
    this.id            = id;
    this.zoneId        = zoneId;
    this.name          = name;
    this.brand         = brand;
    this.model         = model;
    this.purchasePrice = purchasePrice;
    this.status        = status;
  }
}
