import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { EquipmentEndpoint } from './equipment-endpoint.js';
import { EquipmentAssembler } from './equipment-assembler.js';

export class EquipmentApi extends BaseApi {
  #endpoint;
  #assembler;

  constructor() {
    super();
    this.#assembler = new EquipmentAssembler();
    this.#endpoint  = new EquipmentEndpoint(this);
  }

  async getByAdmin(adminId) {
    const { data } = await this.http.get(`equipment/by-admin/${adminId}`);
    return (Array.isArray(data) ? data : []).map(r => this.#assembler.toEntityFromResource(r));
  }

  getEquipmentById(id)             { return this.#endpoint.getById(id); }
  registerEquipment(entity)        { return this.#endpoint.create(entity); }
  updateEquipment(entity)          { return this.#endpoint.update(entity.id, entity); }
  deleteEquipment(id)              { return this.#endpoint.delete(id); }
}
