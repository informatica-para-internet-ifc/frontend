<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="notFoundView">
    <div class="pageDeco">
      <div class="pageDecoDots"></div>
      <div class="pageDecoGrid"></div>
    </div>

    <div class="notFoundContent">
      <div class="notFoundBadge animate-scale-in">
        <i class="mdi mdi-ghost-outline"></i>
      </div>
      <div class="notFoundCode animate-fade-in-up delay-1">404</div>
      <h1 class="notFoundTitle animate-fade-in-up delay-2">Página não encontrada</h1>
      <p class="notFoundDesc animate-fade-in-up delay-3">
        O endereço que você acessou não existe ou foi movido.
      </p>
      <RouterLink to="/" class="backHome animate-fade-in-up delay-4">
        <i class="mdi mdi-home-outline"></i>
        Voltar ao início
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.notFoundView {
  position: relative;
  min-height: calc(100vh - var(--header-h));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-6);
}

.notFoundContent {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
}

.notFoundBadge {
  width: 88px;
  height: 88px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  border: 1px dashed var(--color-border-2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--sp-2);
  transition: all var(--duration-normal) var(--ease-spring);
}

.notFoundBadge:hover {
  transform: scale(1.05);
  border-color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
}

.notFoundBadge i {
  font-size: 2.5rem;
  color: var(--color-text-5);
  transition: color var(--duration-fast) var(--ease-out);
}

.notFoundBadge:hover i {
  color: var(--color-navy-accent);
}

.notFoundCode {
  font-size: 7rem;
  font-weight: 900;
  color: var(--color-text-5);
  line-height: 1;
  letter-spacing: var(--tracking-tight);
}

.notFoundTitle {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--color-text-1);
}

.notFoundDesc {
  font-size: var(--text-md);
  color: var(--color-text-4);
  max-width: 400px;
}
</style>
