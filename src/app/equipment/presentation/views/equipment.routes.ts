import { Routes } from '@angular/router';

export const equipmentRoutes: Routes = [
  {
    path: 'equipments',
    loadComponent: () =>
      import('./equipment-management/equipment-management.component').then(
        m => m.EquipmentManagementComponent
      ),
  },
  {
    path: 'equipments/new',
    loadComponent: () =>
      import('./add-equipment-dialog/add-equipment-dialog.component').then(
        m => m.AddEquipmentDialogComponent
      ),
  },
  {
    path: 'equipments/:id/edit',
    loadComponent: () =>
      import('./add-equipment-dialog/add-equipment-dialog.component').then(
        m => m.AddEquipmentDialogComponent
      ),
  },
];
