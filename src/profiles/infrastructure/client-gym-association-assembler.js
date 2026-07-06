import { ClientGymAssociation } from '../domain/model/client-gym-association.entity.js';

export class ClientGymAssociationAssembler {
  toEntityFromResource(r) {
    return new ClientGymAssociation({
      clientId: r.clientId, gymId: r.gymId, active: r.active,
    });
  }
}
