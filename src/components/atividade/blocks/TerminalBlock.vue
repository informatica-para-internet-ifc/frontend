<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { copyText } from '../../../composables/useClipboard.js'

defineProps({
  block: { type: Object, required: true },
})

const copied = ref(false)
let copiedTimer = null

async function copyCommands(text) {
  const ok = await copyText(text)
  copied.value = ok
  clearTimeout(copiedTimer)
  if (ok) copiedTimer = setTimeout(() => { copied.value = false }, 2000)
}

onBeforeUnmount(() => clearTimeout(copiedTimer))
</script>

<template>
  <div class="viewBlock viewTerminal">
    <div class="terminalView">
      <div class="terminalViewBar">
        <span class="termViewDot termViewDotRed"></span>
        <span class="termViewDot termViewDotYellow"></span>
        <span class="termViewDot termViewDotGreen"></span>
        <span class="termViewTitle">terminal</span>
        <button
          class="copyTermBtn no-print"
          :class="{ copied }"
          @click="copyCommands(block.commands.filter(Boolean).join('\n'))"
        >
          <i :class="copied ? 'mdi mdi-check' : 'mdi mdi-content-copy'"></i>
        </button>
      </div>
      <div class="terminalViewBody">
        <div v-for="(cmd, ci) in block.commands.filter(Boolean)" :key="ci" class="termViewLine">
          <span class="termViewPrompt">$</span> {{ cmd }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.viewTerminal {
  padding: 0;
  background: transparent;
  border: none;
}

.terminalView {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
  background: var(--color-navy);
}

.terminalViewBar {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  background: var(--color-surface-3);
  border-bottom: 1px solid var(--color-border-2);
}

.termViewDot {
  width: 11px;
  height: 11px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.termViewDotRed {
  background: #f87171;
}

.termViewDotYellow {
  background: #fbbf24;
}

.termViewDotGreen {
  background: #4ade80;
}

.termViewTitle {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-5);
}

.terminalViewBody {
  padding: var(--sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.termViewLine {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: #e5e7eb;
  white-space: pre-wrap;
  word-break: break-word;
}

.termViewPrompt {
  color: #4ade80;
  font-weight: 700;
}

.copyTermBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: var(--sp-2);
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--color-text-5);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.copyTermBtn:hover {
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
}

.copyTermBtn.copied {
  color: var(--color-success);
}

.copyTermBtn i {
  font-size: 0.95rem;
}
</style>
