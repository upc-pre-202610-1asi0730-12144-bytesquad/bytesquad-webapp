<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n }            from 'vue-i18n';
import { useAuthStore }       from '@/authentication/application/auth.store.js';
import { useMembershipStore } from '@/membership/application/membership.store.js';
import { MembershipStatus }   from '@/membership/domain/model/membership.entity.js';
import { MEMBERSHIP_PLANS, getPlanInfo, lowerPlans, higherOrOtherPlans } from '@/membership/domain/model/membership-plans.js';

const { t } = useI18n();

const auth            = useAuthStore();
const membershipStore = useMembershipStore();

onMounted(() => membershipStore.loadByClient(auth.user.id));

const myMembership = computed(() => membershipStore.memberships[0] ?? null);
const planInfo     = computed(() => myMembership.value ? getPlanInfo(myMembership.value.plan) : null);

// ── Status badge ───────────────────────────────────────────────────────────
function statusClass(s) {
  if (s === MembershipStatus.Active)              return 'green';
  if (s === MembershipStatus.Suspended || s === MembershipStatus.PendingCancellation) return 'amber';
  return 'red';
}

// ── Renew ──────────────────────────────────────────────────────────────────
const showRenewInput = ref(false);
const renewDate      = ref('');

async function submitRenew() {
  if (!renewDate.value) return;
  await membershipStore.renew(myMembership.value.id, renewDate.value);
  showRenewInput.value = false;
  renewDate.value      = '';
}

// ── Plan selector (Change Plan / Downgrade) ────────────────────────────────
const selectorMode   = ref(null); // null | 'upgrade' | 'downgrade'
const selectorPlans  = computed(() => {
  if (!myMembership.value) return [];
  return selectorMode.value === 'downgrade'
    ? lowerPlans(myMembership.value.plan)
    : higherOrOtherPlans(myMembership.value.plan);
});

function openSelector(mode) {
  selectorMode.value   = mode;
  showRenewInput.value = false;
}
function closeSelector() { selectorMode.value = null; }

async function selectPlan(planId) {
  if (selectorMode.value === 'downgrade') {
    await membershipStore.downgrade(myMembership.value.id, planId);
  } else {
    await membershipStore.changePlan(myMembership.value.id, planId);
  }
  closeSelector();
}

// ── Downgrade visibility ───────────────────────────────────────────────────
const canDowngrade = computed(() =>
  myMembership.value ? lowerPlans(myMembership.value.plan).length > 0 : false
);
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('membership.title') }}</h1>
    </div>

    <div v-if="membershipStore.error" class="error-banner card">
      {{ membershipStore.error }}
    </div>

    <!-- Loading skeleton -->
    <div v-if="membershipStore.loading && !myMembership" class="card skeleton-card">
      <div class="skeleton skeleton--title" />
      <div class="skeleton skeleton--line" />
      <div class="skeleton skeleton--line short" />
    </div>

    <!-- No membership -->
    <div v-else-if="!membershipStore.loading && !myMembership" class="empty-state card">
      <span class="material-icons" style="font-size:36px;color:var(--text-secondary)">card_membership</span>
      <p style="color:var(--text-secondary);font-size:.85rem">{{ t('membership.empty') }}</p>
    </div>

    <!-- Membership card -->
    <template v-else-if="myMembership">
      <div class="card membership-card">

        <div class="membership-card__top">
          <div class="membership-card__plan">
            <span class="plan-name">{{ planInfo?.displayName ?? myMembership.plan }}</span>
            <span class="plan-price" v-if="myMembership.amount && myMembership.currency">
              {{ myMembership.currency }} {{ myMembership.amount }}<span class="plan-price__period">{{ t('membership.perMonth') }}</span>
            </span>
            <span class="plan-price" v-else-if="planInfo">
              {{ planInfo.price }}<span class="plan-price__period">{{ t('membership.perMonth') }}</span>
            </span>
          </div>
          <span class="badge" :class="`badge--${statusClass(myMembership.status)}`">
            {{ t(`membership.status.${myMembership.status}`) }}
          </span>
        </div>

        <div class="membership-card__meta">
          <div class="meta-item">
            <span class="material-icons meta-item__icon">event</span>
            <span class="meta-item__label">{{ t('membership.card.renewal') }}</span>
            <span class="meta-item__value">{{ myMembership.endDate?.slice(0, 10) ?? '—' }}</span>
          </div>
          <div v-if="myMembership.startDate" class="meta-item">
            <span class="material-icons meta-item__icon">calendar_today</span>
            <span class="meta-item__label">{{ t('membership.card.startDate') }}</span>
            <span class="meta-item__value">{{ myMembership.startDate.slice(0, 10) }}</span>
          </div>
        </div>

        <div v-if="myMembership.pendingDowngradePlan" class="downgrade-notice">
          <span class="material-icons" style="font-size:15px">schedule</span>
          {{ t('membership.card.pendingDowngrade', { plan: getPlanInfo(myMembership.pendingDowngradePlan)?.displayName ?? myMembership.pendingDowngradePlan }) }}
        </div>

        <div v-if="myMembership.status === MembershipStatus.PendingCancellation" class="downgrade-notice downgrade-notice--cancel">
          <span class="material-icons" style="font-size:15px">info</span>
          {{ t('membership.card.pendingCancellation', { date: myMembership.endDate?.slice(0, 10) }) }}
        </div>
      </div>

      <!-- Action row -->
      <div class="actions-row">
        <!-- Renew -->
        <template v-if="showRenewInput">
          <input type="date" v-model="renewDate" class="renew-input" />
          <button class="btn btn--primary btn--sm" :disabled="membershipStore.loading" @click="submitRenew">OK</button>
          <button class="btn btn--outline btn--sm" @click="showRenewInput = false; renewDate = ''">✕</button>
        </template>
        <button v-else
          class="btn btn--outline"
          :disabled="myMembership.status === MembershipStatus.Cancelled || myMembership.status === MembershipStatus.Expired"
          @click="showRenewInput = true; closeSelector()">
          <span class="material-icons btn__icon">autorenew</span> {{ t('membership.actions.renew') }}
        </button>

        <!-- Suspend -->
        <button class="btn btn--outline"
          :disabled="myMembership.status !== MembershipStatus.Active || membershipStore.loading"
          @click="membershipStore.suspend(myMembership.id)">
          <span class="material-icons btn__icon">pause_circle</span> {{ t('membership.actions.suspend') }}
        </button>

        <!-- Cancel -->
        <button class="btn btn--danger"
          :disabled="myMembership.status === MembershipStatus.Cancelled || myMembership.status === MembershipStatus.PendingCancellation || membershipStore.loading"
          @click="membershipStore.cancel(myMembership.id)">
          <span class="material-icons btn__icon">cancel</span> {{ t('membership.actions.cancel') }}
        </button>

        <div class="actions-row__divider" />

        <!-- Change Plan -->
        <button class="btn btn--outline"
          :class="{ 'btn--active': selectorMode === 'upgrade' }"
          :disabled="membershipStore.loading"
          @click="selectorMode === 'upgrade' ? closeSelector() : openSelector('upgrade')">
          <span class="material-icons btn__icon">swap_horiz</span> {{ t('membership.actions.changePlan') }}
        </button>

        <!-- Downgrade -->
        <button v-if="canDowngrade"
          class="btn btn--outline"
          :class="{ 'btn--active': selectorMode === 'downgrade' }"
          :disabled="membershipStore.loading"
          @click="selectorMode === 'downgrade' ? closeSelector() : openSelector('downgrade')">
          <span class="material-icons btn__icon">arrow_downward</span> {{ t('membership.actions.downgrade') }}
        </button>
      </div>

      <!-- Plan selector panel -->
      <transition name="slide-down">
        <div v-if="selectorMode" class="selector-panel card">
          <div class="selector-panel__header">
            <p class="selector-panel__title">
              {{ selectorMode === 'downgrade' ? t('membership.selector.titleDowngrade') : t('membership.selector.titleUpgrade') }}
            </p>
            <button class="btn btn--ghost btn--sm" @click="closeSelector">
              <span class="material-icons" style="font-size:18px">close</span>
            </button>
          </div>

          <div class="plan-cards">
            <div v-for="plan in MEMBERSHIP_PLANS" :key="plan.id"
              class="plan-card"
              :class="{
                'plan-card--current':     plan.id === myMembership.plan,
                'plan-card--popular':     plan.popular,
                'plan-card--unavailable': !selectorPlans.find(p => p.id === plan.id) && plan.id !== myMembership.plan,
              }">

              <div v-if="plan.popular" class="popular-pip">{{ t('membership.selector.popular') }}</div>

              <div class="plan-card__head">
                <span class="plan-card__name">{{ plan.displayName }}</span>
                <span class="plan-card__price">{{ plan.price }}<span class="plan-card__period">{{ t('membership.perMonth') }}</span></span>
              </div>

              <ul class="plan-card__features">
                <li v-for="f in plan.features" :key="f" class="plan-card__feature">
                  <span class="material-icons plan-card__check">check</span>{{ f }}
                </li>
              </ul>

              <button class="btn plan-card__btn"
                :class="plan.id === myMembership.plan ? 'btn--ghost' : 'btn--primary'"
                :disabled="plan.id === myMembership.plan || !selectorPlans.find(p => p.id === plan.id) || membershipStore.loading"
                @click="selectPlan(plan.id)">
                {{ plan.id === myMembership.plan ? t('membership.selector.currentPlan') : t('membership.selector.select') }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </template>
  </div>
</template>

<style scoped>
/* ── Membership card ──────────────────────────────────────────────────────── */
.membership-card { margin-bottom: 1rem; }
.membership-card__top { align-items: flex-start; display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
.membership-card__plan { display: flex; flex-direction: column; gap: .2rem; }
.plan-name  { font-size: 1.35rem; font-weight: 700; color: var(--text-primary); }
.plan-price { color: var(--accent); font-size: 1.05rem; font-weight: 600; }
.plan-price__period { color: var(--text-secondary); font-size: .8rem; font-weight: 400; }

.membership-card__meta { display: flex; flex-wrap: wrap; gap: 1.25rem; margin-bottom: .75rem; }
.meta-item { align-items: center; display: flex; gap: .35rem; }
.meta-item__icon  { color: var(--text-secondary); font-size: 15px; }
.meta-item__label { color: var(--text-secondary); font-size: .78rem; }
.meta-item__value { color: var(--text-primary); font-size: .85rem; font-weight: 500; }

.downgrade-notice { align-items: center; background: rgba(245,188,54,.1); border: 1px solid rgba(245,188,54,.3); border-radius: 6px; color: var(--accent); display: flex; font-size: .78rem; gap: .35rem; margin-top: .5rem; padding: .45rem .75rem; }
.downgrade-notice--cancel { background: rgba(239,68,68,.08); border-color: rgba(239,68,68,.3); color: var(--red); }

/* ── Badges ───────────────────────────────────────────────────────────────── */
.badge { border-radius: 999px; font-size: .7rem; font-weight: 600; padding: 3px 10px; white-space: nowrap; }
.badge--green { background: rgba(34,197,94,.15); color: var(--green); }
.badge--amber { background: rgba(245,188,54,.15); color: var(--accent); }
.badge--red   { background: rgba(239,68,68,.15);  color: var(--red); }

/* ── Action row ───────────────────────────────────────────────────────────── */
.actions-row { align-items: center; display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 1rem; }
.actions-row__divider { background: var(--border); height: 24px; margin: 0 .25rem; width: 1px; }
.renew-input { font-size: .82rem; padding: .3rem .5rem; width: 130px; }

.btn__icon { font-size: 15px; vertical-align: middle; margin-right: 2px; }
.btn--sm { font-size: .8rem; padding: .3rem .65rem; }
.btn--ghost { background: transparent; border: 1px solid transparent; color: var(--text-secondary); }
.btn--ghost:hover { color: var(--text-primary); }
.btn--danger { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3); color: var(--red); border-radius: var(--radius); cursor: pointer; font-size: .85rem; font-weight: 600; padding: .4rem .85rem; transition: opacity .15s; }
.btn--danger:disabled { cursor: not-allowed; opacity: .4; }
.btn--danger:not(:disabled):hover { opacity: .8; }
.btn--active { border-color: var(--accent) !important; color: var(--accent) !important; }

/* ── Plan selector panel ──────────────────────────────────────────────────── */
.selector-panel { overflow: hidden; padding: 1.25rem; }
.selector-panel__header { align-items: center; display: flex; justify-content: space-between; margin-bottom: 1.1rem; }
.selector-panel__title  { color: var(--text-primary); font-size: .9rem; font-weight: 600; margin: 0; }

.plan-cards { display: grid; gap: 1rem; grid-template-columns: repeat(3, 1fr); }

.plan-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 10px; display: flex; flex-direction: column; gap: .6rem; padding: 1rem; position: relative; transition: border-color .15s; }
.plan-card--current     { border-color: var(--accent); }
.plan-card--unavailable { opacity: .45; }
.popular-pip { background: var(--accent); border-radius: 999px; color: #000; font-size: .65rem; font-weight: 700; left: 50%; padding: 2px 10px; position: absolute; top: -11px; transform: translateX(-50%); white-space: nowrap; }

.plan-card__head  { align-items: baseline; display: flex; justify-content: space-between; }
.plan-card__name  { color: var(--text-primary); font-size: 1rem; font-weight: 700; }
.plan-card__price { color: var(--accent); font-size: .95rem; font-weight: 700; }
.plan-card__period{ color: var(--text-secondary); font-size: .72rem; font-weight: 400; }

.plan-card__features { display: flex; flex-direction: column; flex: 1; gap: .3rem; list-style: none; margin: 0; padding: 0; }
.plan-card__feature  { align-items: flex-start; color: var(--text-secondary); display: flex; font-size: .76rem; gap: .3rem; line-height: 1.4; }
.plan-card__check    { color: var(--accent); flex-shrink: 0; font-size: .85rem; margin-top: .05rem; }

.plan-card__btn { margin-top: auto; padding: .45rem; width: 100%; }

/* ── Skeleton ─────────────────────────────────────────────────────────────── */
.skeleton-card { display: flex; flex-direction: column; gap: .75rem; }
.skeleton { animation: pulse 1.4s ease-in-out infinite; background: var(--border); border-radius: 4px; }
.skeleton--title { height: 22px; width: 40%; }
.skeleton--line  { height: 14px; width: 70%; }
.skeleton--line.short { width: 45%; }
@keyframes pulse { 0%,100% { opacity: .5; } 50% { opacity: 1; } }

/* ── Error / empty ────────────────────────────────────────────────────────── */
.error-banner { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: var(--red); font-size: .85rem; margin-bottom: 1rem; padding: .75rem; }
.empty-state  { align-items: center; display: flex; flex-direction: column; gap: .75rem; padding: 2.5rem; text-align: center; }

/* ── Panel transition ─────────────────────────────────────────────────────── */
.slide-down-enter-active, .slide-down-leave-active { max-height: 600px; overflow: hidden; transition: max-height .25s ease, opacity .2s ease; }
.slide-down-enter-from, .slide-down-leave-to       { max-height: 0; opacity: 0; }

/* ── Responsive ───────────────────────────────────────────────────────────── */
@media (max-width: 680px) {
  .plan-cards { grid-template-columns: 1fr; }
  .actions-row__divider { display: none; }
}
</style>
