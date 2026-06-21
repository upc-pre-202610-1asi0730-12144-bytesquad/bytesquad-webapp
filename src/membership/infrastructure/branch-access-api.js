import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { BranchAccessAssembler } from './branch-access-assembler.js';

const assembler = new BranchAccessAssembler();

export class BranchAccessApi extends BaseApi {
  async grant(membershipId, branchId, grantedByAdminId) {
    const { data } = await this.http.post('branch-accesses/grant', { membershipId, branchId, grantedByAdminId });
    return assembler.toEntityFromResource(data);
  }
}
