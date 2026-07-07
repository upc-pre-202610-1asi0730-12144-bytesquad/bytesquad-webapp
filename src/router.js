import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore }                    from '@/authentication/application/auth.store.js';
import { useGymStore }                     from '@/gym/application/gym.store.js';
import { useClientGymAssociationStore }    from '@/profiles/application/client-gym-association.store.js';

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
    component: () => import('@/authentication/presentation/views/login-view.vue'),
    meta: { public: true },
  },
  {
    path: '/',
    component: () => import('@/shared/presentation/components/layout/layout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'profile', component: () => import('@/profiles/presentation/views/profile-view.vue') },
      { path: 'alerts',  component: () => import('@/monitoring/presentation/views/alerts-view.vue') },

      // Admin routes
      { path: 'dashboard',       component: () => import('@/dashboard/presentation/views/dashboard-view.vue'),             meta: { requiresAdmin: true } },
      { path: 'equipment',       component: () => import('@/gym/presentation/views/equipment-management.vue'),        meta: { requiresAdmin: true } },
      { path: 'equipment/new',   component: () => import('@/gym/presentation/views/equipment-form.vue'),              meta: { requiresAdmin: true } },
      { path: 'equipment/:id/edit', component: () => import('@/gym/presentation/views/equipment-form.vue'),           meta: { requiresAdmin: true } },
      { path: 'iot',             component: () => import('@/monitoring/presentation/views/iot-monitoring.vue'),              meta: { requiresAdmin: true } },
      { path: 'maintenance',     component: () => import('@/maintenance/presentation/views/maintenance-view.vue'),          meta: { requiresAdmin: true } },
      { path: 'maintenance/new-ticket', component: () => import('@/maintenance/presentation/views/new-ticket-view.vue'),   meta: { requiresAdmin: true } },
      { path: 'analytics',       component: () => import('@/analytics/presentation/views/analytics-view.vue'),             meta: { requiresAdmin: true } },
      { path: 'analytics/records', component: () => import('@/analytics/presentation/views/analytics-forms-view.vue'), meta: { requiresAdmin: true } },
      { path: 'financial-impact',component: () => import('@/analytics/presentation/views/financial-impact-view.vue'),  meta: { requiresAdmin: true } },
      { path: 'configuration',   component: () => import('@/configuration/presentation/views/configuration-view.vue'),     meta: { requiresAdmin: true } },
      { path: 'gym',             component: () => import('@/gym/presentation/views/gym-management.vue'),                   meta: { requiresAdmin: true } },
      { path: 'membership',      component: () => import('@/membership/presentation/views/membership-management.vue'),        meta: { requiresAdmin: true } },
      { path: 'gym/whitelist',   component: () => import('@/gym/presentation/views/gym-whitelist-view.vue'),                  meta: { requiresAdmin: true } },

      // Client routes
      { path: 'client',   component: () => import('@/shared/presentation/views/client-home-view.vue'), meta: { requiresClient: true } },
      { path: 'gym/associate', component: () => import('@/profiles/presentation/views/gym-associate-view.vue'), meta: { requiresClient: true } },
      { path: 'map',      component: () => import('@/monitoring/presentation/views/map-view.vue'),             meta: { requiresClient: true } },
      { path: 'bookings', component: () => import('@/reservation/presentation/views/reservation-view.vue'), meta: { requiresClient: true } },
      { path: 'routines', component: () => import('@/routines/presentation/views/routine-list-view.vue'),   meta: { requiresClient: true } },
      { path: 'routines/:id', component: () => import('@/routines/presentation/views/routine-detail-view.vue'), meta: { requiresClient: true } },
      { path: 'anomalies/report', component: () => import('@/monitoring/presentation/views/anomaly-report-view.vue'), meta: { requiresClient: true } },
    ],
  },
  { path: '/setup-gym', component: () => import('@/gym/presentation/views/setup-gym-view.vue'), meta: { requiresAuth: true } },
  { path: '/join-gym', component: () => import('@/profiles/presentation/views/join-gym-view.vue'), meta: { requiresAuth: true } },
  { path: '/register-business', component: () => import('@/registration/presentation/views/register-business-view.vue'), meta: { public: true } },
  { path: '/payment/success',   component: () => import('@/registration/presentation/views/payment-success-view.vue'),   meta: { public: true } },
  { path: '/payment/cancel',    component: () => import('@/registration/presentation/views/payment-cancel-view.vue'),    meta: { public: true } },
  { path: '/:pathMatch(.*)*', redirect: '/login' },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth       = useAuthStore();
  const gymStore   = useGymStore();
  const assocStore = useClientGymAssociationStore();

  if (to.meta.public) return true;

  if (to.meta.requiresAuth && !auth.isAuthenticated) return '/login';
  if (to.meta.requiresAdmin && !auth.isAdmin)        return '/client';
  if (to.meta.requiresClient && !auth.isClient)      return '/dashboard';

  // Admin onboarding gate — cached for the session
  if (auth.isAdmin && to.path !== '/setup-gym') {
    if (!gymStore.gymChecked) await gymStore.loadAdminGym(auth.user.id);
    if (!gymStore.currentGym) return '/setup-gym';
  }
  if (auth.isAdmin && to.path === '/setup-gym' && gymStore.currentGym) {
    return '/dashboard';
  }

  // Client onboarding gate — cached for the session
  if (auth.isClient) {
    if (!assocStore.associationsChecked) await assocStore.loadMyAssociations();
    if (!assocStore.hasActiveGym) {
      return to.path === '/join-gym' ? true : '/join-gym';
    }
    if (to.path === '/join-gym') return '/client';
  }

  return true;
});
