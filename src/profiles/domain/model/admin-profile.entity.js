export class AdminProfile {
  constructor({ id, userId, email, fullName, phoneNumber, dni }) {
    this.id = id;
    this.userId = userId;
    this.email = email;
    this.fullName = fullName;
    this.phoneNumber = phoneNumber;
    this.dni = dni;
  }
}
