import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { MembershipAssembler } from './membership-assembler.js';

const assembler = new MembershipAssembler();

export class MembershipApi extends BaseApi {
  async activate(clientId, plan, startDate, endDate) {
    const { data } = await this.http.post('memberships/activate', { clientId, plan, startDate, endDate });
    return assembler.toEntityFromResource(data);
  }

  async getById(id) {
    const { data } = await this.http.get(`memberships/${id}`);
    return assembler.toEntityFromResource(data);
  }

  async getByClient(clientId) {
    const { data } = await this.http.get(`memberships/by-client/${clientId}`);
    return (Array.isArray(data) ? data : []).map(r => assembler.toEntityFromResource(r));
  }

  async updatePlan(id, newPlan) {
    const { data } = await this.http.put(`memberships/${id}/plan`, { newPlan });
    return assembler.toEntityFromResource(data);
  }

  async suspend(id) {
    const { data } = await this.http.post(`memberships/${id}/suspend`);
    return assembler.toEntityFromResource(data);
  }

  async renew(id, newEndDate) {
    const { data } = await this.http.post(`memberships/${id}/renew`, { newEndDate });
    return assembler.toEntityFromResource(data);
  }

  async cancel(id) {
    const { data } = await this.http.delete(`memberships/${id}/cancel`);
    return assembler.toEntityFromResource(data);
  }

  async downgrade(id, newPlan) {
    const { data } = await this.http.put(`memberships/${id}/plan/downgrade`, { newPlan });
    return assembler.toEntityFromResource(data);
  }
}
