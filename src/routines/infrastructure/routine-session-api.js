import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { RoutineSessionAssembler } from './routine-session-assembler.js';

const asm = new RoutineSessionAssembler();

export class RoutineSessionApi extends BaseApi {
  async create(routineId) {
    const { data } = await this.http.post('routine-sessions', { routineId });
    return asm.toEntityFromResource(data);
  }

  async getById(sessionId) {
    const { data } = await this.http.get(`routine-sessions/${sessionId}`);
    return asm.toEntityFromResource(data);
  }

  async getAll() {
    const { data } = await this.http.get('routine-sessions');
    return Array.isArray(data) ? data.map(r => asm.toEntityFromResource(r)) : [];
  }

  async complete(sessionId) {
    const { data } = await this.http.post(`routine-sessions/${sessionId}/completions`, {});
    return asm.toEntityFromResource(data);
  }

  async miss(sessionId) {
    const { data } = await this.http.post(`routine-sessions/${sessionId}/missed`, {});
    return asm.toEntityFromResource(data);
  }

  async setExerciseCompletion(sessionId, exerciseBlockId, completed) {
    const { data } = await this.http.patch(
      `routine-sessions/${sessionId}/exercise-blocks/${exerciseBlockId}`, { completed });
    return asm.toEntityFromResource(data);
  }
}
