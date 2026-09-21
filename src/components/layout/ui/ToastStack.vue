<script setup>
import { useToast } from '../../../composables/useToast.js'

const { toasts, dismiss } = useToast()

function iconFor(type) {
  if (type === 'success') return 'mdi-check-circle-outline'
  if (type === 'error') return 'mdi-alert-circle-outline'
  return 'mdi-information-outline'
}
</script>

<template>
  <Teleport to="body">
    <div class="toastStack" role="status" aria-live="polite">
      <TransitionGroup name="toast">
        <div v-for="t in toasts" :key="t.id" class="toastItem" :class="`toast-${t.type}`">
          <i :class="`mdi ${iconFor(t.type)} toastIcon`"></i>
          <p class="toastMsg">{{ t.message }}</p>
          <button class="toastClose" type="button" aria-label="Fechar aviso" @click="dismiss(t.id)">
            <i class="mdi mdi-close"></i>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toastStack {
  position: fixed;
  z-index: 600;
  top: var(--sp-5);
  right: var(--sp-5);
  left: var(--sp-5);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--sp-3);
  pointer-events: none;
}

.toastItem {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  width: 100%;
  max-width: 380px;
  padding: var(--sp-4) var(--sp-4);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  border: 1px solid var(--color-border-2);
  box-shadow: var(--shadow-xl);
  pointer-events: auto;
}

.toastIcon {
  font-size: 1.3rem;
  flex-shrink: 0;
  margin-top: 1px;
}

.toastMsg {
  flex: 1;
  min-width: 0;
  font-size: var(--text-sm);
  color: var(--color-text-2);
  line-height: var(--leading-normal);
  word-break: break-word;
}

.toastClose {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: transparent;
  border: none;
  color: var(--color-text-5);
  cursor: pointer;
  flex-shrink: 0;
  transition: all var(--duration-fast) var(--ease-out);
}

.toastClose:hover {
  background: var(--color-surface-3);
  color: var(--color-text-2);
}

.toast-success {
  border-color: var(--color-success);
}

.toast-success .toastIcon {
  color: var(--color-success);
}

.toast-error {
  border-color: var(--color-danger);
}

.toast-error .toastIcon {
  color: var(--color-danger);
}

.toast-info .toastIcon {
  color: var(--color-navy-accent);
}

.toast-move,
.toast-enter-active,
.toast-leave-active {
  transition: all var(--duration-normal) var(--ease-spring);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-16px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(24px) scale(0.95);
}

.toast-leave-active {
  position: absolute;
  right: 0;
}

@media (max-width: 480px) {
  .toastStack {
    top: var(--sp-3);
    right: var(--sp-3);
    left: var(--sp-3);
    align-items: stretch;
  }

  .toastItem {
    max-width: none;
  }
}
</style>
