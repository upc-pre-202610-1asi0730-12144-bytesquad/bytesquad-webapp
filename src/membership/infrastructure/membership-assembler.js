import { Membership } from '../domain/model/membership.entity.js';

export class MembershipAssembler {
  toEntityFromResource(r) {
    return new Membership({
      id:                   r.id,
      clientId:             r.clientId,
      plan:                 r.plan,
      startDate:            r.startDate,
      endDate:              r.endDate,
      status:               r.status,
      pendingDowngradePlan: r.pendingDowngradePlan ?? null,
    });
  }

  toResourceFromEntity(e) {
    return { clientId: e.clientId, plan: e.plan, startDate: e.startDate, endDate: e.endDate };
  }
}
