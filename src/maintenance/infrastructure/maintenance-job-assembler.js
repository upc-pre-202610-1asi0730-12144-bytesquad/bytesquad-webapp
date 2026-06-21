import { MaintenanceJob } from '../domain/model/maintenance-job.entity.js';

export class MaintenanceJobAssembler {
  toEntityFromResource(r) {
    return new MaintenanceJob({
      id: r.id, technicalTicketId: r.technicalTicketId,
      technicianId: r.technicianId, status: r.status,
    });
  }

  toResourceFromEntity(e) {
    return { technicalTicketId: e.technicalTicketId, technicianId: e.technicianId };
  }
}
