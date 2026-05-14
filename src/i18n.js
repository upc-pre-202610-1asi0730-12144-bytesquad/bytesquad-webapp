import { createI18n } from 'vue-i18n';
import en from './i18n/en.json';
import es from './i18n/es.json';

export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('spottrack_lang') || 'en',
  fallbackLocale: 'es',
  messages: { en, es },
});
