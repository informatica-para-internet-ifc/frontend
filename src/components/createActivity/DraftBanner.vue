<script setup>
import './createActivityShared.css'

defineProps({
  show: { type: Boolean, default: false },
})

defineEmits(['restore', 'discard'])
</script>

<template>
  <Transition name="error-banner">
    <div v-if="show" class="draftBanner animate-fade-in-up">
      <div class="draftBannerIcon">
        <i class="mdi mdi-file-restore-outline"></i>
      </div>
      <div class="draftBannerText">
        <strong>Encontramos um rascunho não salvo</strong>
        <p>Deseja continuar de onde parou ou começar do zero?</p>
      </div>
      <div class="draftBannerActions">
        <button class="successBtn successBtnPrimary" @click="$emit('restore')">
          <i class="mdi mdi-file-restore-outline"></i>
          Restaurar
        </button>
        <button class="successBtn" @click="$emit('discard')">
          <i class="mdi mdi-trash-can-outline"></i>
          Descartar
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.draftBanner {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--radius-lg);
  background: var(--color-info-muted);
  border: 1px solid var(--color-info);
  margin-bottom: var(--sp-4);
}

.draftBannerIcon {
  flex-shrink: 0;
}

.draftBannerIcon i {
  font-size: 1.6rem;
  color: var(--color-info);
}

.draftBannerText {
  flex: 1;
  min-width: 0;
}

.draftBannerText strong {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-1);
  display: block;
  margin-bottom: 2px;
}

.draftBannerText p {
  font-size: var(--text-xs);
  color: var(--color-text-4);
}

.draftBannerActions {
  display: flex;
  gap: var(--sp-2);
  flex-shrink: 0;
}

@media (max-width: 560px) {
  .draftBanner {
    flex-wrap: wrap;
  }

  .draftBannerActions {
    width: 100%;
  }

  .draftBannerActions .successBtn {
    flex: 1;
    justify-content: center;
  }
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
