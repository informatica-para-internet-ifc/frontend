<script setup>
defineProps({
  block: { type: Object, required: true },
})
</script>

<template>
  <div class="viewBlock viewQuote">
    <blockquote class="quoteBox">
      <i class="mdi mdi-format-quote-open quoteIcon"></i>
      <p>{{ block.content }}</p>
      <footer v-if="block.author" class="quoteAuthor">— {{ block.author }}</footer>
    </blockquote>
  </div>
</template>

<style scoped>
.viewQuote {
  padding: 0;
  background: transparent;
  border: none;
}

.quoteBox {
  margin: 0;
  padding: var(--sp-6) var(--sp-8);
  border-left: 3px solid var(--color-navy-accent);
  background: var(--color-surface-3);
  border-radius: var(--radius-lg);
}

.quoteIcon {
  font-size: 1.5rem;
  color: var(--color-navy-accent);
  opacity: 0.5;
  display: block;
  margin-bottom: var(--sp-2);
}

.quoteBox p {
  font-size: var(--text-lg);
  font-style: italic;
  line-height: var(--leading-relaxed);
  color: var(--color-text-2);
  margin: 0;
}

.quoteAuthor {
  margin-top: var(--sp-3);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-4);
}
</style>
