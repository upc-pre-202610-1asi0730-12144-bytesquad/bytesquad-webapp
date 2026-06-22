export const BranchAccessStatus = Object.freeze({
  Granted: 'Granted',
  Denied:  'Denied',
});

export class BranchAccess {
  constructor({ id, membershipId, branchId, status, grantedByAdminId }) {
    this.id               = id;
    this.membershipId     = membershipId;
    this.branchId         = branchId;
    this.status           = status;
    this.grantedByAdminId = grantedByAdminId;
  }
}
