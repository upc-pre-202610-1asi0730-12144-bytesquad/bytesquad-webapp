export const TicketStatus   = Object.freeze({ OPEN: 'OPEN', IN_PROGRESS: 'IN_PROGRESS', RESOLVED: 'RESOLVED' });
export const TicketPriority = Object.freeze({ LOW: 'LOW', MEDIUM: 'MEDIUM', HIGH: 'HIGH', URGENT: 'URGENT' });
export const TicketType     = Object.freeze({ CORRECTIVE: 'CORRECTIVE', PREVENTIVE: 'PREVENTIVE' });

export class MaintenanceTicket {
  constructor({ id, equipmentId, status, priority, type, createdAt, description, assignee, completedBy }) {
    this.id          = id;
    this.equipmentId = equipmentId;
    this.status      = status;
    this.priority    = priority;
    this.type        = type;
    this.createdAt   = createdAt;
    this.description = description;
    this.assignee    = assignee    ?? '';
    this.completedBy = completedBy ?? '';
  }
}
