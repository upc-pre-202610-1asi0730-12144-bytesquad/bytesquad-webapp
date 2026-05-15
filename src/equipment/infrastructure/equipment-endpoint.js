import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint.js';
import { EquipmentAssembler } from './equipment-assembler.js';

export class EquipmentEndpoint extends BaseEndpoint {
  constructor(api) {
    super(api, 'equipments', new EquipmentAssembler());
  }
}
