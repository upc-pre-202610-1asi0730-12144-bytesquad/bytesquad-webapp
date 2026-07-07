export class NotificationPreferences {
  constructor({ notifyOnCritical, notifyOnWarning, notificationEmail }) {
    this.notifyOnCritical  = notifyOnCritical;
    this.notifyOnWarning   = notifyOnWarning;
    this.notificationEmail = notificationEmail ?? '';
  }
}
