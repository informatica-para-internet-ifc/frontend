<script setup>
import './createActivityShared.css'

defineProps({
  isEditMode: { type: Boolean, required: true },
  blockCount: { type: Number, required: true },
  hasCollapsedBlocks: { type: Boolean, required: true },
  viewMode: { type: String, required: true },
  isSaving: { type: Boolean, required: true },
})

const emit = defineEmits(['back', 'toggle-collapse-all', 'update:viewMode', 'save'])
</script>

<template>
  <div class="createHeader animate-fade-in-up">
    <button class="backBtn" @click="emit('back')">
      <i class="mdi mdi-arrow-left"></i>
    </button>
    <div class="headerInfo">
      <h1 class="pageTitle">{{ isEditMode ? 'Editar Atividade' : 'Criar Atividade' }}</h1>
      <p class="pageDesc">{{ isEditMode ? 'Altere os blocos e salve as mudanças.' : 'Monte a atividade com blocos de conteúdo.' }}</p>
    </div>
    <div class="headerActions">
      <span class="blockCounter" v-if="blockCount > 0">
        <i class="mdi mdi-cube-outline"></i>
        {{ blockCount }} bloco{{ blockCount !== 1 ? 's' : '' }}
      </span>
      <button v-if="blockCount > 1" class="collapseAllBtn" title="Recolher todos os blocos" @click="emit('toggle-collapse-all')">
        <i class="mdi" :class="hasCollapsedBlocks ? 'mdi-arrow-expand-vertical' : 'mdi-arrow-collapse-vertical'"></i>
        {{ hasCollapsedBlocks ? 'Expandir tudo' : 'Recolher tudo' }}
      </button>
      <div class="viewModeToggle">
        <button
          class="viewModeBtn"
          :class="{ active: viewMode === 'edit' }"
          title="Editar"
          @click="emit('update:viewMode', 'edit')"
        >
          <i class="mdi mdi-pencil"></i>
          <span>Editar</span>
        </button>
        <button
          class="viewModeBtn"
          :class="{ active: viewMode === 'preview' }"
          title="Visualizar"
          @click="emit('update:viewMode', 'preview')"
        >
          <i class="mdi mdi-eye-outline"></i>
          <span>Visualizar</span>
        </button>
      </div>
      <button class="saveBtn" @click="emit('save')" :disabled="isSaving" title="Salvar (Ctrl+S)">
        <i :class="isSaving ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-content-save-outline'"></i>
        {{ isSaving ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Salvar') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.createHeader {
  position: sticky;
  top: var(--header-h);
  z-index: 40;
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  margin: 0 calc(-1 * var(--sp-6)) var(--sp-6);
  padding: var(--sp-4) var(--sp-6);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-1);
  box-shadow: var(--shadow-sm);
}

.headerInfo {
  flex: 1;
  min-width: 0;
}

.pageTitle {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--sp-1);
}

.pageDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.headerActions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.blockCounter {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-weight: 600;
}

.collapseAllBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.collapseAllBtn:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.viewModeToggle {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
}

.viewModeBtn {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--color-text-4);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.viewModeBtn:hover {
  color: var(--color-navy-accent);
}

.viewModeBtn.active {
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
}

@media (max-width: 768px) {
  .createHeader {
    flex-wrap: wrap;
  }

  .headerActions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .pageTitle {
    font-size: var(--text-xl);
  }
}
</style>
