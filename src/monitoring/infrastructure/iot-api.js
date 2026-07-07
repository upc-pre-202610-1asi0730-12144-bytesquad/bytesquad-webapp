import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { IotAssembler } from './iot-assembler.js';

const asm = new IotAssembler();

export class IotApi extends BaseApi {
  async getDevices() {
    const { data } = await this.http.get('sensors');
    return data.map(r => asm.toEntityFromResource(r));
  }

  async registerDevice(data) {
    const { data: res } = await this.http.post('sensors', asm.toRegisterResource(data));
    return asm.toEntityFromResource(res);
  }

  async markDisconnected(id) {
    const { data } = await this.http.patch(`sensors/${id}/disconnect`);
    return asm.toEntityFromResource(data);
  }

  async markReconnected(id) {
    const { data } = await this.http.patch(`sensors/${id}/reconnect`);
    return asm.toEntityFromResource(data);
  }
}
