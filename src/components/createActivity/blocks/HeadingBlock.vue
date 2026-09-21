<script setup>
const block = defineModel('block', { type: Object, required: true })
</script>

<template>
  <div class="headingRow">
    <select v-model="block.level" class="headingLevel">
      <option :value="1">H1</option>
      <option :value="2">H2</option>
      <option :value="3">H3</option>
    </select>
    <input
      v-model="block.content"
      class="headingInput"
      :placeholder="`Título nível ${block.level}`"
    />
  </div>
</template>

<style scoped>
.headingRow {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.headingLevel {
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-navy-accent);
  font-size: var(--text-sm);
  font-weight: 700;
  font-family: var(--font-sans);
  cursor: pointer;
}

.headingInput {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-1);
  font-family: var(--font-sans);
  padding: var(--sp-2) 0;
  border-bottom: 2px solid var(--color-border-1);
  transition: border-color var(--duration-fast) var(--ease-out);
}

.headingInput:focus {
  border-bottom-color: var(--color-navy-accent);
}
</style>
