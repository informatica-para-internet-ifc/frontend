<script setup>
const block = defineModel('block', { type: Object, required: true })
</script>

<template>
  <div class="codeHeader">
    <select v-model="block.language" class="langSelect">
      <option value="javascript">JavaScript</option>
      <option value="python">Python</option>
      <option value="html">HTML</option>
      <option value="css">CSS</option>
      <option value="sql">SQL</option>
      <option value="java">Java</option>
      <option value="c">C</option>
      <option value="php">PHP</option>
      <option value="markdown">Markdown</option>
      <option value="plaintext">Texto</option>
    </select>
  </div>
  <textarea
    v-model="block.content"
    class="codeTextarea"
    placeholder="// Cole ou escreva o código aqui..."
    rows="6"
    spellcheck="false"
  ></textarea>
</template>

<style scoped>
.langSelect {
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-text-2);
  font-size: var(--text-xs);
  font-family: var(--font-sans);
  cursor: pointer;
}

.codeTextarea {
  width: 100%;
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-navy);
  color: #e2e8f0;
  font-size: var(--text-sm);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  padding: var(--sp-4);
  resize: vertical;
  line-height: 1.6;
  tab-size: 2;
}

.codeTextarea:focus {
  outline: none;
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 0 3px var(--color-navy-accent-muted);
}
</style>
