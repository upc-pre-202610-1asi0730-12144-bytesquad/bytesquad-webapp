import { Gym } from '../domain/model/gym.entity.js';

export class GymAssembler {
  toEntityFromResource(r) {
    return new Gym({ id: r.id, name: r.name });
  }

  toResourceFromEntity(e) {
    return { name: e.name };
  }
}
