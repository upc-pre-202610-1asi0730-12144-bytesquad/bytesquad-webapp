import { BaseEndpoint } from '@/shared/infrastructure/base-endpoint.js';
import { ReservationAssembler } from './reservation-assembler.js';

export class ReservationEndpoint extends BaseEndpoint {
  constructor(api) {
    super(api, 'reservations', new ReservationAssembler());
  }
}
