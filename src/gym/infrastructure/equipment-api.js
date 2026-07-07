import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { EquipmentEndpoint } from './equipment-endpoint.js';
import { EquipmentAssembler } from './equipment-assembler.js';

export class EquipmentApi extends BaseApi {
  #endpoint;
  #assembler;

  constructor() {
    super();
    this.#endpoint   = new EquipmentEndpoint(this);
    this.#assembler  = new EquipmentAssembler();
  }

  async getByAdmin(adminId) {
    const { data } = await this.http.get(`equipment/by-admin/${adminId}`);
    return (Array.isArray(data) ? data : []).map(r => this.#assembler.toEntityFromResource(r));
  }

  getEquipmentById(id)             { return this.#endpoint.getById(id); }
  registerEquipment(entity)        { return this.#endpoint.create(entity); }
  updateEquipment(entity)          { return this.#endpoint.update(entity.id, entity); }
  deleteEquipment(id)              { return this.#endpoint.delete(id); }

  async getByGymId(gymId) {
    const { data } = await this.http.get(`gyms/${gymId}/equipments`);
    return (Array.isArray(data) ? data : []).map(r => this.#assembler.toEntityFromResource(r));
  }

  async decommissionEquipment(id) {
    await this.http.patch(`equipment/${id}/decomission`);
  }
}
