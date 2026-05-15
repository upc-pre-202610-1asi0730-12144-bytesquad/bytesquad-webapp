import { Equipment } from '../../../../../Downloads/integrante#5-Jesus/integrante#5-Jesus/commit#2/equipment/domain/model/equipment.entity.js';

export class EquipmentAssembler {
  toEntityFromResource(r) {
    return new Equipment({
      id:            r.id,
      zoneId:        r.zone_id,
      name:          r.name,
      brand:         r.brand,
      model:         r.model,
      purchasePrice: r.purchase_price,
      status:        r.status,
    });
  }

  toResourceFromEntity(e) {
    return {
      id:             e.id,
      zone_id:        e.zoneId,
      name:           e.name,
      brand:          e.brand,
      model:          e.model,
      purchase_price: e.purchasePrice,
      status:         e.status,
    };
  }
}
