import { Iot } from '../domain/model/iot.entity.js';

export class IotAssembler {
  toEntityFromResource(r) {
    return new Iot({
      id:              r.id,
      equipmentId:     r.equipmentId,
      macAddress:      r.macAddress,
      status:          r.status,
      lastHeartbeat:   r.lastHeartbeat,
      location:        r.location,
      batteryLevel:    r.batteryLevel,
      signalStrength:  r.signalStrength,
      firmwareVersion: r.firmwareVersion,
    });
  }

  toRegisterResource(data) {
    return {
      equipmentId:     data.equipmentId,
      macAddress:      data.macAddress,
      location:        data.location,
      batteryLevel:    data.batteryLevel,
      signalStrength:  data.signalStrength,
      firmwareVersion: data.firmwareVersion,
    };
  }
}
