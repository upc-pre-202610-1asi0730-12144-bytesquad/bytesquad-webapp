import { Equipment } from '../domain/model/equipment.entity.js';

export class EquipmentAssembler {
  toEntityFromResource(r) {
    return new Equipment({
      id:            r.id,
      name:          r.name,
      zoneId:        r.zoneId,
      status:        r.status,
      purchasePrice: r.purchasePrice ?? null,
    });
  }

  toResourceFromEntity(e) {
    return { name: e.name, zoneId: e.zoneId, purchasePrice: e.purchasePrice ?? null };
  }
}
