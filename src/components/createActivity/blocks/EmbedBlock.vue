<script setup>
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })
</script>

<template>
  <input
    v-model="block.url"
    class="blockInput"
    placeholder="URL do conteúdo a incorporar (https://...) — use links de embed"
  />
  <div class="blockInputRow">
    <input
      v-model="block.title"
      class="blockInput"
      placeholder="Título (acessibilidade)"
    />
    <input
      v-model="block.height"
      class="blockInput blockInputSmall"
      placeholder="Altura (px)"
    />
  </div>
  <div v-if="block.url" class="blockPreview">
    <div class="embedPreviewWrap">
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
