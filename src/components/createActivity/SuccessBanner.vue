<script setup>
import { RouterLink } from 'vue-router'
import './createActivityShared.css'

defineProps({
  atividade: { type: Object, default: null },
  discId: { type: String, default: null },
})

defineEmits(['new'])
</script>

<template>
  <Transition name="error-banner">
    <div v-if="atividade" class="successBanner animate-fade-in-up">
      <div class="successBannerIcon">
        <i class="mdi mdi-check-circle-outline"></i>
      </div>
      <div class="successBannerText">
        <strong>Atividade criada com sucesso!</strong>
        <p>"{{ atividade.title }}" foi salva na disciplina.</p>
      </div>
      <div class="successBannerActions">
        <RouterLink
          :to="`/atividade/${discId}/${atividade.id}`"
          class="successBtn successBtnPrimary"
        >
          <i class="mdi mdi-eye-outline"></i>
          Ver atividade
        </RouterLink>
        <button class="successBtn" @click="$emit('new')">
          <i class="mdi mdi-plus-circle-outline"></i>
          Criar outra
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.successBanner {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-5) var(--sp-6);
  border-radius: var(--radius-lg);
  background: var(--color-success-muted, rgba(34, 197, 94, 0.1));
  border: 1px solid rgba(34, 197, 94, 0.2);
  margin-bottom: var(--sp-4);
}

.successBannerIcon {
  flex-shrink: 0;
}

.successBannerIcon i {
  font-size: 1.8rem;
  color: var(--color-success, #22c55e);
}

.successBannerText {
  flex: 1;
}

.successBannerText strong {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-success, #22c55e);
  display: block;
  margin-bottom: 2px;
}

.successBannerText p {
  font-size: var(--text-xs);
  color: var(--color-text-4);
}

.successBannerActions {
  display: flex;
  gap: var(--sp-2);
  flex-shrink: 0;
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
