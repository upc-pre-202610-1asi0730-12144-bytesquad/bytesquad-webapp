export class Anomaly {
  constructor({ id, sensorId, adminId, anomalyType, description, detectedAt }) {
    this.id          = id;
    this.sensorId    = sensorId;
    this.adminId     = adminId;
    this.anomalyType = anomalyType;
    this.description = description;
    this.detectedAt  = detectedAt;
  }
}
