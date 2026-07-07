import { ClientProfile } from '../domain/model/client-profile.entity.js';

export class ClientProfileAssembler {
  toEntityFromResource(r) {
    return new ClientProfile({
      id: r.id, userId: r.userId, email: r.email,
      firstName: r.firstName, lastName: r.lastName, fullName: r.fullName,
      phoneNumber: r.phoneNumber, dni: r.dni,
    });
  }

  toCreateResource(dto) {
    return { userId: dto.userId, email: dto.email, firstName: dto.firstName, lastName: dto.lastName, phoneNumber: dto.phoneNumber, dni: dto.dni };
  }

  toUpdateResource(dto) {
    const resource = {};
    if (dto.firstName   !== undefined) resource.firstName   = dto.firstName;
    if (dto.lastName    !== undefined) resource.lastName    = dto.lastName;
    if (dto.phoneNumber !== undefined) resource.phoneNumber = dto.phoneNumber;
    if (dto.dni         !== undefined) resource.dni         = dto.dni;
    return resource;
  }
}
