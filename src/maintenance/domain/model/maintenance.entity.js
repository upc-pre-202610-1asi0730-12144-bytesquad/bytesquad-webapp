export const MaintenancePriority = Object.freeze({
  Low:    'Low',
  Medium: 'Medium',
  High:   'High',
});

export const MaintenanceType = Object.freeze({
  Corrective: 'Corrective',
  Preventive: 'Preventive',
});

export const MaintenanceStatus = Object.freeze({
  Requested: 'Requested',
  InProgress: 'InProgress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
});

export class Maintenance {
  constructor({ id, equipmentId, requestedByAdminId, reason, status, priority, type }) {
    this.id = id;
    this.equipmentId = equipmentId;
    this.requestedByAdminId = requestedByAdminId;
    this.reason = reason;
    this.status = status;
    this.priority = priority;
    this.type = type;
  }
}
