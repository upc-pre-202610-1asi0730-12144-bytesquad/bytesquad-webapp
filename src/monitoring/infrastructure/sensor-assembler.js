import { Sensor } from '../domain/model/sensor.entity.js';

export class SensorAssembler {
  toEntityFromResource(r) {
    return new Sensor({
      id:           r.id,
      type:         r.type,
      identifier:   r.identifier,
      adminId:      r.adminId,
      equipmentId:  r.equipmentId ?? null,
      registeredAt: r.registeredAt,
      captureCount: r.captureCount ?? 0,
    });
  }
}
