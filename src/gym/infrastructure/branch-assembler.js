import { Branch } from '../domain/model/branch.entity.js';

export class BranchAssembler {
  toEntityFromResource(r) {
    return new Branch({ id: r.id, name: r.name, street: r.street, district: r.district, city: r.city });
  }

  toResourceFromEntity(e) {
    return { name: e.name, street: e.street, district: e.district, city: e.city };
  }
}
