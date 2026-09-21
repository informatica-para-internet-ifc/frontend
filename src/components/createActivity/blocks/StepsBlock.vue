<script setup>
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })

function addStepItem() {
  block.value.steps.push({ title: '', desc: '' })
}

function removeStepItem(idx) {
  if (block.value.steps.length > 1) block.value.steps.splice(idx, 1)
}
</script>

<template>
  <div v-for="(st, i) in block.steps" :key="i" class="stepEditor">
    <span class="stepNumber">{{ String(i + 1).padStart(2, '0') }}</span>
    <div class="stepEditorFields">
      <input
        v-model="st.title"
        class="blockInput"
        :placeholder="`Título do passo ${i + 1}`"
      />
      <textarea
        v-model="st.desc"
        class="blockTextarea blockTextareaSmall"
        :placeholder="`Descrição do passo ${i + 1} (opcional)`"
        rows="2"
      ></textarea>
      <button class="listItemRemove stepRemoveBtn" @click="removeStepItem(i)" :disabled="block.steps.length <= 1">
        <i class="mdi mdi-close"></i>
      </button>
    </div>
  </div>
  <button type="button" class="addListItemBtn" @click="addStepItem()">
    <i class="mdi mdi-plus"></i>
    Adicionar passo
  </button>
</template>

<style scoped>
.stepEditor {
  display: flex;
  gap: var(--sp-3);
}

.stepNumber {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 700;
  flex-shrink: 0;
}

.stepEditorFields {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.stepRemoveBtn {
  position: absolute;
  top: 0;
  right: 0;
}
</style>
