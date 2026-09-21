<script setup>
defineProps({
  block: { type: Object, required: true },
})
</script>

<template>
  <div class="viewBlock viewList">
    <ul class="listItemsEl">
      <li v-for="(item, i) in block.items.filter(Boolean)" :key="i" class="listItemRow">
        <span v-if="block.ordered" class="listMarkerNum">{{ i + 1 }}</span>
        <span v-else class="listMarkerDot"><i class="mdi mdi-circle-small"></i></span>
        <span class="listItemText">{{ item }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.viewList {
  padding: 0;
  background: transparent;
  border: none;
}

.listItemsEl {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.listItemRow {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  transition: border-color var(--duration-fast) var(--ease-out), background var(--duration-fast) var(--ease-out);
}

.listItemRow:hover {
  border-color: var(--color-navy-accent);
  background: var(--color-surface-3);
}

.listMarkerNum {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
  font-size: 0.7rem;
  font-weight: 700;
  margin-top: 1px;
}

.listMarkerDot {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  color: var(--color-navy-accent);
  font-size: 1.3rem;
  margin-top: -2px;
}

.listItemText {
  color: var(--color-text-2);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  padding-top: 1px;
}
</style>
