import { Gym } from '../domain/model/gym.entity.js';

export class GymAssembler {
  toEntityFromResource(r) {
    return new Gym({ id: r.id, name: r.name, street: r.street, district: r.district, city: r.city });
  }

  toResourceFromEntity(e) {
    return { name: e.name, street: e.street, district: e.district, city: e.city };
  }
}
