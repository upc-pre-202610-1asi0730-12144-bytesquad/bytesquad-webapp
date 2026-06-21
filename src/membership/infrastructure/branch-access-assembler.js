import { BranchAccess } from '../domain/model/branch-access.entity.js';

export class BranchAccessAssembler {
  toEntityFromResource(r) {
    return new BranchAccess({
      id:               r.id,
      membershipId:     r.membershipId,
      branchId:         r.branchId,
      status:           r.status,
      grantedByAdminId: r.grantedByAdminId,
    });
  }

  toResourceFromEntity(e) {
    return { membershipId: e.membershipId, branchId: e.branchId, grantedByAdminId: e.grantedByAdminId };
  }
}
