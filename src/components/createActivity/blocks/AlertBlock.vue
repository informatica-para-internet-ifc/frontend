<script setup>
import { renderMarkdown } from '../../../composables/useMarkdown.js'
import { alertTypes, getAlertIcon } from '../../../utils/activityBlocks.js'
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })
</script>

<template>
  <div class="alertTypeRow">
    <button
      v-for="at in alertTypes"
      :key="at.type"
      type="button"
      class="alertTypeBtn"
      :class="{ active: block.tipo === at.type }"
      @click="block.tipo = at.type"
    >
      <i :class="`mdi ${at.icon}`"></i>
      {{ at.label }}
    </button>
  </div>
  <textarea
    v-model="block.content"
    class="blockTextarea"
    placeholder="Texto do destaque..."
    rows="3"
  ></textarea>
  <div class="blockPreview" v-if="block.content">
    <div class="alertPreview" :class="`alert-${block.tipo}`">
      <i :class="`mdi ${getAlertIcon(block.tipo)}`" class="alertPreviewIcon"></i>
      <div class="mdRender" v-html="renderMarkdown(block.content)"></div>
    </div>
  </div>
</template>

<style scoped>
.alertTypeRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.alertTypeBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-weight: 500;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.alertTypeBtn i {
  font-size: 1rem;
}

.alertTypeBtn.active {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}
</style>
