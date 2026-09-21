<script setup>
import { renderMarkdown } from '../../../composables/useMarkdown.js'

defineProps({
  block: { type: Object, required: true },
})

function getAlertIcon(tipo) {
  const map = {
    info: 'mdi-information-outline',
    success: 'mdi-lightbulb-on-outline',
    warning: 'mdi-alert-outline',
    danger: 'mdi-exclamation-thick',
    erro: 'mdi-alert-octagon-outline',
  }
  return map[tipo] || 'mdi-information-outline'
}
</script>

<template>
  <div class="viewBlock viewAlert">
    <div class="alertBox" :class="`alert-${block.tipo}`">
      <i :class="`mdi ${getAlertIcon(block.tipo)}`" class="alertBoxIcon"></i>
      <div class="mdRender" v-html="renderMarkdown(block.content)"></div>
    </div>
  </div>
</template>

<style scoped>
.viewAlert {
  padding: 0;
  background: transparent;
  border: none;
}

.alertBox {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  padding: var(--sp-5) var(--sp-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-2);
}

.alertBox .mdRender {
  flex: 1;
  min-width: 0;
}

.alertBox .mdRender :deep(p:last-child) {
  margin-bottom: 0;
}

.alertBoxIcon {
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.alertBox.alert-info {
  background: var(--color-info-muted);
  border-color: var(--color-info);
}

.alertBox.alert-info .alertBoxIcon {
  color: var(--color-info);
}

.alertBox.alert-success {
  background: var(--color-success-muted);
  border-color: var(--color-success);
}

.alertBox.alert-success .alertBoxIcon {
  color: var(--color-success);
}

.alertBox.alert-warning {
  background: var(--color-warning-muted);
  border-color: var(--color-warning);
}

.alertBox.alert-warning .alertBoxIcon {
  color: var(--color-warning);
}

.alertBox.alert-danger {
  background: var(--color-danger-muted);
  border-color: var(--color-danger);
}

.alertBox.alert-danger .alertBoxIcon {
  color: var(--color-danger);
}

.alertBox.alert-erro {
  background: var(--color-purple-muted);
  border-color: var(--color-purple);
}

.alertBox.alert-erro .alertBoxIcon {
  color: var(--color-purple);
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
