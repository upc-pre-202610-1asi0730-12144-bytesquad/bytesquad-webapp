export class ConfigurationAssembler {
  toEntityFromResource(r) {
    return {
      maintenanceThresholds: {
        criticalUsageHours: r.maintenance_critical_usage_hours,
        maxInactiveTime:    r.maintenance_max_inactive_time,
        peakHoursBuffer:    r.maintenance_peak_hours_buffer,
      },
      iotConfig: {
        lowBatteryThreshold: r.iot_low_battery_threshold,
        pingInterval:        r.iot_ping_interval,
        offlineGracePeriod:  r.iot_offline_grace_period,
      },
      financialConfig: {
        costPerHourDowntime: r.financial_cost_per_hour_downtime,
        monthlyMembership:   r.financial_monthly_membership,
        systemCurrency:      r.financial_system_currency,
      },
      notificationEmail:     r.notification_email,
      enabledAlertTypes:     r.enabled_alert_types ?? [],
      intelligentScheduling: r.intelligent_scheduling,
      lastUpdated:           r.last_updated ? new Date(r.last_updated) : undefined,
    };
  }

  toResourceFromEntity(e) {
    return {
      maintenance_critical_usage_hours: e.maintenanceThresholds.criticalUsageHours,
      maintenance_max_inactive_time:    e.maintenanceThresholds.maxInactiveTime,
      maintenance_peak_hours_buffer:    e.maintenanceThresholds.peakHoursBuffer,
      iot_low_battery_threshold:        e.iotConfig.lowBatteryThreshold,
      iot_ping_interval:                e.iotConfig.pingInterval,
      iot_offline_grace_period:         e.iotConfig.offlineGracePeriod,
      financial_cost_per_hour_downtime: e.financialConfig.costPerHourDowntime,
      financial_monthly_membership:     e.financialConfig.monthlyMembership,
      financial_system_currency:        e.financialConfig.systemCurrency,
      notification_email:               e.notificationEmail,
      enabled_alert_types:              e.enabledAlertTypes,
      intelligent_scheduling:           e.intelligentScheduling,
      last_updated:                     e.lastUpdated?.toISOString(),
    };
  }
}
