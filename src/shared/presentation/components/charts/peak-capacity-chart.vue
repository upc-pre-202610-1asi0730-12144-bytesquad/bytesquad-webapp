<script setup>
defineProps({
  peakHours:       { type: Array,  required: true },
  maxReservations: { type: Number, required: true },
});
</script>

<template>
  <div v-if="!peakHours.length" class="chart-state">
    <span class="material-icons">bar_chart</span>
    <span>Sin datos disponibles</span>
  </div>
  <div v-else class="bar-chart-wrap">
    <div class="bar-chart">
      <div v-for="h in peakHours" :key="h.hour" class="bar-col">
        <span class="bar-count">{{ h.reservationCount }}</span>
        <div class="bar-track">
          <div class="bar-fill" :style="{ height: (h.reservationCount / maxReservations * 100) + '%' }"></div>
        </div>
        <span class="bar-label">{{ String(h.hour).padStart(2, '0') }}h</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chart-state { align-items: center; color: var(--text-secondary); display: flex; flex-direction: column; font-size: 0.85rem; gap: 0.5rem; height: 180px; justify-content: center; }
.bar-chart-wrap { overflow-x: auto; }
.bar-chart { align-items: flex-end; display: flex; gap: 6px; height: 180px; padding: 0 4px; }
.bar-col { align-items: center; display: flex; flex-direction: column; flex: 1; gap: 4px; min-width: 28px; }
.bar-count { color: var(--text-secondary); font-size: 0.65rem; }
.bar-track { background: rgba(255,255,255,.07); border-radius: 4px; flex: 1; position: relative; width: 100%; }
.bar-fill { background: var(--accent); border-radius: 4px; bottom: 0; position: absolute; transition: height .3s; width: 100%; }
.bar-label { color: var(--text-secondary); font-size: 0.65rem; text-align: center; }
</style>
