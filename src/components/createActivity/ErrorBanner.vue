<script setup>
defineProps({
  show: { type: Boolean, default: false },
  errorCount: { type: Number, default: 0 },
})
</script>

<template>
  <Transition name="error-banner">
    <div v-if="show && errorCount > 0" class="errorBanner animate-fade-in-up">
      <div class="errorBannerIcon">
        <i class="mdi mdi-alert-circle-outline"></i>
      </div>
      <div class="errorBannerText">
        <strong>Corrija os erros antes de salvar</strong>
        <p>{{ errorCount }} campo{{ errorCount > 1 ? 's' : '' }} precisa{{ errorCount === 1 ? '' : 'm' }} de atenção.</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.errorBanner {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--radius-lg);
  background: var(--color-danger-muted);
  border: 1px solid rgba(248, 113, 113, 0.2);
  margin-bottom: var(--sp-4);
}

.errorBannerIcon {
  flex-shrink: 0;
}

.errorBannerIcon i {
  font-size: 1.5rem;
  color: var(--color-danger);
}

.errorBannerText strong {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-danger);
}

.errorBannerText p {
  font-size: var(--text-xs);
  color: var(--color-text-4);
  margin-top: 2px;
}

.error-banner-enter-active {
  transition: all 0.3s var(--ease-spring);
}

.error-banner-leave-active {
  transition: all 0.2s var(--ease-out);
}

.error-banner-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.error-banner-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
