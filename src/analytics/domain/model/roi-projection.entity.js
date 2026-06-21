// demandStatus is UPPER_SNAKE string from backend: UNDER_REVIEW | HIGH_DEMAND | STABLE_DEMAND
export class RoiProjection {
  constructor({ id, roiProjectionId, projectedDowntimeCost, projectedEarnings, roiIndex, demandStatus }) {
    this.id                   = id;
    this.roiProjectionId      = roiProjectionId;
    this.projectedDowntimeCost = projectedDowntimeCost; // double
    this.projectedEarnings    = projectedEarnings;      // double; 0 until /projected-earnings runs
    this.roiIndex             = roiIndex;               // double; 0 until /generate runs
    this.demandStatus         = demandStatus;           // string UPPER_SNAKE
  }
}
