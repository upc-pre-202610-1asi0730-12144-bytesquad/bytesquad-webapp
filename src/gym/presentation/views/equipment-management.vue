<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useEquipmentStore } from '@/gym/application/equipment.store.js';
import { useAuthStore }      from '@/authentication/application/auth.store.js';
import { EquipmentStatus } from '@/gym/domain/model/equipment.entity.js';

const { t }  = useI18n();
const store  = useEquipmentStore();
const auth   = useAuthStore();
const router = useRouter();

onMounted(() => store.loadEquipment(auth.user.id));

const searchQuery    = ref('');
const selectedStatus = ref('');

const filteredEquipment = computed(() => {
  let list = store.equipment;
  const q = searchQuery.value.toLowerCase().trim();
  if (q) list = list.filter(e => e.name?.toLowerCase().includes(q));
  if (selectedStatus.value) list = list.filter(e => e.status === selectedStatus.value);
  return list;
});

function statusLabel(s) {
  return t(`equipment.status.${s}`) || s;
}
function statusClass(s) {
  if (s === EquipmentStatus.OPERATIONAL || s === EquipmentStatus.AVAILABLE) return 'green';
  if (s === EquipmentStatus.MAINTENANCE) return 'amber';
  return 'red';
}
function deleteEquipment(id) {
  if (confirm(t('equipment.dialog.deleteMessage'))) store.deleteEquipment(id);
}
</script>

<template>
  <div class="page">
    <div class="page__header">
      <h1 class="page__title">{{ t('equipment.title') }}</h1>
      <button class="btn btn--primary" @click="router.push('/equipment/new')">
        <span class="material-icons" style="font-size:16px">add</span> {{ t('equipment.actions.register') }}
      </button>
    </div>

    <div class="stats-row">
      <div class="stat-card card"><span class="stat-n">{{ store.equipmentCount }}</span><span class="stat-l">{{ t('equipment.stats.total') }}</span></div>
      <div class="stat-card card"><span class="stat-n stat-n--green">{{ store.operationalCount }}</span><span class="stat-l">{{ t('equipment.stats.operational') }}</span></div>
      <div class="stat-card card"><span class="stat-n stat-n--amber">{{ store.maintenanceCount }}</span><span class="stat-l">{{ t('equipment.stats.maintenance') }}</span></div>
      <div class="stat-card card"><span class="stat-n stat-n--red">{{ store.outOfOrderCount }}</span><span class="stat-l">{{ t('equipment.stats.outOfOrder') }}</span></div>
    </div>

    <div class="filters card">
      <input v-model="searchQuery" :placeholder="t('equipment.search')" style="flex:1" />
      <select v-model="selectedStatus">
        <option value="">{{ t('equipment.filter.allStatuses') }}</option>
        <option v-for="s in Object.values(EquipmentStatus)" :key="s" :value="s">{{ statusLabel(s) }}</option>
      </select>
    </div>

    <div v-if="store.loading" class="loading-state"><span class="material-icons spin">sync</span></div>
    <div v-else class="card" style="padding:0;overflow:hidden">
      <table class="data-table">
        <thead><tr>
          <th>ID</th>
          <th>{{ t('equipment.table.name') }}</th>
          <th>{{ t('equipment.table.zoneId') }}</th>
          <th>{{ t('equipment.table.status') }}</th>
          <th></th>
        </tr></thead>
        <tbody>
          <tr v-if="!filteredEquipment.length"><td colspan="5" class="table-empty">{{ t('equipment.table.noData') }}</td></tr>
          <tr v-for="eq in filteredEquipment" :key="eq.id">
            <td class="cell-id">{{ eq.id }}</td>
            <td>{{ eq.name }}</td>
            <td>{{ eq.zoneId }}</td>
            <td><span class="badge" :class="`badge--${statusClass(eq.status)}`">{{ statusLabel(eq.status) }}</span></td>
            <td class="actions">
              <button class="btn btn--icon" @click="router.push(`/equipment/${eq.id}/edit`)"><span class="material-icons">edit</span></button>
              <button class="btn btn--icon" style="color:var(--red)" @click="deleteEquipment(eq.id)"><span class="material-icons">delete</span></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.stats-row { display: grid; gap: 1rem; grid-template-columns: repeat(4, 1fr); margin-bottom: 1rem; }
.stat-card { align-items: center; display: flex; flex-direction: column; gap: 0.25rem; }
.stat-n { font-size: 1.75rem; font-weight: 700; }
.stat-n--green { color: var(--green); } .stat-n--amber { color: var(--accent); } .stat-n--red { color: var(--red); }
.stat-l { color: var(--text-secondary); font-size: 0.8rem; }
.filters { display: flex; gap: 0.75rem; margin-bottom: 1rem; }
.data-table { border-collapse: collapse; font-size: 0.85rem; width: 100%; }
.data-table th { background: var(--bg-surface); border-bottom: 1px solid var(--border); color: var(--text-secondary); font-weight: 500; padding: 0.625rem 1rem; text-align: left; }
.data-table td { border-bottom: 1px solid rgba(255,255,255,.04); padding: 0.625rem 1rem; }
.cell-id { color: var(--text-secondary); font-size: 0.8rem; }
.table-empty { color: var(--text-secondary); padding: 1.5rem; text-align: center; }
.actions { display: flex; gap: 4px; }
.loading-state { align-items: center; display: flex; height: 200px; justify-content: center; color: var(--text-secondary); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 900px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
</style>
