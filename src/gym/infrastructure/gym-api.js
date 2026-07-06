import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { GymEndpoint } from './gym-endpoint.js';
import { BranchAssembler } from './branch-assembler.js';
import { ZoneAssembler } from './zone-assembler.js';

export class GymApi extends BaseApi {
  #endpoint;
  #branchAssembler;
  #zoneAssembler;

  constructor() {
    super();
    this.#endpoint        = new GymEndpoint(this);
    this.#branchAssembler = new BranchAssembler();
    this.#zoneAssembler   = new ZoneAssembler();
  }

  getAllGyms() {
    return this.#endpoint.getAll();
  }

  createGym(entity) {
    return this.#endpoint.create(entity);
  }

  async createBranch(gymId, entity) {
    const resource = this.#branchAssembler.toResourceFromEntity(entity);
    const { data } = await this.http.post(`gyms/${gymId}/branches`, resource);
    return this.#branchAssembler.toEntityFromResource(data);
  }

  async createZone(gymId, branchId, entity) {
    const resource = this.#zoneAssembler.toResourceFromEntity(entity);
    const { data } = await this.http.post(`gyms/${gymId}/branches/${branchId}/zones`, resource);
    return this.#zoneAssembler.toEntityFromResource(data);
  }
}
