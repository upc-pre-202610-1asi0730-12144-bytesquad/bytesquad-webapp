import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { GymEndpoint } from './gym-endpoint.js';
import { BranchAssembler } from './branch-assembler.js';
import { ZoneAssembler } from './zone-assembler.js';
import { EquipmentAssembler } from './equipment-assembler.js';

export class GymApi extends BaseApi {
  #endpoint;
  #branchAssembler;
  #zoneAssembler;
  #equipmentAssembler;

  constructor() {
    super();
    this.#endpoint           = new GymEndpoint(this);
    this.#branchAssembler    = new BranchAssembler();
    this.#zoneAssembler      = new ZoneAssembler();
    this.#equipmentAssembler = new EquipmentAssembler();
  }

  getAllGyms() {
    return this.#endpoint.getAll();
  }

  createGym(entity) {
    return this.#endpoint.create(entity);
  }

  async getGymByAdmin(adminId) {
    const { data } = await this.http.get(`gyms/by-admin/${adminId}`);
    return data;
  }

  async getEquipmentsByGymId(gymId) {
    const { data } = await this.http.get(`gyms/${gymId}/equipments`);
    return (Array.isArray(data) ? data : []).map(r => this.#equipmentAssembler.toEntityFromResource(r));
  }

  async getBranchesByGymId(gymId) {
    const { data } = await this.http.get(`gyms/${gymId}/branches`);
    return (Array.isArray(data) ? data : []).map(r => this.#branchAssembler.toEntityFromResource(r));
  }

  async getZonesByGymId(gymId) {
    const { data } = await this.http.get(`gyms/${gymId}/zones`);
    return (Array.isArray(data) ? data : []).map(r => this.#zoneAssembler.toEntityFromResource(r));
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
