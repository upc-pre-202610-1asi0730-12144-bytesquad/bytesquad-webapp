import { AdminProfile } from '../domain/model/admin-profile.entity.js';

export class AdminProfileAssembler {
  toEntityFromResource(r) {
    return new AdminProfile({
      id: r.id, userId: r.userId, email: r.email,
      firstName: r.firstName, lastName: r.lastName, phoneNumber: r.phoneNumber, dni: r.dni,
    });
  }

  toCreateResource(dto) {
    return { userId: dto.userId, email: dto.email, firstName: dto.firstName, lastName: dto.lastName, phoneNumber: dto.phoneNumber, dni: dto.dni };
  }

  toUpdateResource(dto) {
    return { firstName: dto.firstName, lastName: dto.lastName, phoneNumber: dto.phoneNumber };
  }
}
