<script setup>
import { renderMarkdown } from '../../../composables/useMarkdown.js'
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })
</script>

<template>
  <textarea
    v-model="block.content"
    class="blockTextarea"
    placeholder="Escreva em Markdown...&#10;&#10;**negrito**, *itálico*, `código`&#10;&#10;# Título&#10;- Lista"
    rows="4"
  ></textarea>
  <div class="blockMeta">
    <span class="charCount">{{ block.content?.length || 0 }} caracteres</span>
  </div>
  <div class="blockPreview" v-if="block.content">
    <div class="mdRender" v-html="renderMarkdown(block.content)"></div>
  </div>
</template>
