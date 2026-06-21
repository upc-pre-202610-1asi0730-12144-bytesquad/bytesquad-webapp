import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { ReservationAssembler } from './reservation-assembler.js';

const asm = new ReservationAssembler();

export class ReservationApi extends BaseApi {
  async expressCreate(clientId, equipmentId, startDate, endDate) {
    const { data } = await this.http.post('reservations/express', { clientId, equipmentId, startDate, endDate });
    return asm.toEntityFromResource(data);
  }

  async getById(id) {
    const { data } = await this.http.get(`reservations/${id}`);
    return asm.toEntityFromResource(data);
  }

  async getByClient(clientId) {
    const { data } = await this.http.get(`reservations/by-client/${clientId}`);
    return Array.isArray(data) ? data.map(r => asm.toEntityFromResource(r)) : [];
  }

  async getByEquipment(equipmentId) {
    const { data } = await this.http.get(`reservations/by-equipment/${equipmentId}`);
    return Array.isArray(data) ? data.map(r => asm.toEntityFromResource(r)) : [];
  }

  async submitRequest(id) {
    const { data } = await this.http.post(`reservations/${id}/submit-request`);
    return asm.toEntityFromResource(data);
  }

  async requestEquipmentAvailable(id) {
    const { data } = await this.http.post(`reservations/${id}/request-equipment-available`);
    return asm.toEntityFromResource(data);
  }

  async startTimer(id) {
    const { data } = await this.http.post(`reservations/${id}/start-timer`);
    return asm.toEntityFromResource(data);
  }

  async end(id) {
    const { data } = await this.http.post(`reservations/${id}/end`);
    return asm.toEntityFromResource(data);
  }

  async cancel(id) {
    const { data } = await this.http.delete(`reservations/${id}/cancel`);
    return asm.toEntityFromResource(data);
  }
}
