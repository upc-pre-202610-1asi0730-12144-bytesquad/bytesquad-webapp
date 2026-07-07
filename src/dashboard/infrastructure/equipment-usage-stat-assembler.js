import { EquipmentUsageStat } from '../domain/model/equipment-usage-stat.entity.js';

export class EquipmentUsageStatAssembler {
  toEntityFromResource(r) {
    return new EquipmentUsageStat({
      equipmentId:      r.equipmentId,
      totalUsageHours:  r.totalUsageHours,
      reservationCount: r.reservationCount,
    });
  }
}
