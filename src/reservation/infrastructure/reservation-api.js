import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { ReservationEndpoint } from './reservation-endpoint.js';

export class ReservationApi extends BaseApi {
  #endpoint;

  constructor() {
    super();
    this.#endpoint = new ReservationEndpoint(this);
  }

  getAll()          { return this.#endpoint.getAll(); }
  create(entity)    { return this.#endpoint.create(entity); }
  cancel(id)        { return this.#endpoint.delete(id); }
}
