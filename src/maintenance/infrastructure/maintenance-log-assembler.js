import { MaintenanceLog } from '../domain/model/maintenance-log.entity.js';

export class MaintenanceLogAssembler {
  toEntityFromResource(r) {
    return new MaintenanceLog({
      id: r.id, technicalTicketId: r.technicalTicketId, equipmentId: r.equipmentId,
      completedByAdminId: r.completedByAdminId, completedAt: r.completedAt, notes: r.notes,
    });
  }

  toResourceFromEntity(e) {
    return { technicalTicketId: e.technicalTicketId, completedByAdminId: e.completedByAdminId, notes: e.notes };
  }
}
