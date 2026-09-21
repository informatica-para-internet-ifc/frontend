<script setup>
import { slugify } from '../../../utils/slugify.js'

defineProps({
  block: { type: Object, required: true },
})
</script>

<template>
  <div class="viewBlock viewHeading">
    <component :is="`h${block.level}`" :id="`titulo-${slugify(block.content)}`" class="headingEl">{{ block.content }}</component>
  </div>
</template>

<style scoped>
.viewHeading {
  background: transparent;
  border: none;
  padding: 0;
}

.headingEl {
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
}

h1.headingEl { font-size: var(--text-2xl); font-weight: 800; }
h2.headingEl { font-size: var(--text-xl); font-weight: 700; }
h3.headingEl { font-size: var(--text-lg); font-weight: 700; }
</style>
