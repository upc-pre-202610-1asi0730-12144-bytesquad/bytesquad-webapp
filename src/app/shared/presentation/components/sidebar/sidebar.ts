import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

interface NavItem {
  path: string;
  icon: string;
  labelKey: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  // Recibe el rol desde el layout
  @Input() role: 'admin' | 'client' = 'admin';

  // Rutas para el administrador
  private readonly adminNavItems: NavItem[] = [
    { path: '/dashboard', icon: 'home', labelKey: 'nav.dashboard' },
    { path: '/equipment', icon: 'fitness_center', labelKey: 'nav.equipment' },
    { path: '/iot', icon: 'sensors', labelKey: 'nav.iot' },
    { path: '/maintenance', icon: 'build', labelKey: 'nav.maintenance' },
    { path: '/analytics', icon: 'bar_chart', labelKey: 'nav.analytics' },
    { path: '/alerts', icon: 'notifications', labelKey: 'nav.alerts' },
    { path: '/configuration', icon: 'settings', labelKey: 'nav.configuration' },
  ];

  // Rutas para la vista del cliente
  private readonly clientNavItems: NavItem[] = [
    { path: '/dashboard', icon: 'home', labelKey: 'nav.dashboard' },
    { path: '/routines', icon: 'directions_run', labelKey: 'nav.routines' },
    { path: '/progress', icon: 'trending_up', labelKey: 'nav.progress' },
    { path: '/profile', icon: 'person', labelKey: 'nav.profile' },
  ];

  // Devuelve el array correspondiente según el rol activo
  get navItems(): NavItem[] {
    return this.role === 'admin' ? this.adminNavItems : this.clientNavItems;
  }
}
