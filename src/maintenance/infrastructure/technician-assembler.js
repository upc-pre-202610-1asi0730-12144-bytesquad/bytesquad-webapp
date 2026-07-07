import { Technician } from '../domain/model/technician.entity.js';

export class TechnicianAssembler {
  toEntityFromResource(r) {
    return new Technician({
      id:             r.id,
      name:           r.name,
      specialization: r.specialization,
      phoneNumber:    r.phoneNumber,
      adminId:        r.adminId,
    });
  }

  toResourceFromEntity(e) {
    return { name: e.name, specialization: e.specialization, phoneNumber: e.phoneNumber };
  }
}
