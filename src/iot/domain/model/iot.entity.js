export const IotStatus = Object.freeze({ ONLINE: 'ONLINE', OFFLINE: 'OFFLINE', WARNING: 'WARNING' });
export const AlertType = Object.freeze({ DISCONNECTED: 'DISCONNECTED', LOW_BATTERY: 'LOW_BATTERY', WEAK_SIGNAL: 'WEAK_SIGNAL' });

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
