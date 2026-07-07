export const RoutineSessionStatus = Object.freeze({
  Started:   'Started',
  Completed: 'Completed',
  Missed:    'Missed',
});

export class RoutineSession {
  constructor({ id, routineId, clientId, status, startedAt, completedExerciseBlockIds }) {
    this.id        = id;
    this.routineId = routineId;
    this.clientId  = clientId;
    this.status    = status;
    this.startedAt = startedAt; // ISO string
    this.completedExerciseBlockIds = completedExerciseBlockIds ?? [];
  }

  isBlockCompleted(exerciseBlockId) {
    return this.completedExerciseBlockIds.includes(exerciseBlockId);
  }
}
