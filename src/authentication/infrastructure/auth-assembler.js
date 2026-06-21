import { User } from '../domain/model/user.entity.js';

export class AuthAssembler {
  toEntityFromResource(r) {
    return new User({ id: r.id, username: r.username, role: r.role });
  }
}
