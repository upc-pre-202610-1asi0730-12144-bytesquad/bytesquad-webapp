import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { SensorAssembler } from './sensor-assembler.js';

const asm = new SensorAssembler();

export class SensorApi extends BaseApi {
  async #list(path) {
    const { data } = await this.http.get(path);
    return (Array.isArray(data) ? data : []).map(r => asm.toEntityFromResource(r));
  }

  async getMySensors() {
    const [motion, camera] = await Promise.all([
      this.#list('motion-sensors/me'),
      this.#list('camera-sensors/me'),
    ]);
    return [...motion, ...camera];
  }

  async registerMotion(identifier, equipmentId) {
    const body = { identifier };
    if (equipmentId != null) body.equipmentId = equipmentId;
    const { data } = await this.http.post('motion-sensors', body);
    return asm.toEntityFromResource(data);
  }

  async registerCamera(identifier, equipmentId) {
    const body = { identifier };
    if (equipmentId != null) body.equipmentId = equipmentId;
    const { data } = await this.http.post('camera-sensors', body);
    return asm.toEntityFromResource(data);
  }

  async captureMotion(sensorId, detectedAt) {
    await this.http.post('motion-sensors/capture-motion', { sensorId, detectedAt });
  }

  async captureCamera(sensorId, detectedAt) {
    await this.http.post('camera-sensors/capture', { sensorId, detectedAt });
  }
}
