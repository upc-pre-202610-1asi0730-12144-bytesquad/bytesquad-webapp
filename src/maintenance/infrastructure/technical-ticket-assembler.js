import { TechnicalTicket } from '../domain/model/technical-ticket.entity.js';

export class TechnicalTicketAssembler {
  toEntityFromResource(r) {
    return new TechnicalTicket({
      id: r.id, maintenanceId: r.maintenanceId, equipmentId: r.equipmentId,
      status: r.status, maintenanceProgress: r.maintenanceProgress,
      assignedTechnicianId: r.assignedTechnicianId, description: r.description,
    });
  }

  toResourceFromEntity(e) {
    return { maintenanceId: e.maintenanceId, equipmentId: e.equipmentId, description: e.description };
  }
}
