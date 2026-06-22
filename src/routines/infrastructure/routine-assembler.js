import { Routine, ExerciseBlock } from '../domain/model/routine.entity.js';

export class RoutineAssembler {
  toEntityFromResource(r) {
    return new Routine({
      id:                 r.id,
      routineName:        r.routineName,
      clientId:           r.clientId,
      exerciseBlockCount: r.exerciseBlockCount,
    });
  }

  toCreateResource(dto) {
    return { routineName: dto.routineName, clientId: dto.clientId };
  }

  toBlockEntityFromResource(r) {
    return new ExerciseBlock({
      id:           r.id,
      exerciseName: r.exerciseName,
      exerciseType: r.exerciseType,
      order:        r.order,
    });
  }

  toBlockCreateResource(dto) {
    return { exerciseName: dto.exerciseName, exerciseType: dto.exerciseType, order: dto.order };
  }
}
