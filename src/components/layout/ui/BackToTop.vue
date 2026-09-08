<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const visible = ref(false)

function onScroll() {
  visible.value = window.scrollY > 480
}

function toTop() {
  const reduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <Transition name="btt">
    <button v-if="visible" class="backToTop" type="button" aria-label="Voltar ao topo" @click="toTop">
      <i class="mdi mdi-arrow-up"></i>
    </button>
  </Transition>
</template>

<style scoped>
.backToTop {
  position: fixed;
  right: var(--sp-6);
  bottom: var(--sp-6);
  z-index: 150;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: var(--radius-full);
  background: var(--color-navy);
  border: 1px solid var(--color-border-2);
  color: #ffffff;
  font-size: 1.3rem;
  cursor: pointer;
  box-shadow: 0 6px 24px var(--color-navy-accent-muted);
  transition: all var(--duration-normal) var(--ease-spring);
}

.backToTop:hover {
  background: var(--color-navy-light);
  transform: translateY(-4px);
  box-shadow: 0 10px 32px var(--color-navy-accent-muted);
}

.backToTop:active {
  transform: translateY(0) scale(0.94);
}

.btt-enter-active,
.btt-leave-active {
  transition: opacity 0.3s var(--ease-out), transform 0.3s var(--ease-out);
}

.btt-enter-from,
.btt-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.9);
}
</style>
