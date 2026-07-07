import { Anomaly } from '../domain/model/anomaly.entity.js';

export class AnomalyAssembler {
  toEntityFromResource(r) {
    return new Anomaly({
      id: r.id,
      reservationId: r.reservationId,
      equipmentId: r.equipmentId,
      zoneId: r.zoneId,
      anomalyDescription: r.anomalyDescription,
      emissionDate: r.emissionDate,
    });
  }

  toCreateResource(resource) {
    return {
      reservationId: resource.reservationId,
      equipmentId: resource.equipmentId,
      zoneId: resource.zoneId,
      anomalyDescription: resource.anomalyDescription,
    };
  }
}
