<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function openSearch() {
  router.push({ name: 'search' })
}
</script>

<template>
  <button class="searchBtn" aria-label="Buscar" @click="openSearch">
    <i class="mdi mdi-magnify"></i>
  </button>
</template>

<style scoped>
.searchBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-2);
  color: var(--color-text-3);
  font-size: 1.15rem;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
  flex-shrink: 0;
}

.searchBtn:hover {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  box-shadow: var(--shadow-glow-sm);
  transform: scale(1.05);
}

.searchBtn:active {
  transform: scale(0.92);
}
</style>
