import { createApp } from 'vue';
import App from './app.vue';
import { router } from './router.js';
import { pinia } from './pinia.js';
import { i18n } from './i18n.js';
import './style.css';

createApp(App)
  .use(pinia)
  .use(router)
  .use(i18n)
  .mount('#app');
