import { Alert } from '../domain/model/alert.entity.js';

export class AlertAssembler {
  toEntityFromResource(r) {
    return new Alert({
      id:          r.id,
      adminId:     r.adminId,
      equipmentId: r.equipmentId,
      severity:    r.severity,
      message:     r.message,
      resolved:    r.resolved,
      createdAt:   r.createdAt,
    });
  }
}
