import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { IotEndpoint } from './iot-endpoint.js';

export class IotApi extends BaseApi {
  #endpoint;

  constructor() {
    super();
    this.#endpoint = new IotEndpoint(this);
  }

  getDevices()              { return this.#endpoint.getAll(); }
  getDeviceById(id)         { return this.#endpoint.getById(id); }
  registerDevice(entity)    { return this.#endpoint.create(entity); }
  updateDevice(entity)      { return this.#endpoint.update(entity.id, entity); }
  deleteDevice(id)          { return this.#endpoint.delete(id); }
}
