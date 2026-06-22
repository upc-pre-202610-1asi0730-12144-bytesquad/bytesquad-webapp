import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { RoutineSessionAssembler } from './routine-session-assembler.js';

const asm = new RoutineSessionAssembler();

export class RoutineSessionApi extends BaseApi {
  async create(routineId, clientId) {
    const { data } = await this.http.post('routine-sessions', { routineId, clientId });
    return asm.toEntityFromResource(data);
  }

  async getById(sessionId) {
    const { data } = await this.http.get(`routine-sessions/${sessionId}`);
    return asm.toEntityFromResource(data);
  }

  async getByClient(clientId) {
    const { data } = await this.http.get('routine-sessions', { params: { clientId } });
    return Array.isArray(data) ? data.map(r => asm.toEntityFromResource(r)) : [];
  }

  async complete(sessionId) {
    await this.http.post(`routine-sessions/${sessionId}/completions`, {});
  }

  async miss(sessionId) {
    await this.http.post(`routine-sessions/${sessionId}/missed`, {});
  }
}
