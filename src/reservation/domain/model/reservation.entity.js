export const ReservationStatus = Object.freeze({
  Initiated: 'Initiated',
  Reserved: 'Reserved',
  Active: 'Active',
  Ended: 'Ended',
  Cancelled: 'Cancelled',
});

export class Reservation {
  constructor({ id, clientId, equipmentId, startDate, endDate, status }) {
    this.id = id;
    this.clientId = clientId;
    this.equipmentId = equipmentId;
    this.startDate = startDate;  // ISO string
    this.endDate = endDate;      // ISO string
    this.status = status;
  }
}
