<script setup>
defineProps({
  show: { type: Boolean, required: true },
  atividadeTitle: { type: String, default: '' },
  isDeleting: { type: Boolean, default: false },
})

defineEmits(['cancel', 'confirm'])
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="modalOverlay" @click.self="$emit('cancel')">
      <div class="deleteModal animate-scale-in">
        <div class="modalIcon">
          <i class="mdi mdi-alert-circle-outline"></i>
        </div>
        <h3 class="modalTitle">Excluir atividade?</h3>
        <p class="modalDesc">
          Tem certeza que deseja excluir <strong>{{ atividadeTitle }}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        <div class="modalActions">
          <button class="modalBtn modalBtnCancel" :disabled="isDeleting" @click="$emit('cancel')">
            Cancelar
          </button>
          <button class="modalBtn modalBtnDelete" :disabled="isDeleting" @click="$emit('confirm')">
            <i :class="isDeleting ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-delete-outline'"></i>
            {{ isDeleting ? 'Excluindo...' : 'Excluir' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modalOverlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  backdrop-filter: blur(4px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-6);
}

.deleteModal {
  width: 100%;
  max-width: 400px;
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-border-2);
  box-shadow: var(--shadow-xl);
  padding: var(--sp-8);
  text-align: center;
}

.modalIcon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: var(--color-danger-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--sp-5);
}

.modalIcon i {
  font-size: 2rem;
  color: var(--color-danger);
}

.modalTitle {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-1);
  margin-bottom: var(--sp-3);
}

.modalDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--sp-6);
}

.modalDesc strong {
  color: var(--color-text-2);
}

.modalActions {
  display: flex;
  gap: var(--sp-3);
}

.modalBtn {
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
}

.modalBtnCancel {
  background: var(--color-surface-3);
  color: var(--color-text-3);
  border: 1px solid var(--color-border-2);
}

.modalBtnCancel:hover {
  background: var(--color-surface-4);
}

.modalBtnDelete {
  background: var(--color-danger);
  color: #ffffff;
}

.modalBtnDelete:hover {
  background: var(--color-danger-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
}

.modalBtn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
