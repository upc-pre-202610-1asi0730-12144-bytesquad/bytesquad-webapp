import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { MaintenanceAssembler }      from './maintenance-assembler.js';
import { MaintenanceJobAssembler }   from './maintenance-job-assembler.js';
import { MaintenanceLogAssembler }   from './maintenance-log-assembler.js';
import { TechnicalTicketAssembler }  from './technical-ticket-assembler.js';

const maintenanceAssembler = new MaintenanceAssembler();
const jobAssembler         = new MaintenanceJobAssembler();
const logAssembler         = new MaintenanceLogAssembler();
const ticketAssembler      = new TechnicalTicketAssembler();

export class MaintenanceApi extends BaseApi {
  // ── Maintenance aggregate ──────────────────────────────────────────────────
  async getMaintenancesByEquipment(equipmentId) {
    const { data } = await this.http.get(`maintenances/by-equipment/${equipmentId}`);
    return (Array.isArray(data) ? data : []).map(r => maintenanceAssembler.toEntityFromResource(r));
  }

  async requestMaintenance(dto) {
    const { data } = await this.http.post('maintenances/request', maintenanceAssembler.toResourceFromEntity(dto));
    return maintenanceAssembler.toEntityFromResource(data);
  }

  // ── MaintenanceJob aggregate ───────────────────────────────────────────────
  async acceptJob(dto) {
    const { data } = await this.http.post('maintenance-jobs/accept', jobAssembler.toResourceFromEntity(dto));
    return jobAssembler.toEntityFromResource(data);
  }

  // ── MaintenanceLog aggregate ───────────────────────────────────────────────
  async createLog(dto) {
    const { data } = await this.http.post('maintenance-logs', logAssembler.toResourceFromEntity(dto));
    return logAssembler.toEntityFromResource(data);
  }

  // ── TechnicalTicket aggregate ──────────────────────────────────────────────
  async getTicketById(id) {
    const { data } = await this.http.get(`technical-tickets/${id}`);
    return ticketAssembler.toEntityFromResource(data);
  }

  async createTicket(dto) {
    const { data } = await this.http.post('technical-tickets', ticketAssembler.toResourceFromEntity(dto));
    return ticketAssembler.toEntityFromResource(data);
  }

  async updateTicketStatus(id, status) {
    const { data } = await this.http.put(`technical-tickets/${id}/status`, { newStatus: status });
    return ticketAssembler.toEntityFromResource(data);
  }

  async updateTicketMaintenanceProgress(id, prog) {
    const { data } = await this.http.put(`technical-tickets/${id}/maintenance-status`, { newProgress: prog });
    return ticketAssembler.toEntityFromResource(data);
  }

  async assignTicket(id, technicianId) {
    const { data } = await this.http.post(`technical-tickets/${id}/assign`, { technicianId });
    return ticketAssembler.toEntityFromResource(data);
  }

  async requestStatusUpdate(id) {
    const { data } = await this.http.post(`technical-tickets/${id}/request-status-update`);
    return ticketAssembler.toEntityFromResource(data);
  }

  async completeTicket(id) {
    const { data } = await this.http.post(`technical-tickets/${id}/complete`);
    return ticketAssembler.toEntityFromResource(data);
  }
}
