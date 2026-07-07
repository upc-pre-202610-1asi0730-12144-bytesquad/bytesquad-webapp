import { BaseApi } from '@/shared/infrastructure/base-api.js';

export class ClientGymAssociationApi extends BaseApi {
  async getMyAssociations() {
    const { data } = await this.http.get('profiles/clients/me/gym-associations');
    return Array.isArray(data) ? data : [];
  }

  async associate(gymId) {
    const { data } = await this.http.post('profiles/clients/me/gym-associations', { gymId });
    return data;
  }

  async getAvailableGyms() {
    const { data } = await this.http.get('gyms');
    return Array.isArray(data) ? data.map(g => ({ id: g.id, name: g.name })) : [];
  }
}
