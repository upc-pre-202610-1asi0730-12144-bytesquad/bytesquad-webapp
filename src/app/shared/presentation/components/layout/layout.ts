import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { Sidebar } from '../sidebar/sidebar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-layout',
  standalone: true, // Asumiendo que es standalone por tu estructura
  imports: [
    RouterOutlet,
    LanguageSwitcher,
    Sidebar,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  // Inicializamos por defecto en la vista que ya tienes (admin)
  currentRole: 'admin' | 'client' = 'admin';

  toggleRole() {
    this.currentRole = this.currentRole === 'admin' ? 'client' : 'admin';
  }
}
