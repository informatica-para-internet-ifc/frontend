<script setup>
defineProps({
  block: { type: Object, required: true },
})
</script>

<template>
  <div v-if="block.url" class="viewBlock viewEmbed">
    <div class="embedWrap">
      <iframe
        :src="block.url"
        :title="block.title || 'Conteúdo incorporado'"
        :style="{ height: `${block.height || 400}px` }"
        frameborder="0"
        loading="lazy"
        allowfullscreen
      ></iframe>
    </div>
  </div>
</template>

<style scoped>
.viewEmbed {
  padding: 0;
  background: transparent;
  border: none;
}

.embedWrap {
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-navy);
}

.embedWrap iframe {
  display: block;
  width: 100%;
  border: none;
}
</style>
