export const MEMBERSHIP_PLANS = [
  {
    id:          'Basic',
    displayName: 'Basic',
    price:       '$69',
    features:    ['Hasta 20 máquinas monitoreadas', 'Mapa de calor en tiempo real', '1 sede', 'Soporte por email'],
    popular:     false,
  },
  {
    id:          'Mid',
    displayName: 'Mid',
    price:       '$109',
    features:    ['Hasta 50 máquinas monitoreadas', 'Mantenimiento predictivo', 'Hasta 3 sedes', 'Dashboard analítico completo', 'Soporte prioritario 24/7'],
    popular:     true,
  },
  {
    id:          'Premium',
    displayName: 'Platinum',
    price:       '$189',
    features:    ['Máquinas ilimitadas', 'Análisis predictivo de ROI', 'Sedes ilimitadas', 'API personalizada', 'Gestor de cuenta dedicado'],
    popular:     false,
  },
];

export const PLAN_ORDER = MEMBERSHIP_PLANS.map(p => p.id);

export function getPlanInfo(id) {
  return MEMBERSHIP_PLANS.find(p => p.id === id) ?? null;
}

export function lowerPlans(id) {
  const idx = PLAN_ORDER.indexOf(id);
  return idx <= 0 ? [] : MEMBERSHIP_PLANS.slice(0, idx);
}

export function higherOrOtherPlans(id) {
  return MEMBERSHIP_PLANS.filter(p => p.id !== id);
}
