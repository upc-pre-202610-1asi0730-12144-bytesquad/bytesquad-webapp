import { Zone } from '../domain/model/zone.entity.js';

export class ZoneAssembler {
  toEntityFromResource(r) {
    return new Zone({
      id: r.id, name: r.name,
      maximumOccupancy: r.maximumOccupancy, branchId: r.branchId,
    });
  }

  toResourceFromEntity(e) {
    return { name: e.name, maximumOccupancy: e.maximumOccupancy };
  }
}
