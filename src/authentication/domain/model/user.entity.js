export const UserRole = Object.freeze({ ADMIN: 'ADMIN', CLIENT: 'CLIENT' });

export class User {
  constructor({ id, username, role }) {
    this.id       = id;
    this.username = username;
    this.role     = role;
  }
}
