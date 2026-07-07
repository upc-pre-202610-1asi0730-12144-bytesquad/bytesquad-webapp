import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { GymEndpoint } from './gym-endpoint.js';
import { GymAssembler } from './gym-assembler.js';
import { BranchAssembler } from './branch-assembler.js';
import { ZoneAssembler } from './zone-assembler.js';

export class GymApi extends BaseApi {
  #endpoint;
  #gymAssembler;
  #branchAssembler;
  #zoneAssembler;

  constructor() {
    super();
    this.#endpoint        = new GymEndpoint(this);
    this.#gymAssembler    = new GymAssembler();
    this.#branchAssembler = new BranchAssembler();
    this.#zoneAssembler   = new ZoneAssembler();
  }

  async getByAdmin(adminId) {
    const { data } = await this.http.get(`gyms/by-admin/${adminId}`);
    return this.#gymAssembler.toEntityFromResource(data);
  }

  createGym(entity) {
    return this.#endpoint.create(entity);
  }

  async getBranches(gymId) {
    const { data } = await this.http.get(`gyms/${gymId}/branches`);
    return (Array.isArray(data) ? data : []).map(r => this.#branchAssembler.toEntityFromResource(r));
  }

  async createBranch(gymId, entity) {
    const resource = this.#branchAssembler.toResourceFromEntity(entity);
    const { data } = await this.http.post(`gyms/${gymId}/branches`, resource);
    return this.#branchAssembler.toEntityFromResource(data);
  }

  async getZones(gymId, branchId) {
    const { data } = await this.http.get(`gyms/${gymId}/branches/${branchId}/zones`);
    return (Array.isArray(data) ? data : []).map(r => this.#zoneAssembler.toEntityFromResource(r));
  }

  async createZone(gymId, branchId, entity) {
    const resource = this.#zoneAssembler.toResourceFromEntity(entity);
    const { data } = await this.http.post(`gyms/${gymId}/branches/${branchId}/zones`, resource);
    return this.#zoneAssembler.toEntityFromResource(data);
  }
}
