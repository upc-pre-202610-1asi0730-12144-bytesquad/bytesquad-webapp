import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { EquipmentUsageStat } from '../domain/model/equipment-usage-stat.entity';
import { EquipmentUsageStatApiEndpoint } from './equipment-usage-stat-api-endpoint';

@Injectable({ providedIn: 'root' })
export class DashboardApi extends BaseApi {
  private readonly usageStatsEndpoint: EquipmentUsageStatApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.usageStatsEndpoint = new EquipmentUsageStatApiEndpoint(http);
  }

  getEquipmentUsageStats(): Observable<EquipmentUsageStat[]> {
    return this.usageStatsEndpoint.getAll();
  }
}
