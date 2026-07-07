export class Anomaly {
  constructor({ id, reservationId, equipmentId, zoneId, anomalyDescription, emissionDate }) {
    this.id = id;
    this.reservationId = reservationId;
    this.equipmentId = equipmentId;
    this.zoneId = zoneId;
    this.anomalyDescription = anomalyDescription;
    this.emissionDate = emissionDate;
  }
}
