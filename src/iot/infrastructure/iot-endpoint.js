import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint.js';
import { IotAssembler } from './iot-assembler.js';

export class IotEndpoint extends BaseEndpoint {
  constructor(api) {
    super(api, 'iot_devices', new IotAssembler());
  }
}
