import { MaintenanceSchedule } from '../domain/model/maintenance-schedule.entity.js';

export class MaintenanceScheduleAssembler {
  toEntityFromResource(r) {
    return new MaintenanceSchedule({
      id:            r.id,
      equipmentId:   r.equipment_id,
      scheduledDate: r.scheduled_date,
      scheduledTime: r.scheduled_time ?? '10:00',
      taskType:      r.task_type,
      notes:         r.notes ?? '',
      status:        r.status,
    });
  }

  toResourceFromEntity(e) {
    return {
      id:             e.id,
      equipment_id:   e.equipmentId,
      scheduled_date: e.scheduledDate,
      scheduled_time: e.scheduledTime,
      task_type:      e.taskType,
      notes:          e.notes,
      status:         e.status,
    };
  }
}
