export class Alert {
  constructor({ id, adminId, equipmentId, severity, message, resolved, createdAt }) {
    this.id          = id;
    this.adminId     = adminId;
    this.equipmentId = equipmentId ?? null;
    this.severity    = severity;      // 'Info' | 'Warning' | 'Critical'
    this.message     = message;
    this.resolved    = resolved;
    this.createdAt   = createdAt;     // ISO 8601 string
  }
}
