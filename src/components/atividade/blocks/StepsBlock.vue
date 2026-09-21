<script setup>
import { renderMarkdown } from '../../../composables/useMarkdown.js'

defineProps({
  block: { type: Object, required: true },
})
</script>

<template>
  <div class="viewBlock viewSteps">
    <ol class="stepsList">
      <li v-for="(st, si) in block.steps.filter((s) => s.title)" :key="si" class="stepItem">
        <span class="stepItemNum">{{ String(si + 1).padStart(2, '0') }}</span>
        <div class="stepItemBody">
          <span class="stepItemTitle">{{ st.title }}</span>
          <span v-if="st.desc" class="stepItemDesc mdRender" v-html="renderMarkdown(st.desc)"></span>
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.viewSteps {
  padding: 0;
  background: transparent;
  border: none;
}

.stepsList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.stepItem {
  display: flex;
  gap: var(--sp-4);
}

.stepItemNum {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 700;
  flex-shrink: 0;
}

.stepItemBody {
  display: flex;
  flex-direction: column;
  padding-top: var(--sp-1);
}

.stepItemTitle {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
}

.stepItemDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
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
