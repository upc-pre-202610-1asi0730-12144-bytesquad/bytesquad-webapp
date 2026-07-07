import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { AnomalyAssembler } from './anomaly-assembler.js';

const asm = new AnomalyAssembler();

export class AnomalyApi extends BaseApi {
  async getMyAnomalies() {
    const { data } = await this.http.get('anomalies/me');
    return (Array.isArray(data) ? data : []).map(r => asm.toEntityFromResource(r));
  }

  async report(sensorId, anomalyType, description, detectedAt) {
    const { data } = await this.http.post('anomalies', { sensorId, anomalyType, description, detectedAt });
    return asm.toEntityFromResource(data);
  }
}
