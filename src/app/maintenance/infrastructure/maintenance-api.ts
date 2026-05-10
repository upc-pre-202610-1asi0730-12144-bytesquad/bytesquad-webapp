import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MaintenanceTicketResource, MaintenanceScheduleResource } from './maintenance-response';
import { MaintenanceTicketAssembler } from './maintenance-ticket-assembler';
import { MaintenanceScheduleAssembler } from './maintenance-schedule-assembler';
import { MaintenanceTicket } from '../domain/model/maintenance-ticket.entity';
import { MaintenanceSchedule } from '../domain/model/maintenance-schedule.entity';

@Injectable({ providedIn: 'root' })
export class MaintenanceApi {
  private readonly http             = inject(HttpClient);
  private readonly ticketAssembler  = new MaintenanceTicketAssembler();
  private readonly scheduleAssembler = new MaintenanceScheduleAssembler();

  private get baseUrl(): string {
    return environment.equipmentApiProvider;
  }

  getTickets(): Observable<MaintenanceTicket[]> {
    return this.http
      .get<MaintenanceTicketResource[]>(`${this.baseUrl}maintenance_tickets`)
      .pipe(
        map(list => list.map(r => this.ticketAssembler.toEntityFromResource(r))),
        catchError(this.handleError('Failed to load maintenance tickets')),
      );
  }

  getSchedules(): Observable<MaintenanceSchedule[]> {
    return this.http
      .get<MaintenanceScheduleResource[]>(`${this.baseUrl}maintenance_schedules`)
      .pipe(
        map(list => list.map(r => this.scheduleAssembler.toEntityFromResource(r))),
        catchError(this.handleError('Failed to load maintenance schedules')),
      );
  }

  createSchedule(schedule: MaintenanceSchedule): Observable<MaintenanceSchedule> {
    const { id: _id, ...body } = this.scheduleAssembler.toResourceFromEntity(schedule);
    return this.http
      .post<MaintenanceScheduleResource>(`${this.baseUrl}maintenance_schedules`, body)
      .pipe(
        map(r => this.scheduleAssembler.toEntityFromResource(r)),
        catchError(this.handleError('Failed to schedule maintenance')),
      );
  }

  private handleError(op: string) {
    return (err: unknown): Observable<never> =>
      throwError(() => new Error(err instanceof Error ? err.message : op));
  }
}
