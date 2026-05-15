import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint.js';
import { MaintenanceTicketAssembler } from './maintenance-ticket-assembler.js';

export class MaintenanceTicketEndpoint extends BaseEndpoint {
  constructor(api) {
    super(api, 'maintenance_tickets', new MaintenanceTicketAssembler());
  }
}
