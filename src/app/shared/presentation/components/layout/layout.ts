import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { Sidebar } from '../sidebar/sidebar';
import { BottomBar } from '../bottom-bar/bottom-bar';
import { SessionService } from '../../../application/session.service';
import { AuthStore } from '../../../../auth/application/auth.store';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    LanguageSwitcher,
    Sidebar,
    BottomBar, // Añadir aquí
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    TitleCasePipe,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private sessionService = inject(SessionService);
  private router = inject(Router);
  private authStore = inject(AuthStore);

  get currentRole(): 'admin' | 'client' {
    return this.sessionService.currentRole();
  }

  toggleRole() {
    this.sessionService.toggleRole();
  }

  logout() {
    this.authStore.logout();
    this.router.navigate(['/auth/login']);
  }
}
