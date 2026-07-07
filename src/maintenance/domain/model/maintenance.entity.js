export const MaintenanceStatus = Object.freeze({
  Requested: 'Requested',
  InProgress: 'InProgress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
});

export class Maintenance {
  constructor({ id, equipmentId, requestedByAdminId, reason, status }) {
    this.id = id;
    this.equipmentId = equipmentId;
    this.requestedByAdminId = requestedByAdminId;
    this.reason = reason;
    this.status = status;
  }
}
