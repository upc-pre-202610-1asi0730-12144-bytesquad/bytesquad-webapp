import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { RoiProjectionAssembler } from './roi-projection-assembler.js';

const asm = new RoiProjectionAssembler();

export class RoiProjectionApi extends BaseApi {
  async create(projectedDowntimeCost) {
    const { data } = await this.http.post('roi-projections', { projectedDowntimeCost });
    return asm.toEntityFromResource(data);
  }

  async updateProjectedEarnings(roiProjectionId, projectedEarnings) {
    const { data } = await this.http.post('roi-projections/projected-earnings', { roiProjectionId, projectedEarnings });
    return asm.toEntityFromResource(data);
  }

  async generate(roiProjectionId) {
    const { data } = await this.http.post('roi-projections/generate', { roiProjectionId });
    return asm.toEntityFromResource(data);
  }

  async getByAdmin(adminId) {
    const { data } = await this.http.get(`roi-projections/by-admin/${adminId}`);
    return Array.isArray(data) ? data.map(r => asm.toEntityFromResource(r)) : [];
  }
}
