import { Reservation } from '../domain/model/reservation.entity.js';

export class ReservationAssembler {
  toEntityFromResource(r) {
    return new Reservation({
      id:          r.id,
      clientId:    r.clientId,
      equipmentId: r.equipmentId,
      startDate:   r.startDate,
      endDate:     r.endDate,
      status:      r.status,
    });
  }

  toResourceFromEntity(e) {
    return {
      clientId:    e.clientId,
      equipmentId: e.equipmentId,
      startDate:   e.startDate,
      endDate:     e.endDate,
    };
  }
}
