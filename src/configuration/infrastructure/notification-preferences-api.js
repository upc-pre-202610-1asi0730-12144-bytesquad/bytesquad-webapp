import { BaseApi } from '@/shared/infrastructure/base-api.js';
import { NotificationPreferences } from '../domain/model/notification-preferences.entity.js';

export class NotificationPreferencesApi extends BaseApi {
  async getCurrentUser() {
    const { data } = await this.http.get('users/me');
    return new NotificationPreferences(data);
  }

  async updatePreferences(prefs) {
    const { data } = await this.http.patch('users/me/notification-preferences', {
      notifyOnCritical:  prefs.notifyOnCritical,
      notifyOnWarning:   prefs.notifyOnWarning,
      notificationEmail: prefs.notificationEmail || null,
    });
    return new NotificationPreferences(data);
  }
}
