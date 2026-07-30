<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'
import AppHeader from '../src/components/layout/header/AppHeader.vue'

const route = useRoute()
const pageKey = computed(() => route.fullPath)
const transitionDir = ref('forward')

watch(
  () => route.path,
  (to, from) => {
    const depth = (p) => p.split('/').filter(Boolean).length
    transitionDir.value = depth(to) >= depth(from || '') ? 'forward' : 'back'
  },
)
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="main">
      <RouterView v-slot="{ Component }">
        <Transition :name="`page-${transitionDir}`" mode="out-in">
          <component :is="Component" :key="pageKey" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<style>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: hidden;
}

.main {
  flex: 1;
  min-height: calc(100vh - var(--header-h));
  animation: mainEnter 0.6s var(--ease-out) both;
}

@keyframes mainEnter {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ── Page transitions ── */
.page-forward-enter-active {
  transition:
    opacity 0.45s var(--ease-out),
    transform 0.45s var(--ease-out),
    filter 0.45s var(--ease-out);
}

.page-forward-leave-active {
  transition:
    opacity 0.2s var(--ease-out),
    transform 0.2s var(--ease-out),
    filter 0.2s var(--ease-out);
}

.page-forward-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
  filter: blur(6px);
}

.page-forward-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
  filter: blur(4px);
}

.page-back-enter-active {
  transition:
    opacity 0.45s var(--ease-out),
    transform 0.45s var(--ease-out),
    filter 0.45s var(--ease-out);
}

.page-back-leave-active {
  transition:
    opacity 0.2s var(--ease-out),
    transform 0.2s var(--ease-out),
    filter 0.2s var(--ease-out);
}

.page-back-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
  filter: blur(6px);
}

.page-back-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
  filter: blur(4px);
}

/* ── Shared animation utilities ── */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.92); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.animate-fade-in-up { animation: fadeInUp 0.6s var(--ease-out) both; }
.animate-fade-in { animation: fadeIn 0.5s var(--ease-out) both; }
.animate-scale-in { animation: scaleIn 0.5s var(--ease-out) both; }
.animate-slide-in-left { animation: slideInLeft 0.5s var(--ease-out) both; }
.animate-slide-in-right { animation: slideInRight 0.5s var(--ease-out) both; }
.animate-slide-down { animation: slideDown 0.4s var(--ease-out) both; }

.delay-1 { animation-delay: 0.1s; }
.delay-2 { animation-delay: 0.2s; }
.delay-3 { animation-delay: 0.3s; }
.delay-4 { animation-delay: 0.4s; }
.delay-5 { animation-delay: 0.5s; }
.delay-6 { animation-delay: 0.6s; }
</style>
