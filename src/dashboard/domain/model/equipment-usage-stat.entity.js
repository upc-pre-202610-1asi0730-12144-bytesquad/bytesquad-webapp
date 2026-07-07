export class EquipmentUsageStat {
  constructor({ equipmentId, totalUsageHours, reservationCount }) {
    this.equipmentId      = equipmentId;
    this.totalUsageHours  = totalUsageHours;
    this.reservationCount = reservationCount;
  }
}
