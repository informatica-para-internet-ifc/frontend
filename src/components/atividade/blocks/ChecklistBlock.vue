<script setup>
defineProps({
  block: { type: Object, required: true },
})
</script>

<template>
  <div class="viewBlock viewChecklist">
    <ul class="checklistList">
      <li v-for="(it, ci) in block.items.filter((x) => x.text)" :key="ci" class="checklistItem" :class="{ done: it.done }">
        <i :class="it.done ? 'mdi mdi-checkbox-marked' : 'mdi mdi-checkbox-blank-outline'"></i>
        <span>{{ it.text }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.viewChecklist {
  padding: 0;
  background: transparent;
  border: none;
}

.checklistList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.checklistItem {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  font-size: var(--text-sm);
  color: var(--color-text-2);
}

.checklistItem i {
  color: var(--color-text-5);
  flex-shrink: 0;
  font-size: 1.1rem;
}

.checklistItem.done {
  opacity: 0.65;
}

.checklistItem.done i {
  color: var(--color-success);
}

.checklistItem.done span {
  text-decoration: line-through;
}
</style>
