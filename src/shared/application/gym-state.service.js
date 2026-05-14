import { ref } from 'vue';

const machines = ref([
  { id: '1', nameKey: 'cinta1',              muscleGroupKey: 'cardio', status: 'AVAILABLE', category: 'CARDIO',   top: '22%', left: '18%', icon: 'directions_run' },
  { id: '2', nameKey: 'prensaPiernas',       muscleGroupKey: 'legs',   status: 'AVAILABLE', category: 'STRENGTH', top: '22%', left: '48%', icon: 'fitness_center' },
  { id: '3', nameKey: 'poleaAlta',           muscleGroupKey: 'back',   status: 'AVAILABLE', category: 'STRENGTH', top: '22%', left: '76%', icon: 'fitness_center' },
  { id: '4', nameKey: 'cinta2',              muscleGroupKey: 'cardio', status: 'AVAILABLE', category: 'CARDIO',   top: '48%', left: '18%', icon: 'directions_run' },
  { id: '5', nameKey: 'rackSentadilla1',     muscleGroupKey: 'legs',   status: 'RESERVED',  category: 'STRENGTH', top: '48%', left: '48%', icon: 'fitness_center', timerSeconds: 599 },
  { id: '6', nameKey: 'remo',                muscleGroupKey: 'back',   status: 'IN_USE',    category: 'CARDIO',   top: '48%', left: '76%', icon: 'rowing' },
  { id: '7', nameKey: 'eliptica',            muscleGroupKey: 'cardio', status: 'IN_USE',    category: 'CARDIO',   top: '72%', left: '18%', icon: 'directions_bike' },
  { id: '8', nameKey: 'bancoPecho',          muscleGroupKey: 'chest',  status: 'IN_USE',    category: 'STRENGTH', top: '72%', left: '48%', icon: 'fitness_center' },
  { id: '9', nameKey: 'bancoPechoInclinado', muscleGroupKey: 'chest',  status: 'AVAILABLE', category: 'STRENGTH', top: '72%', left: '76%', icon: 'fitness_center' },
]);

function setMachineAsReserved(machineId, durationSeconds) {
  machines.value = machines.value.map(m =>
    m.id === machineId ? { ...m, status: 'RESERVED', timerSeconds: durationSeconds } : m
  );
}

function setMachineAsAvailable(machineId) {
  machines.value = machines.value.map(m =>
    m.id === machineId ? { ...m, status: 'AVAILABLE', timerSeconds: undefined } : m
  );
}

function tickReservedMachines() {
  const expired = [];
  machines.value = machines.value.map(m => {
    if (m.status !== 'RESERVED' || m.timerSeconds === undefined) return m;
    if (m.timerSeconds <= 1) {
      expired.push({ machineId: m.id, nameKey: m.nameKey, icon: m.icon, category: m.category });
      return { ...m, status: 'AVAILABLE', timerSeconds: undefined };
    }
    return { ...m, timerSeconds: m.timerSeconds - 1 };
  });
  return expired;
}

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function getZoneKey(category) {
  return category === 'STRENGTH' ? 'fuerza' : 'cardio';
}

export const gymState = { machines, setMachineAsReserved, setMachineAsAvailable, tickReservedMachines, formatTimer, getZoneKey };
