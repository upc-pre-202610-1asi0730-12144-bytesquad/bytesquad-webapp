export class AdminProfile {
  constructor({ id, userId, email, firstName, lastName, phoneNumber, dni }) {
    this.id          = id;
    this.userId      = userId;
    this.email       = email;
    this.firstName   = firstName;
    this.lastName    = lastName;
    this.phoneNumber = phoneNumber;
    this.dni         = dni;
  }

  get fullName() { return `${this.firstName ?? ''} ${this.lastName ?? ''}`.trim(); }
}
