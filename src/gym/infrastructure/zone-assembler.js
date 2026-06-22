import { Zone } from '../domain/model/zone.entity.js';

export class ZoneAssembler {
  toEntityFromResource(r) {
    return new Zone({ id: r.id, name: r.name });
  }

  toResourceFromEntity(e) {
    return { name: e.name };
  }
}
