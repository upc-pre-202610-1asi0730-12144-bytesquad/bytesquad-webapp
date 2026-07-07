import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { AdminProfileAssembler } from './admin-profile-assembler.js';
import { ClientProfileAssembler } from './client-profile-assembler.js';

const adminAssembler  = new AdminProfileAssembler();
const clientAssembler = new ClientProfileAssembler();

export class ProfilesApi extends BaseApi {
  async getAdmins() {
    const { data } = await this.http.get('profiles/admins');
    return (Array.isArray(data) ? data : []).map(r => adminAssembler.toEntityFromResource(r));
  }

  async getMyAdminProfile() {
    const { data } = await this.http.get('profiles/admins/me');
    return adminAssembler.toEntityFromResource(data);
  }

  async getAdminById(id) {
    const { data } = await this.http.get(`profiles/admins/${id}`);
    return adminAssembler.toEntityFromResource(data);
  }

  async createAdmin(dto) {
    const { data } = await this.http.post('profiles/admins', adminAssembler.toCreateResource(dto));
    return adminAssembler.toEntityFromResource(data);
  }

  async updateAdmin(id, dto) {
    const { data } = await this.http.put(`profiles/admins/${id}`, adminAssembler.toUpdateResource(dto));
    return adminAssembler.toEntityFromResource(data);
  }

  async getMyClientProfile() {
    const { data } = await this.http.get('profiles/clients/me');
    return clientAssembler.toEntityFromResource(data);
  }

  async getClients() {
    const { data } = await this.http.get('profiles/clients');
    return (Array.isArray(data) ? data : []).map(r => clientAssembler.toEntityFromResource(r));
  }

  async getClientById(id) {
    const { data } = await this.http.get(`profiles/clients/${id}`);
    return clientAssembler.toEntityFromResource(data);
  }

  async createClient(dto) {
    const { data } = await this.http.post('profiles/clients', clientAssembler.toCreateResource(dto));
    return clientAssembler.toEntityFromResource(data);
  }

  async updateClient(id, dto) {
    const { data } = await this.http.put(`profiles/clients/${id}`, clientAssembler.toUpdateResource(dto));
    return clientAssembler.toEntityFromResource(data);
  }

  async updateMyClientProfile(dto) {
    const { data } = await this.http.put('profiles/clients/me', clientAssembler.toUpdateResource(dto));
    return clientAssembler.toEntityFromResource(data);
  }
}
