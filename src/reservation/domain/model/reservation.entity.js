export const ReservationStatus = Object.freeze({ ACTIVE: 'ACTIVE', CANCELLED: 'CANCELLED', EXPIRED: 'EXPIRED' });

export class Reservation {
  constructor({ id, machineId, durationSeconds, status, createdAt }) {
    this.id              = id;
    this.machineId       = machineId;
    this.durationSeconds = durationSeconds;
    this.status          = status;
    this.createdAt       = createdAt instanceof Date ? createdAt : new Date(createdAt);
  }
}
