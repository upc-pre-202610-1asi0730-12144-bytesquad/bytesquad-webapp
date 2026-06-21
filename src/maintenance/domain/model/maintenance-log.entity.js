export class MaintenanceLog {
  constructor({ id, technicalTicketId, equipmentId, completedByAdminId, completedAt, notes }) {
    this.id = id;
    this.technicalTicketId = technicalTicketId;
    this.equipmentId = equipmentId;
    this.completedByAdminId = completedByAdminId;
    this.completedAt = completedAt;
    this.notes = notes ?? '';
  }
}
