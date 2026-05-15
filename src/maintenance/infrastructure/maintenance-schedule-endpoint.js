import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint.js';
import { MaintenanceScheduleAssembler } from './maintenance-schedule-assembler.js';

export class MaintenanceScheduleEndpoint extends BaseEndpoint {
  constructor(api) {
    super(api, 'maintenance_schedules', new MaintenanceScheduleAssembler());
  }
}
