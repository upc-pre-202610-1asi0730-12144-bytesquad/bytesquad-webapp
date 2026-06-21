export const MaintenanceJobStatus = Object.freeze({
  Accepted: 'Accepted',
  InProgress: 'InProgress',
  Completed: 'Completed',
});

export class MaintenanceJob {
  constructor({ id, technicalTicketId, technicianId, status }) {
    this.id = id;
    this.technicalTicketId = technicalTicketId;
    this.technicianId = technicianId;
    this.status = status;
  }
}
