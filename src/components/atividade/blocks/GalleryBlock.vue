<script setup>
defineProps({
  block: { type: Object, required: true },
})
</script>

<template>
  <div class="viewBlock viewGallery">
    <div class="galleryGrid">
      <figure v-for="(img, gi) in block.images.filter((g) => g.url)" :key="gi" class="galleryFig">
        <img :src="img.url" :alt="img.caption || ''" loading="lazy" />
        <figcaption v-if="img.caption">{{ img.caption }}</figcaption>
      </figure>
    </div>
    <p v-if="block.caption" class="galleryCaption">{{ block.caption }}</p>
  </div>
</template>

<style scoped>
.viewGallery {
  padding: 0;
  background: transparent;
  border: none;
}

.galleryGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--sp-4);
}

.galleryFig {
  margin: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
}

.galleryFig img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  display: block;
  transition: transform var(--duration-normal) var(--ease-out);
}

.galleryFig:hover img {
  transform: scale(1.03);
}

.galleryFig figcaption {
  padding: var(--sp-2) var(--sp-4);
  font-size: var(--text-xs);
  color: var(--color-text-4);
  font-style: italic;
}

.galleryCaption {
  margin-top: var(--sp-3);
  font-size: var(--text-sm);
  color: var(--color-text-4);
  font-style: italic;
  text-align: center;
}
</style>
