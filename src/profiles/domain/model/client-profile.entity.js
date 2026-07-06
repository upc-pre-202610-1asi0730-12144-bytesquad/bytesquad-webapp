export class ClientProfile {
  constructor({ id, userId, email, fullName, firstName, lastName, phoneNumber, dni }) {
    this.id = id;
    this.userId = userId;
    this.email = email;
    this.fullName = fullName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phoneNumber = phoneNumber;
    this.dni = dni;
  }
}
