import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { RoutineAssembler } from './routine-assembler.js';

const asm = new RoutineAssembler();

export class RoutineApi extends BaseApi {
  async create(routineName) {
    const { data } = await this.http.post('routines', { routineName });
    return asm.toEntityFromResource(data);
  }

  async getById(routineId) {
    const { data } = await this.http.get(`routines/${routineId}`);
    return asm.toEntityFromResource(data);
  }

  async getAll() {
    const { data } = await this.http.get('routines');
    return Array.isArray(data) ? data.map(r => asm.toEntityFromResource(r)) : [];
  }

  async getExerciseBlocks(routineId) {
    const { data } = await this.http.get(`routines/${routineId}/exercise-blocks`);
    return Array.isArray(data) ? data.map(r => asm.toBlockEntityFromResource(r)) : [];
  }

  async addExerciseBlock(routineId, exerciseName, exerciseType, order, sets, reps) {
    const { data } = await this.http.post(
      `routines/${routineId}/exercise-blocks`, { exerciseName, exerciseType, order, sets, reps });
    return asm.toBlockEntityFromResource(data);
  }
}
