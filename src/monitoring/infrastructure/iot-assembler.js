import { Iot, IotStatus } from '../domain/model/iot.entity.js';

const STATUS_MAP = { ACTIVE: IotStatus.ONLINE, INACTIVE: IotStatus.OFFLINE };

export class IotAssembler {
  toEntityFromResource(r) {
    return new Iot({
      id:              r.id,
      equipmentId:     r.equipment_id,
      macAddress:      r.mac_address,
      status:          STATUS_MAP[r.status] ?? r.status,
      lastHeartbeat:   r.last_heartbeat,
      location:        r.location,
      batteryLevel:    r.battery_level,
      signalStrength:  r.signal_strength,
      firmwareVersion: r.firmware_version,
    });
  }

  toResourceFromEntity(e) {
    return {
      id:               e.id,
      equipment_id:     e.equipmentId,
      mac_address:      e.macAddress,
      status:           e.status,
      last_heartbeat:   e.lastHeartbeat,
      location:         e.location,
      battery_level:    e.batteryLevel,
      signal_strength:  e.signalStrength,
      firmware_version: e.firmwareVersion,
    };
  }
}
