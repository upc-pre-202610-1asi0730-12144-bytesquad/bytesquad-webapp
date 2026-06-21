import { RoiProjection } from '../domain/model/roi-projection.entity.js';

export class RoiProjectionAssembler {
  toEntityFromResource(r) {
    return new RoiProjection({
      id:                    r.id,
      roiProjectionId:       r.roiProjectionId,
      projectedDowntimeCost: r.projectedDowntimeCost,
      projectedEarnings:     r.projectedEarnings,
      roiIndex:              r.roiIndex,
      demandStatus:          r.demandStatus,
    });
  }
}
