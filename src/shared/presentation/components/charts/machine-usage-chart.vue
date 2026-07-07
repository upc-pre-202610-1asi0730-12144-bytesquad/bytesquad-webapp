<script setup>
defineProps({
  bars:     { type: Array,  required: true },
  maxHours: { type: Number, required: true },
});

function fmt(n, dec = 0) {
  if (n == null) return '—';
  return Number(n).toLocaleString('es-PE', { maximumFractionDigits: dec });
}
function shortName(n) { return n.length > 14 ? n.slice(0, 12) + '…' : n; }
</script>

<template>
  <div v-if="!bars.length" class="chart-state">
    <span class="material-icons">fitness_center</span>
    <span>Sin datos disponibles</span>
  </div>
  <div v-else class="machine-list">
    <div v-for="bar in bars" :key="bar.name" class="machine-row">
      <span class="machine-name">{{ shortName(bar.name) }}</span>
      <div class="machine-track">
        <div class="machine-fill" :style="{ width: (bar.totalUsageHours / maxHours * 100) + '%' }"></div>
      </div>
      <span class="machine-hours">{{ fmt(bar.totalUsageHours) }}h</span>
      <span class="machine-rsv">{{ bar.reservationCount }} rsv</span>
    </div>
  </div>
</template>

<style scoped>
.chart-state { align-items: center; color: var(--text-secondary); display: flex; flex-direction: column; font-size: 0.85rem; gap: 0.5rem; height: 180px; justify-content: center; }
.machine-list { display: flex; flex-direction: column; gap: 0.75rem; }
.machine-row { align-items: center; display: grid; gap: 0.5rem; grid-template-columns: 120px 1fr auto auto; }
.machine-name { color: var(--text-primary); font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.machine-track { background: rgba(255,255,255,.07); border-radius: 3px; height: 8px; overflow: hidden; }
.machine-fill { background: var(--accent); border-radius: 3px; height: 100%; transition: width .3s; }
.machine-hours { color: var(--text-secondary); font-size: 0.75rem; text-align: right; white-space: nowrap; }
.machine-rsv { color: var(--text-secondary); font-size: 0.75rem; min-width: 52px; text-align: right; white-space: nowrap; }
</style>
