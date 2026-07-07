export const SensorType = Object.freeze({ MOTION: 'MotionSensor', CAMERA: 'CameraSensor' });

export class Sensor {
  constructor({ id, type, identifier, adminId, equipmentId, registeredAt, captureCount }) {
    this.id           = id;
    this.type         = type;
    this.identifier   = identifier;
    this.adminId      = adminId;
    this.equipmentId  = equipmentId ?? null;
    this.registeredAt = registeredAt;
    this.captureCount = captureCount ?? 0;
  }
}
