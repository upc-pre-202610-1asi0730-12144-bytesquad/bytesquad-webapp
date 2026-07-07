export class Zone {
  constructor({ id, name, maximumOccupancy, branchId }) {
    this.id               = id;
    this.name             = name;
    this.maximumOccupancy = maximumOccupancy;
    this.branchId         = branchId;
  }
}
