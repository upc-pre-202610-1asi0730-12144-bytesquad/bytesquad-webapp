import { BaseApi }       from '@/shared/infrastructure/base-api.js';
import { AuthorizedDni } from '../domain/model/authorized-dni.entity.js';

export class AuthorizedDniApi extends BaseApi {
  async getAll(gymId) {
    const { data } = await this.http.get(`gyms/${gymId}/authorized-dnis`);
    return (Array.isArray(data) ? data : []).map(r => new AuthorizedDni(r));
  }

  async add(gymId, dni) {
    const { data } = await this.http.post(`gyms/${gymId}/authorized-dnis`, { dni });
    return new AuthorizedDni(data);
  }

  async remove(gymId, dni) {
    await this.http.delete(`gyms/${gymId}/authorized-dnis/${dni}`);
  }
}
