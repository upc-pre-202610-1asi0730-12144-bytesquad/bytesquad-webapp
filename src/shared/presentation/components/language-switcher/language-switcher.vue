<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const open       = ref(false);
const wrapper    = ref(null);

const langs = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
];

function select(code) {
  locale.value = code;
  localStorage.setItem('spottrack_lang', code);
  open.value = false;
}

function onClickOutside(e) {
  if (wrapper.value && !wrapper.value.contains(e.target)) {
    open.value = false;
  }
}

onMounted(()       => document.addEventListener('click', onClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside));
</script>

<template>
  <div ref="wrapper" class="lang-switcher">
    <button class="lang-btn" @click.stop="open = !open">
      {{ locale.toUpperCase() }} {{ langs.find(l => l.code === locale)?.name }}
      <span class="material-icons" style="font-size:16px">{{ open ? 'expand_less' : 'expand_more' }}</span>
    </button>
    <div v-if="open" class="lang-menu">
      <button
        v-for="l in langs"
        :key="l.code"
        class="lang-menu__item"
        :class="{ active: locale === l.code }"
        @click.stop="select(l.code)"
      >
        {{ l.name }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.lang-switcher { position: relative; }
.lang-btn { align-items: center; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 6px; color: var(--text-secondary); cursor: pointer; display: flex; font-size: 0.75rem; font-weight: 600; gap: 4px; padding: 0.25rem 0.5rem; white-space: nowrap; }
.lang-menu { background: var(--bg-card); border: 1px solid var(--border); border-radius: 6px; min-width: 110px; position: absolute; right: 0; top: calc(100% + 4px); z-index: 300; }
.lang-menu__item { background: none; border: none; color: var(--text-primary); cursor: pointer; display: block; font-size: 0.8rem; padding: 0.5rem 0.75rem; text-align: left; width: 100%; }
.lang-menu__item:hover { background: rgba(255,255,255,.05); }
.lang-menu__item.active { color: var(--accent); }
</style>
