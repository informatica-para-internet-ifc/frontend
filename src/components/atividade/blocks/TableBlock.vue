<script setup>
defineProps({
  block: { type: Object, required: true },
})
</script>

<template>
  <div class="viewBlock viewTable">
    <div class="tableWrap">
      <table class="viewTableEl">
        <thead v-if="block.hasHeader && block.rows.length">
          <tr>
            <th v-for="(cell, ci) in block.rows[0]" :key="ci">{{ cell }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, ri) in block.hasHeader ? block.rows.slice(1) : block.rows" :key="ri">
            <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.viewTable {
  padding: 0;
  background: transparent;
  border: none;
}

.tableWrap {
  overflow-x: auto;
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
}

.viewTableEl {
  width: 100%;
  border-collapse: collapse;
}

.viewTableEl td {
  padding: var(--sp-3) var(--sp-5);
  border: 1px solid var(--color-border-1);
  font-size: var(--text-sm);
  color: var(--color-text-2);
  line-height: var(--leading-normal);
  white-space: pre-wrap;
}

.viewTableEl tr:nth-child(even) td {
  background: var(--color-surface-3);
}

.viewTableEl th {
  padding: var(--sp-3) var(--sp-5);
  border: 1px solid var(--color-border-1);
  background: var(--color-surface-3);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-1);
  text-align: left;
  white-space: pre-wrap;
}
</style>
