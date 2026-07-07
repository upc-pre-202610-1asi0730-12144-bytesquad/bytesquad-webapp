import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { AnomalyAssembler } from './anomaly-assembler.js';

const asm = new AnomalyAssembler();

export class AnomalyApi extends BaseApi {
  async reportAnomaly(resource) {
    const { data } = await this.http.post('anomalies', asm.toCreateResource(resource));
    return asm.toEntityFromResource(data);
  }
}
