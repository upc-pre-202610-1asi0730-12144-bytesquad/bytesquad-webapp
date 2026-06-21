export const UserRole = Object.freeze({ ADMIN: 'Admin', CLIENT: 'Client' });

export class User {
  constructor({ id, username, role }) {
    this.id       = id;
    this.username = username;
    this.role     = role;
  }
}
