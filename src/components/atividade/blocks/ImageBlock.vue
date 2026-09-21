<script setup>
defineProps({
  block: { type: Object, required: true },
})
</script>

<template>
  <div class="viewBlock viewImage">
    <img :src="block.url" :alt="block.alt || ''" class="viewImageEl" />
    <p v-if="block.alt" class="viewImageAlt">{{ block.alt }}</p>
  </div>
</template>

<style scoped>
.viewImage {
  padding: 0;
  overflow: hidden;
}

.viewImageEl {
  width: 100%;
  display: block;
  border-radius: var(--radius-lg);
}

.viewImageAlt {
  padding: var(--sp-3) var(--sp-5);
  font-size: var(--text-sm);
  color: var(--color-text-5);
  text-align: center;
  font-style: italic;
}
</style>
