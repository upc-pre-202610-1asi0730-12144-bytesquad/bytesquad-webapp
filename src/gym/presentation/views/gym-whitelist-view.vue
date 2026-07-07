<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n }   from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useGymStore }           from '@/gym/application/gym.store.js';
import { useAuthorizedDniStore } from '@/gym/application/authorized-dni.store.js';

const { t }   = useI18n();
const router  = useRouter();
const gymStore = useGymStore();
const dniStore = useAuthorizedDniStore();

const gymId = computed(() => gymStore.currentGym?.id);

onMounted(() => {
  if (gymId.value) dniStore.load(gymId.value);
});

// ── Add ────────────────────────────────────────────────────────────────────
const newDni   = ref('');
const addError = ref(null);

async function submitAdd() {
  const val = newDni.value.trim();
  if (!val) return;
  addError.value = null;
  try {
    await dniStore.add(gymId.value, val);
    newDni.value = '';
  } catch (e) {
    if (e.status === 400)      addError.value = t('whitelist.error.invalid');
    else if (e.status === 409) addError.value = t('whitelist.error.duplicate');
    else                       addError.value = t('whitelist.error.generic');
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────
const pendingDeleteDni = ref(null);
const removeError      = ref(null);

function requestDelete(dni) {
  pendingDeleteDni.value = dni;
  removeError.value      = null;
}

async function confirmDelete() {
  try {
    await dniStore.remove(gymId.value, pendingDeleteDni.value);
    pendingDeleteDni.value = null;
  } catch {
    removeError.value      = t('whitelist.error.generic');
    pendingDeleteDni.value = null;
  }
}
</script>

<template>
  <div class="page">

    <div class="page__header">
      <button class="back-btn" @click="router.push('/profile')">
        <span class="material-icons">arrow_back</span>
      </button>
      <div>
        <h1 class="page__title">{{ t('whitelist.title') }}</h1>
        <p class="page__subtitle" v-if="gymStore.currentGym?.name">{{ gymStore.currentGym.name }}</p>
      </div>
    </div>

    <!-- Load error -->
    <div v-if="dniStore.error && !dniStore.loading && dniStore.dnis.length === 0" class="alert alert--error">
      {{ dniStore.error }}
    </div>

    <!-- Remove error (transient) -->
    <div v-if="removeError" class="alert alert--error">{{ removeError }}</div>

    <!-- Add form -->
    <div class="card section">
      <h2 class="section-title">{{ t('whitelist.add.title') }}</h2>
      <div class="add-row">
        <input
          v-model="newDni"
          :placeholder="t('whitelist.add.placeholder')"
          maxlength="8"
          inputmode="numeric"
          pattern="[0-9]*"
          @keydown.enter="submitAdd"
          :disabled="dniStore.loading"
        />
        <button class="btn btn--primary"
          :disabled="dniStore.loading || !newDni.trim()"
          @click="submitAdd">
          <span class="material-icons btn__icon">person_add</span>
          {{ t('whitelist.add.btn') }}
        </button>
      </div>
      <div v-if="addError" class="alert alert--error add-error">{{ addError }}</div>
    </div>

    <!-- DNI list -->
    <div class="card" style="padding:0;overflow:hidden">

      <!-- Loading skeleton -->
      <div v-if="dniStore.loading && dniStore.dnis.length === 0" class="skeleton-wrap">
        <div v-for="i in 3" :key="i" class="skeleton-row">
          <div class="skeleton skeleton--line" />
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="!dniStore.loading && dniStore.dnis.length === 0" class="empty-state">
        <span class="material-icons" style="font-size:36px;color:var(--text-secondary)">how_to_reg</span>
        <p style="color:var(--text-secondary);font-size:.85rem">{{ t('whitelist.empty') }}</p>
      </div>

      <!-- Table -->
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>{{ t('whitelist.list.dniCol') }}</th>
            <th style="width:1%">{{ t('whitelist.list.actionsCol') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in dniStore.dnis" :key="entry.dni">
            <td class="dni-cell">
              <span class="material-icons" style="font-size:15px;color:var(--text-secondary);vertical-align:middle;margin-right:.35rem">badge</span>
              {{ entry.dni }}
            </td>
            <td class="actions-cell">
              <!-- Confirm state -->
              <template v-if="pendingDeleteDni === entry.dni">
                <div class="confirm-zone">
                  <span class="confirm-msg">
                    <span class="material-icons" style="font-size:14px;flex-shrink:0">warning</span>
                    {{ t('whitelist.delete.confirm') }}
                  </span>
                  <div class="confirm-btns">
                    <button class="btn btn--danger btn--sm"
                      :disabled="dniStore.loading"
                      @click="confirmDelete">
                      {{ t('whitelist.delete.ok') }}
                    </button>
                    <button class="btn btn--outline btn--sm"
                      :disabled="dniStore.loading"
                      @click="pendingDeleteDni = null">
                      {{ t('whitelist.delete.cancel') }}
                    </button>
                  </div>
                </div>
              </template>

              <!-- Delete button -->
              <button v-else class="btn btn--icon"
                :disabled="dniStore.loading || pendingDeleteDni !== null"
                @click="requestDelete(entry.dni)"
                :title="t('whitelist.delete.btn')">
                <span class="material-icons" style="font-size:16px;color:var(--red)">delete</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
.page__header { align-items: flex-start; display: flex; gap: .75rem; margin-bottom: 1.25rem; }
.back-btn { align-items: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 8px; color: var(--text-secondary); cursor: pointer; display: flex; flex-shrink: 0; padding: .35rem; transition: color .15s; }
.back-btn:hover { color: var(--text-primary); }
.page__subtitle { color: var(--text-secondary); font-size: .8rem; margin-top: .15rem; }

/* Add form */
.section { margin-bottom: 1rem; }
.section-title { font-size: .9rem; font-weight: 600; margin-bottom: .75rem; }
.add-row { display: flex; gap: .75rem; }
.add-row input { flex: 1; }
.add-error { margin-top: .5rem; }
.btn__icon { font-size: 15px; margin-right: 2px; vertical-align: middle; }

/* Alerts */
.alert { border-radius: var(--radius); font-size: .8rem; margin-bottom: 1rem; padding: .5rem .75rem; }
.alert--error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: var(--red); }

/* Table */
.data-table { border-collapse: collapse; font-size: .85rem; width: 100%; }
.data-table th { background: var(--bg-surface); border-bottom: 1px solid var(--border); color: var(--text-secondary); font-size: .78rem; font-weight: 500; padding: .5rem .75rem; text-align: left; }
.data-table td { border-bottom: 1px solid rgba(255,255,255,.04); padding: .45rem .75rem; vertical-align: middle; }
.data-table tr:last-child td { border-bottom: none; }
.dni-cell { font-family: monospace; font-size: .88rem; letter-spacing: .03em; }
.actions-cell { white-space: nowrap; }

/* Confirm zone */
.confirm-zone { align-items: flex-start; display: flex; flex-direction: column; gap: .4rem; padding: .25rem 0; }
.confirm-msg { align-items: flex-start; color: var(--accent); display: flex; font-size: .75rem; gap: .25rem; line-height: 1.35; max-width: 340px; }
.confirm-btns { display: flex; gap: .4rem; }
.btn--sm { font-size: .78rem; padding: .28rem .65rem; }
.btn--danger { background: rgba(239,68,68,.12); border: 1px solid rgba(239,68,68,.3); border-radius: var(--radius); color: var(--red); cursor: pointer; font-weight: 600; transition: opacity .15s; }
.btn--danger:disabled { cursor: not-allowed; opacity: .4; }
.btn--danger:not(:disabled):hover { opacity: .8; }

/* Skeleton */
.skeleton-wrap { padding: .5rem .75rem; }
.skeleton-row { padding: .45rem 0; }
.skeleton { animation: pulse 1.4s ease-in-out infinite; background: var(--border); border-radius: 4px; }
.skeleton--line { height: 14px; width: 60%; }
@keyframes pulse { 0%,100% { opacity: .5; } 50% { opacity: 1; } }

/* Empty state */
.empty-state { align-items: center; display: flex; flex-direction: column; gap: .75rem; padding: 2.5rem; text-align: center; }

@media (max-width: 500px) {
  .add-row { flex-direction: column; }
  .confirm-msg { max-width: 100%; }
}
</style>
