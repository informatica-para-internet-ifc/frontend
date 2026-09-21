<script setup>
defineProps({
  block: { type: Object, required: true },
})
</script>

<template>
  <div class="dividerPreview">
    <hr />
  </div>
</template>

<style scoped>
.dividerPreview {
  padding: var(--sp-2) 0;
}

.dividerPreview hr {
  border: none;
  height: 1px;
  background: var(--color-border-2);
}
</style>
