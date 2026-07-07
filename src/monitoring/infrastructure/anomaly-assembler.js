import { Anomaly } from '../domain/model/anomaly.entity.js';

export class AnomalyAssembler {
  toEntityFromResource(r) {
    return new Anomaly({
      id:          r.id,
      sensorId:    r.sensorId,
      adminId:     r.adminId,
      anomalyType: r.anomalyType,
      description: r.description,
      detectedAt:  r.detectedAt,
    });
  }
}
