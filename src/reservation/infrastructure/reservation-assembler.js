import { Reservation, ReservationStatus } from '../domain/model/reservation.entity.js';

export class ReservationAssembler {
  toEntityFromResource(r) {
    return new Reservation({
      id:              r.id,
      machineId:       r.machine_id,
      durationSeconds: r.duration_seconds,
      status:          r.status,
      createdAt:       new Date(r.created_at),
    });
  }

  toResourceFromEntity(e) {
    return {
      id:               e.id,
      machine_id:       e.machineId,
      duration_seconds: e.durationSeconds,
      status:           e.status,
      created_at:       e.createdAt.toISOString(),
    };
  }
}
