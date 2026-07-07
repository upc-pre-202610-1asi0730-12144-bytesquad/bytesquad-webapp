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

  toCreateResource(resource) {
    return { routineName: resource.routineName };
  }

  toBlockEntityFromResource(r) {
    return new ExerciseBlock({
      id:           r.id,
      exerciseName: r.exerciseName,
      exerciseType: r.exerciseType,
      order:        r.order,
      sets:         r.sets,
      reps:         r.reps,
    });
  }

  toBlockCreateResource(resource) {
    return {
      exerciseName: resource.exerciseName, exerciseType: resource.exerciseType,
      order: resource.order, sets: resource.sets, reps: resource.reps,
    };
  }
}
