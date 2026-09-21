<script setup>
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })

function addTableRow() {
  const len = block.value.rows[0]?.length || 1
  block.value.rows.push(Array(len).fill(''))
}

function addTableCol() {
  block.value.rows.forEach((r) => r.push(''))
}

function removeTableRow() {
  if (block.value.rows.length > 1) block.value.rows.pop()
}

function removeTableCol() {
  if ((block.value.rows[0]?.length || 0) > 1) block.value.rows.forEach((r) => r.pop())
}
</script>

<template>
  <div class="tableControls">
    <button type="button" class="tableControlBtn" @click="addTableRow()">
      <i class="mdi mdi-table-row-plus-after"></i>
      Linha
    </button>
    <button type="button" class="tableControlBtn" @click="addTableCol()">
      <i class="mdi mdi-table-column-plus-after"></i>
      Coluna
    </button>
    <button type="button" class="tableControlBtn" @click="removeTableRow()" :disabled="block.rows.length <= 1">
      <i class="mdi mdi-table-row-remove"></i>
      Linha
    </button>
    <button type="button" class="tableControlBtn" @click="removeTableCol()" :disabled="(block.rows[0]?.length || 0) <= 1">
      <i class="mdi mdi-table-column-remove"></i>
      Coluna
    </button>
  </div>
  <div class="tableHeaderToggle">
    <label class="checkToggle">
      <input type="checkbox" v-model="block.hasHeader" />
      <span class="checkToggleBox"><i class="mdi mdi-check"></i></span>
      Usar primeira linha como cabeçalho
    </label>
  </div>
  <div class="tableEditor">
    <table>
      <tbody>
        <tr v-for="(row, ri) in block.rows" :key="ri">
          <td v-for="(cell, ci) in row" :key="ci">
            <input
              v-model="block.rows[ri][ci]"
              class="tableCellInput"
              :class="{ tableCellHeader: block.hasHeader && ri === 0 }"
              :placeholder="`C${ci + 1}`"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.tableControls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
}

.tableControlBtn {
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

.tableControlBtn:hover:not(:disabled) {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.tableControlBtn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.tableEditor {
  overflow-x: auto;
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
}

.tableEditor table {
  width: 100%;
  border-collapse: collapse;
}

.tableEditor td {
  padding: var(--sp-1);
  border: 1px solid var(--color-border-1);
  min-width: 80px;
}

.tableCellInput {
  width: 100%;
  border: none;
  outline: none;
  background: var(--color-surface);
  color: var(--color-text-1);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-sm);
  transition: all var(--duration-fast) var(--ease-out);
}

.tableCellInput:focus {
  background: var(--color-surface-2);
  box-shadow: inset 0 0 0 1px var(--color-navy-accent);
}

.tableCellInput.tableCellHeader {
  font-weight: 700;
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
}
</style>
