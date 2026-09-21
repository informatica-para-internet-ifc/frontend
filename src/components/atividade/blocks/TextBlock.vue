<script setup>
defineProps({
  block: { type: Object, required: true },
})
</script>

<template>
  <div class="viewBlock viewText">
    <p class="plainText">{{ block.content }}</p>
  </div>
</template>

<style scoped>
.viewBlock {
  border-radius: var(--radius-lg);
  padding: var(--sp-6);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  transition: all var(--duration-normal) var(--ease-out);
}

.viewBlock:hover {
  border-color: var(--color-border-2);
  box-shadow: var(--shadow-sm);
}

.viewText {
  line-height: var(--leading-relaxed);
}

.plainText {
  font-size: var(--text-base);
  color: var(--color-text-2);
  line-height: var(--leading-relaxed);
  white-space: pre-wrap;
}
</style>
