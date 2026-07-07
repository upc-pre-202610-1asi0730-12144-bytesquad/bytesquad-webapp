export const ExerciseType = Object.freeze({
  Cardio:      'Cardio',
  Strength:    'Strength',
  Flexibility: 'Flexibility',
});

export class ExerciseBlock {
  constructor({ id, exerciseName, exerciseType, order, sets, reps }) {
    this.id           = id;
    this.exerciseName = exerciseName;
    this.exerciseType = exerciseType;
    this.order        = order;
    this.sets         = sets;
    this.reps         = reps;
  }
}

export class Routine {
  constructor({ id, routineName, clientId, exerciseBlockCount }) {
    this.id                 = id;
    this.routineName        = routineName;
    this.clientId           = clientId;
    this.exerciseBlockCount = exerciseBlockCount;
  }
}
