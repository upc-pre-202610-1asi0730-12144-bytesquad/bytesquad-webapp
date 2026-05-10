export interface MaintenanceTicketResource {
  id:           number;
  equipment_id: number;
  status:       string;
  priority:     string;
  type:         string;
  created_at:   string;
  description:  string;
  assignee:     string | null;
  completed_by: string | null;
}

export type MaintenanceTicketResponse = MaintenanceTicketResource[];

export interface MaintenanceScheduleResource {
  id:             number;
  equipment_id:   number;
  scheduled_date: string;
  scheduled_time: string;
  task_type:      string;
  notes:          string;
  status:         string;
}

export type MaintenanceScheduleResponse = MaintenanceScheduleResource[];
