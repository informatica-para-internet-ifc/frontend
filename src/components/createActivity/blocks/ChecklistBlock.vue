<script setup>
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })

function addCheckItem() {
  block.value.items.push({ text: '', done: false })
}

function removeCheckItem(idx) {
  if (block.value.items.length > 1) block.value.items.splice(idx, 1)
}
</script>

<template>
  <div v-for="(it, i) in block.items" :key="i" class="checkRow">
    <label class="checkToggle">
      <input type="checkbox" v-model="it.done" />
      <span class="checkToggleBox"><i class="mdi mdi-check"></i></span>
    </label>
    <input
      v-model="it.text"
      class="checkInput"
      :class="{ done: it.done }"
      :placeholder="`Requisito ${i + 1}`"
    />
    <button class="listItemRemove" @click="removeCheckItem(i)" :disabled="block.items.length <= 1">
      <i class="mdi mdi-close"></i>
    </button>
  </div>
  <button type="button" class="addListItemBtn" @click="addCheckItem()">
    <i class="mdi mdi-plus"></i>
    Adicionar requisito
  </button>
</template>

<style scoped>
.checkRow {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.checkInput {
  flex: 1;
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-1);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  padding: var(--sp-2) var(--sp-3);
  transition: all var(--duration-fast) var(--ease-out);
}

.checkInput:focus {
  outline: none;
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 0 3px var(--color-navy-accent-muted);
}

.checkInput.done {
  text-decoration: line-through;
  color: var(--color-text-5);
}
</style>
