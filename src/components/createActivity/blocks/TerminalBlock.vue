<script setup>
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })

function addTerminalCmd() {
  block.value.commands.push('')
}

function removeTerminalCmd(idx) {
  if (block.value.commands.length > 1) block.value.commands.splice(idx, 1)
}
</script>

<template>
  <div v-for="(cmd, i) in block.commands" :key="i" class="cmdRow">
    <span class="cmdPrompt">$</span>
    <input
      v-model="block.commands[i]"
      class="cmdInput"
      :placeholder="`Comando ${i + 1} (ex: npm install)`"
      @keydown.enter="addTerminalCmd()"
    />
    <button class="listItemRemove" @click="removeTerminalCmd(i)" :disabled="block.commands.length <= 1">
      <i class="mdi mdi-close"></i>
    </button>
  </div>
  <button type="button" class="addListItemBtn" @click="addTerminalCmd()">
    <i class="mdi mdi-plus"></i>
    Adicionar comando
  </button>
  <div v-if="block.commands.some((c) => c)" class="blockPreview">
    <div class="terminalPreview">
      <div class="terminalBar">
        <span class="termDot termDotRed"></span>
        <span class="termDot termDotYellow"></span>
        <span class="termDot termDotGreen"></span>
        <span class="termTitle">terminal</span>
      </div>
      <div class="terminalBody">
        <div v-for="(cmd, i) in block.commands.filter(Boolean)" :key="i" class="termLine">
          <span class="termPrompt">$</span> {{ cmd }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cmdRow {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.cmdPrompt {
  font-family: var(--font-mono);
  color: var(--color-success);
  font-weight: 700;
  flex-shrink: 0;
}

.cmdInput {
  flex: 1;
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  color: var(--color-text-1);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  padding: var(--sp-2) var(--sp-3);
  transition: all var(--duration-fast) var(--ease-out);
}

.cmdInput:focus {
  outline: none;
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 0 3px var(--color-navy-accent-muted);
}
</style>
