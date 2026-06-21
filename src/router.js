import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/auth/application/auth.store.js';

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    component: () => import('@/auth/presentation/views/login-view.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/shared/presentation/components/layout/layout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'profile', component: () => import('@/profiles/presentation/views/profile-view.vue') },
      { path: 'alerts',  component: () => import('@/alerts/presentation/views/alerts-view.vue') },

      // Admin routes
      { path: 'dashboard',       component: () => import('@/dashboard/presentation/views/dashboard-view.vue'),             meta: { requiresAdmin: true } },
      { path: 'equipment',       component: () => import('@/equipment/presentation/views/equipment-management.vue'),        meta: { requiresAdmin: true } },
      { path: 'equipment/new',   component: () => import('@/equipment/presentation/views/equipment-form.vue'),              meta: { requiresAdmin: true } },
      { path: 'equipment/:id/edit', component: () => import('@/equipment/presentation/views/equipment-form.vue'),           meta: { requiresAdmin: true } },
      { path: 'iot',             component: () => import('@/iot/presentation/views/iot-monitoring.vue'),                    meta: { requiresAdmin: true } },
      { path: 'maintenance',     component: () => import('@/maintenance/presentation/views/maintenance-view.vue'),          meta: { requiresAdmin: true } },
      { path: 'maintenance/new-ticket', component: () => import('@/maintenance/presentation/views/new-ticket-view.vue'),   meta: { requiresAdmin: true } },
      { path: 'analytics',       component: () => import('@/analytics/presentation/views/analytics-view.vue'),             meta: { requiresAdmin: true } },
      { path: 'financial-impact',component: () => import('@/financial-impact/presentation/views/financial-impact-view.vue'), meta: { requiresAdmin: true } },
      { path: 'configuration',   component: () => import('@/configuration/presentation/views/configuration-view.vue'),     meta: { requiresAdmin: true } },
      { path: 'membership',      component: () => import('@/membership/presentation/views/membership-management.vue'),        meta: { requiresAdmin: true } },

      // Client routes
      { path: 'client',   component: () => import('@/client/presentation/views/client-home-view.vue'),  meta: { requiresClient: true } },
      { path: 'map',      component: () => import('@/map/presentation/views/map-view.vue'),             meta: { requiresClient: true } },
      { path: 'bookings', component: () => import('@/reservation/presentation/views/reservation-view.vue'), meta: { requiresClient: true } },
      { path: 'routines', component: () => import('@/routines/presentation/views/routines-view.vue'),   meta: { requiresClient: true } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (to.meta.public) return true;

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login';
  }
  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return '/client';
  }
  if (to.meta.requiresClient && !auth.isClient) {
    return '/dashboard';
  }
  return true;
});
