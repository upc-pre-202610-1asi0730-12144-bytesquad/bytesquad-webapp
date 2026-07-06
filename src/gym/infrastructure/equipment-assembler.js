import { Equipment } from '../domain/model/equipment.entity.js';

export class EquipmentAssembler {
  toEntityFromResource(r) {
    return new Equipment({
      id:     r.id,
      name:   r.name,
      model:  r.model,
      zoneId: r.zoneId,
      status: r.status,
    });
  }

  toResourceFromEntity(e) {
    return { name: e.name, zoneId: e.zoneId };
  }
}
