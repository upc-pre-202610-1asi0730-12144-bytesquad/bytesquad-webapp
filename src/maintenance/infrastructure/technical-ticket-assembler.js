import { MaintenanceTicket } from '../domain/model/maintenance-ticket.entity.js';

export class MaintenanceTicketAssembler {
  toEntityFromResource(r) {
    return new MaintenanceTicket({
      id:          r.id,
      equipmentId: r.equipment_id,
      status:      r.status,
      priority:    r.priority,
      type:        r.type,
      createdAt:   r.created_at,
      description: r.description,
      assignee:    r.assignee    ?? '',
      completedBy: r.completed_by ?? '',
    });
  }

  toResourceFromEntity(e) {
    return {
      id:           e.id,
      equipment_id: e.equipmentId,
      status:       e.status,
      priority:     e.priority,
      type:         e.type,
      created_at:   e.createdAt,
      description:  e.description,
      assignee:     e.assignee,
      completed_by: e.completedBy,
    };
  }
}
