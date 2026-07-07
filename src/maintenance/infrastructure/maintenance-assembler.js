import { Maintenance } from '../domain/model/maintenance.entity.js';

export class MaintenanceAssembler {
  toEntityFromResource(r) {
    return new Maintenance({
      id: r.id, equipmentId: r.equipmentId,
      requestedByAdminId: r.requestedByAdminId,
      reason: r.reason, status: r.status, priority: r.priority, type: r.type,
    });
  }

  toResourceFromEntity(e) {
    return { equipmentId: e.equipmentId, requestedByAdminId: e.requestedByAdminId,
             reason: e.reason, priority: e.priority, type: e.type };
  }
}
