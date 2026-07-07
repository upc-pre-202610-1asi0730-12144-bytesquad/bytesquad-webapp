import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { AlertAssembler } from './alert-assembler.js';

const asm = new AlertAssembler();

export class AlertsApi extends BaseApi {
  async getMine() {
    const { data } = await this.http.get('alerts');
    return (Array.isArray(data) ? data : []).map(r => asm.toEntityFromResource(r));
  }

  async resolve(alertId) {
    const { data } = await this.http.patch(`alerts/${alertId}/resolve`);
    return asm.toEntityFromResource(data);
  }
}
