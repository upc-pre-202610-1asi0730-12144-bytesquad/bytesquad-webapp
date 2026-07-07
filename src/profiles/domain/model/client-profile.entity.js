export class ClientProfile {
  constructor({ id, userId, email, firstName, lastName, fullName, phoneNumber, dni }) {
    this.id          = id;
    this.userId      = userId;
    this.email       = email;
    this.firstName   = firstName   ?? null;
    this.lastName    = lastName    ?? null;
    this._fullName   = fullName    ?? null;
    this.phoneNumber = phoneNumber ?? null;
    this.dni         = dni         ?? null;
  }

  get fullName() {
    const computed = `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim();
    return computed || this._fullName || null;
  }
}
