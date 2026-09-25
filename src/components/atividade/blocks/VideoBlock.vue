<script setup>
import { fixMediaUrl } from '../../../api/client.js'
defineProps({
  block: { type: Object, required: true },
})

function getVideoEmbed(url) {
  if (!url) return null
  let m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  if (m) return `https://www.youtube-nocookie.com/embed/${m[1]}`
  m = url.match(/vimeo\.com\/(\d+)/)
  if (m) return `https://player.vimeo.com/video/${m[1]}`
  return null
}

function isDirectVideoUrl(url) {
  if (!url) return false
  return /\.(mp4|webm|mov|ogg|mkv)(?:$|\?)/i.test(url)
}
</script>

<template>
  <div class="viewBlock viewVideo">
    <div v-if="getVideoEmbed(block.url)" class="videoWrap">
      <iframe
        :src="getVideoEmbed(block.url)"
        :title="block.title || 'Vídeo'"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>
    <div v-else-if="isDirectVideoUrl(block.url)" class="videoWrap">
      <video :src="fixMediaUrl(block.url)" controls preload="metadata"></video>
    </div>
    <p v-if="block.title" class="viewVideoTitle">{{ block.title }}</p>
  </div>
</template>

<style scoped>
.viewVideo {
  padding: 0;
  background: transparent;
  border: none;
}

.videoWrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
  background: var(--color-navy);
}

.videoWrap iframe,
.videoWrap video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
}

.viewVideoTitle {
  margin-top: var(--sp-2);
  font-size: var(--text-sm);
  color: var(--color-text-4);
  text-align: center;
}
</style>
