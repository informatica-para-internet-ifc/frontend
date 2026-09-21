<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { copyText } from '../../../composables/useClipboard.js'

defineProps({
  block: { type: Object, required: true },
})

const copied = ref(false)
let copiedTimer = null

async function copyCode(text) {
  const ok = await copyText(text)
  copied.value = ok
  clearTimeout(copiedTimer)
  if (ok) copiedTimer = setTimeout(() => { copied.value = false }, 2000)
}

onBeforeUnmount(() => clearTimeout(copiedTimer))
</script>

<template>
  <div class="viewBlock viewCode">
    <div class="codeBlock">
      <div class="codeBlockHeader">
        <span class="codeBlockLang">
          <i class="mdi mdi-code-tags"></i>
          {{ block.language }}
        </span>
        <button
          class="copyCodeBtn no-print"
          :class="{ copied }"
          @click="copyCode(block.content)"
        >
          <i :class="copied ? 'mdi mdi-check' : 'mdi mdi-content-copy'"></i>
          {{ copied ? 'Copiado!' : 'Copiar' }}
        </button>
      </div>
      <pre class="codePre"><code>{{ block.content }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.viewCode {
  padding: 0;
  overflow: hidden;
}

.codeBlock {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
}

.codeBlockHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  background: var(--color-navy);
  color: var(--color-text-5);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

.codeBlockHeader i {
  font-size: 0.85rem;
}

.codeBlockLang {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
}

.copyCodeBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 4px var(--sp-3);
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-text-5);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: none;
  letter-spacing: normal;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
}

.copyCodeBtn:hover {
  border-color: var(--color-navy-accent);
  color: #ffffff;
  background: var(--color-navy-accent);
  transform: translateY(-1px);
}

.copyCodeBtn.copied {
  border-color: var(--color-success);
  color: var(--color-success);
  background: rgba(34, 197, 94, 0.12);
}

.copyCodeBtn i {
  font-size: 0.85rem;
}

.codePre {
  margin: 0;
  padding: var(--sp-5);
  background: var(--color-surface);
  overflow-x: auto;
  line-height: 1.7;
}

.codePre code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: var(--text-sm);
  color: var(--color-text-2);
}
</style>
