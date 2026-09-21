<script setup>
import { computed } from 'vue'
import { slugify } from '../../utils/slugify.js'

const props = defineProps({
  blocks: { type: Array, default: () => [] },
})

const toc = computed(() => {
  return props.blocks
    .filter((b) => b.type === 'heading' && b.content)
    .map((b) => ({ content: b.content, id: slugify(b.content) }))
})

function scrollToHeading(id) {
  document.getElementById(`titulo-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <div v-if="toc.length > 1" class="viewBlock viewToc animate-fade-in-up">
    <span class="tocLabel">
      <i class="mdi mdi-format-list-bulleted-square"></i>
      Nesta atividade:
    </span>
    <span class="tocItems">
      <button
        v-for="(item, ti) in toc"
        :key="ti"
        class="tocItem no-print"
        @click="scrollToHeading(item.id)"
      >
        {{ item.content }}
      </button>
    </span>
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

.viewToc {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--sp-2);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-2);
}

.tocLabel {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-1);
  white-space: nowrap;
}

.tocLabel i {
  color: var(--color-navy-accent);
  font-size: 1rem;
}

.tocItems {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-1);
}

.tocItem {
  background: none;
  border: none;
  padding: 0;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-navy-accent);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out), text-decoration-color var(--duration-fast) var(--ease-out);
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 3px;
}

.tocItems button:not(:last-child)::after {
  content: '·';
  margin-left: var(--sp-2);
  color: var(--color-text-5);
  text-decoration: none;
}

.tocItem:hover {
  color: var(--color-navy);
  text-decoration-color: currentColor;
}
</style>
