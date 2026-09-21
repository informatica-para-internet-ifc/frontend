<script setup>
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })

function addListItem() {
  block.value.items.push('')
}

function removeListItem(idx) {
  if (block.value.items.length > 1) block.value.items.splice(idx, 1)
}
</script>

<template>
  <div class="listControls">
    <button class="listTypeBtn" :class="{ active: !block.ordered }" @click="block.ordered = false">
      <i class="mdi mdi-format-list-bulleted"></i>
      Marcadores
    </button>
    <button class="listTypeBtn" :class="{ active: block.ordered }" @click="block.ordered = true">
      <i class="mdi mdi-format-list-numbered"></i>
      Numerada
    </button>
  </div>
  <div class="listItems">
    <div v-for="(item, i) in block.items" :key="i" class="listItemRow">
      <span class="listMarker">{{ block.ordered ? `${i + 1}.` : '•' }}</span>
      <input
        v-model="block.items[i]"
        class="listItemInput"
        :placeholder="`Item ${i + 1}`"
        @keydown.enter="addListItem()"
      />
      <button class="listItemRemove" @click="removeListItem(i)" :disabled="block.items.length <= 1">
        <i class="mdi mdi-close"></i>
      </button>
    </div>
    <button class="addListItemBtn" @click="addListItem()">
      <i class="mdi mdi-plus"></i>
      Adicionar item
    </button>
  </div>
</template>

<style scoped>
.listControls {
  display: flex;
  gap: var(--sp-2);
}

.listTypeBtn {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.listTypeBtn.active {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.listItems {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.listItemRow {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.listMarker {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.listItemInput {
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

.listItemInput:focus {
  outline: none;
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 0 3px var(--color-navy-accent-muted);
}
</style>
