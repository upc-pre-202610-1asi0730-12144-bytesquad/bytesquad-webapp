import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { Sidebar } from '../sidebar/sidebar';
import { AuthStore } from '../../../../auth/application/auth.store';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, LanguageSwitcher, Sidebar, MatIconModule, TranslateModule, TitleCasePipe],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  readonly auth  = inject(AuthStore);
  private router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
