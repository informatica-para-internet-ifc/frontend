<script setup>
defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmar ação' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirmar' },
  cancelLabel: { type: String, default: 'Cancelar' },
  danger: { type: Boolean, default: false },
})

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="confirmOverlay" @click.self="emit('cancel')">
      <div class="confirmModal animate-scale-in">
        <div class="confirmIcon" :class="{ danger }">
          <i class="mdi mdi-alert-circle-outline"></i>
        </div>
        <h3 class="confirmTitle">{{ title }}</h3>
        <p class="confirmMessage">{{ message }}</p>
        <div class="confirmActions">
          <button class="confirmBtn confirmBtnCancel" @click="emit('cancel')">
            {{ cancelLabel }}
          </button>
          <button class="confirmBtn" :class="danger ? 'confirmBtnDanger' : 'confirmBtnPrimary'" @click="emit('confirm')">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.confirmOverlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  backdrop-filter: blur(4px);
  z-index: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-6);
}

.confirmModal {
  width: 100%;
  max-width: 400px;
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-border-2);
  box-shadow: var(--shadow-xl);
  padding: var(--sp-8);
  text-align: center;
}

.confirmIcon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--sp-5);
}

.confirmIcon i {
  font-size: 2rem;
  color: var(--color-navy-accent);
}

.confirmIcon.danger {
  background: var(--color-danger-muted);
}

.confirmIcon.danger i {
  color: var(--color-danger);
}

.confirmTitle {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-1);
  margin-bottom: var(--sp-3);
}

.confirmMessage {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--sp-6);
}

.confirmActions {
  display: flex;
  gap: var(--sp-3);
}

.confirmBtn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
  border: none;
  font-family: inherit;
}

.confirmBtnCancel {
  background: var(--color-surface-3);
  color: var(--color-text-3);
  border: 1px solid var(--color-border-2);
}

.confirmBtnCancel:hover {
  background: var(--color-surface-4);
}

.confirmBtnPrimary {
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
}

.confirmBtnPrimary:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.confirmBtnDanger {
  background: var(--color-danger);
  color: #ffffff;
}

.confirmBtnDanger:hover {
  background: var(--color-danger-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
}

.fade-enter-active {
  transition: opacity 0.25s var(--ease-out);
}

.fade-leave-active {
  transition: opacity 0.2s var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
