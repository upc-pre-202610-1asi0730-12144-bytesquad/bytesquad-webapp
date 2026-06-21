export const TechnicalTicketStatus = Object.freeze({
  Created: 'Created',
  Assigned: 'Assigned',
  InProgress: 'InProgress',
  Resolved: 'Resolved',
});

export const MaintenanceProgress = Object.freeze({
  Pending: 'Pending',
  InProgress: 'InProgress',
  Completed: 'Completed',
});

export class TechnicalTicket {
  constructor({ id, maintenanceId, equipmentId, status, maintenanceProgress, assignedTechnicianId, description }) {
    this.id = id;
    this.maintenanceId = maintenanceId;
    this.equipmentId = equipmentId;
    this.status = status;
    this.maintenanceProgress = maintenanceProgress;
    this.assignedTechnicianId = assignedTechnicianId;
    this.description = description;
  }
}
