export const RoutineSessionStatus = Object.freeze({
  Started:   'Started',
  Completed: 'Completed',
  Missed:    'Missed',
});

export class RoutineSession {
  constructor({ id, routineId, clientId, status, startedAt }) {
    this.id        = id;
    this.routineId = routineId;
    this.clientId  = clientId;
    this.status    = status;
    this.startedAt = startedAt; // ISO string
  }
}
