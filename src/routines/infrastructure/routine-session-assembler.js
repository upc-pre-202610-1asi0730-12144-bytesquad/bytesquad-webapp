import { RoutineSession } from '../domain/model/routine-session.entity.js';

export class RoutineSessionAssembler {
  toEntityFromResource(r) {
    return new RoutineSession({
      id:        r.id,
      routineId: r.routineId,
      clientId:  r.clientId,
      status:    r.status,
      startedAt: r.startedAt,
    });
  }

  toCreateResource(dto) {
    return { routineId: dto.routineId, clientId: dto.clientId };
  }
}
