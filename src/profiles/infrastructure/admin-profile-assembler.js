import { AdminProfile } from '../domain/model/admin-profile.entity.js';

export class AdminProfileAssembler {
  toEntityFromResource(r) {
    return new AdminProfile({
      id: r.id, userId: r.userId, email: r.email,
      fullName: r.fullName, phoneNumber: r.phoneNumber, dni: r.dni,
    });
  }

  toCreateResource(dto) {
    return { userId: dto.userId, email: dto.email, firstName: dto.firstName, lastName: dto.lastName, phoneNumber: dto.phoneNumber, dni: dto.dni };
  }

  toUpdateResource(dto) {
    return { firstName: dto.firstName, lastName: dto.lastName, phoneNumber: dto.phoneNumber };
  }
}
