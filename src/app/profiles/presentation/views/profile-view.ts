import { Component } from '@angular/core';
import { LanguageSwitcher } from '../../../shared/presentation/components/language-switcher/language-switcher';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  templateUrl: './profile-view.html',
  styleUrl: './profile-view.scss',
  imports: [LanguageSwitcher],
})
export class ProfileView {}
