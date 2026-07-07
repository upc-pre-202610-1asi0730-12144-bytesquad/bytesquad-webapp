export const IotStatus = Object.freeze({ ONLINE: 'Online', OFFLINE: 'Offline' });

export class Iot {
  constructor({ id, equipmentId, macAddress, status, lastHeartbeat, location, batteryLevel, signalStrength, firmwareVersion }) {
    this.id              = id;
    this.equipmentId     = equipmentId;
    this.macAddress      = macAddress;
    this.status          = status;
    this.lastHeartbeat   = lastHeartbeat;
    this.location        = location;
    this.batteryLevel    = batteryLevel;
    this.signalStrength  = signalStrength;
    this.firmwareVersion = firmwareVersion;
  }
}
