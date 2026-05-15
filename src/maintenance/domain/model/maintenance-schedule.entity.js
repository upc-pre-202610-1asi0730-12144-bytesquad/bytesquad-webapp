export const TaskType       = Object.freeze({ PREVENTIVE: 'PREVENTIVE', LUBRICATION: 'LUBRICATION', INSPECTION: 'INSPECTION', OVERHAUL: 'OVERHAUL' });
export const ScheduleStatus = Object.freeze({ PENDING: 'PENDING', CONFIRMED: 'CONFIRMED', CANCELLED: 'CANCELLED' });

export class MaintenanceSchedule {
  constructor({ id, equipmentId, scheduledDate, scheduledTime, taskType, notes, status }) {
    this.id            = id;
    this.equipmentId   = equipmentId;
    this.scheduledDate = scheduledDate;
    this.scheduledTime = scheduledTime ?? '10:00';
    this.taskType      = taskType;
    this.notes         = notes         ?? '';
    this.status        = status        ?? ScheduleStatus.PENDING;
  }
}
