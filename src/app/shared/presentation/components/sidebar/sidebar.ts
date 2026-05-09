import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '../../../../auth/application/auth.store';
import { UserRole } from '../../../../auth/domain/model/user.model';

interface NavItem {
  path:     string;
  icon:     string;
  labelKey: string;
}

const ADMIN_NAV: NavItem[] = [
  { path: '/dashboard',   icon: 'home',          labelKey: 'nav.dashboard'   },
  { path: '/equipments',  icon: 'fitness_center', labelKey: 'nav.equipment'  },
  { path: '/iot',         icon: 'sensors',        labelKey: 'nav.iot'        },
  { path: '/maintenance', icon: 'build',          labelKey: 'nav.maintenance' },
  { path: '/analytics',  icon: 'bar_chart',       labelKey: 'nav.analytics'  },
  { path: '/alerts',     icon: 'notifications',   labelKey: 'nav.alerts'     },
  { path: '/configuration', icon: 'settings',     labelKey: 'nav.configuration' },
];

const CLIENT_NAV: NavItem[] = [
  { path: '/client', icon: 'home', labelKey: 'nav.clientHome' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private auth = inject(AuthStore);

  readonly navItems = computed<NavItem[]>(() =>
    this.auth.currentUser()?.role === UserRole.ADMIN ? ADMIN_NAV : CLIENT_NAV
  );
}
