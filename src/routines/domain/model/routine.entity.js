export const ExerciseType = Object.freeze({
  Cardio:      'Cardio',
  Strength:    'Strength',
  Flexibility: 'Flexibility',
});

export class ExerciseBlock {
  constructor({ id, exerciseName, exerciseType, order }) {
    this.id           = id;
    this.exerciseName = exerciseName;
    this.exerciseType = exerciseType;
    this.order        = order;
  }
}

export class Routine {
  constructor({ id, routineName, clientId, exerciseBlockCount }) {
    this.id                 = id;
    this.routineName        = routineName;
    this.clientId           = clientId;
    this.exerciseBlockCount = exerciseBlockCount;
    // TODO: exercise blocks are write-only from backend; accumulated locally after POST /exercise-blocks
    this.exerciseBlocks     = [];
  }
}
