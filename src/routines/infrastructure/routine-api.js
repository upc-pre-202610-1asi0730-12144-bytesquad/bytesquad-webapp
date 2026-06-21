import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { RoutineAssembler } from './routine-assembler.js';

const asm = new RoutineAssembler();

export class RoutineApi extends BaseApi {
  async create(routineName, clientId) {
    const { data } = await this.http.post('routines', { routineName, clientId });
    return asm.toEntityFromResource(data);
  }

  async getById(routineId) {
    const { data } = await this.http.get(`routines/${routineId}`);
    return asm.toEntityFromResource(data);
  }

  async getByClient(clientId) {
    const { data } = await this.http.get('routines', { params: { clientId } });
    return Array.isArray(data) ? data.map(r => asm.toEntityFromResource(r)) : [];
  }

  async addExerciseBlock(routineId, exerciseName, exerciseType, order) {
    const { data } = await this.http.post(`routines/${routineId}/exercise-blocks`, { exerciseName, exerciseType, order });
    return asm.toBlockEntityFromResource(data);
  }
}
