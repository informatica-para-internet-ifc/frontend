<script setup>
import { renderMarkdown } from '../../../composables/useMarkdown.js'

defineProps({
  block: { type: Object, required: true },
  printExpandAll: { type: Boolean, default: false },
})
</script>

<template>
  <div class="viewBlock viewAccordion">
    <div v-for="(it, ai) in block.items.filter((x) => x.title)" :key="ai" class="accordionItem">
      <details :open="ai === 0 || printExpandAll">
        <summary>
          <span>{{ it.title }}</span>
          <i class="mdi mdi-chevron-down accordionChevron"></i>
        </summary>
        <div class="accordionBody mdRender" v-html="renderMarkdown(it.content)"></div>
      </details>
    </div>
  </div>
</template>

<style scoped>
.viewAccordion {
  padding: 0;
  background: transparent;
  border: none;
}

.accordionItem {
  margin-bottom: var(--sp-3);
}

.accordionItem:last-child {
  margin-bottom: 0;
}

.accordionItem details {
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface-2);
}

.accordionItem summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  padding: var(--sp-4) var(--sp-5);
  cursor: pointer;
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
  list-style: none;
  transition: background var(--duration-fast) var(--ease-out);
}

.accordionItem summary::-webkit-details-marker {
  display: none;
}

.accordionItem summary:hover {
  background: var(--color-surface-3);
}

.accordionChevron {
  color: var(--color-text-5);
  transition: transform var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.accordionItem details[open] .accordionChevron {
  transform: rotate(180deg);
}

.accordionBody {
  padding: 0 var(--sp-5) var(--sp-4);
  font-size: var(--text-sm);
  color: var(--color-text-2);
  line-height: var(--leading-relaxed);
}

.mdRender :deep(h1) {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-1);
  margin: var(--sp-3) 0 var(--sp-2);
}

.mdRender :deep(h2) {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-1);
  margin: var(--sp-3) 0 var(--sp-2);
}

.mdRender :deep(h3) {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-text-1);
  margin: var(--sp-3) 0 var(--sp-2);
}

.mdRender :deep(p) {
  margin-bottom: var(--sp-2);
  line-height: var(--leading-relaxed);
  color: var(--color-text-2);
}

.mdRender :deep(strong) {
  font-weight: 700;
  color: var(--color-text-1);
}

.mdRender :deep(em) {
  font-style: italic;
}

.mdRender :deep(del) {
  text-decoration: line-through;
  color: var(--color-text-5);
}

.mdRender :deep(.md-code) {
  display: block;
  padding: var(--sp-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-2);
  overflow-x: auto;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: var(--text-sm);
  line-height: 1.6;
  margin: var(--sp-3) 0;
}

.mdRender :deep(.md-inline) {
  padding: 2px var(--sp-2);
  border-radius: var(--radius-sm);
  background: var(--color-surface-4);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9em;
}

.mdRender :deep(a) {
  color: var(--color-navy-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 600;
}

.mdRender :deep(a:hover) {
  color: var(--color-navy-accent-hover);
}

.mdRender :deep(ul),
.mdRender :deep(ol) {
  padding-left: var(--sp-6);
  margin: var(--sp-2) 0;
}

.mdRender :deep(li) {
  margin-bottom: var(--sp-1);
}
</style>
