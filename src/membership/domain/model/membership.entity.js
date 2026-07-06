export const MembershipPlan = Object.freeze({
  Basic:    'Basic',
  Mid:      'Mid',
  Premium:  'Premium',
});

export const MembershipStatus = Object.freeze({
  Active:    'Active',
  Suspended: 'Suspended',
  Cancelled: 'Cancelled',
  Expired:   'Expired',
});

export class Membership {
  constructor({ id, clientId, plan, startDate, endDate, status }) {
    this.id        = id;
    this.clientId  = clientId;
    this.plan      = plan;
    this.startDate = startDate; // ISO string
    this.endDate   = endDate;   // ISO string
    this.status    = status;
  }
}
