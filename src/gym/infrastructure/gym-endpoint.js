import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint.js';
import { GymAssembler } from './gym-assembler.js';

export class GymEndpoint extends BaseEndpoint {
  constructor(api) {
    super(api, 'gyms', new GymAssembler());
  }
}
