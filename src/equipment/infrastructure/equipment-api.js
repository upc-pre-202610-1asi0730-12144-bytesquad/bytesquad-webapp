import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { EquipmentEndpoint } from './equipment-endpoint.js';

export class EquipmentApi extends BaseApi {
  #endpoint;

  constructor() {
    super();
    this.#endpoint = new EquipmentEndpoint(this);
  }

  getEquipment()                   { return this.#endpoint.getAll(); }
  getEquipmentById(id)             { return this.#endpoint.getById(id); }
  registerEquipment(entity)        { return this.#endpoint.create(entity); }
  updateEquipment(entity)          { return this.#endpoint.update(entity.id, entity); }
  deleteEquipment(id)              { return this.#endpoint.delete(id); }
}
