<script setup>
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })
</script>

<template>
  <textarea
    v-model="block.content"
    class="blockTextarea"
    placeholder="Escreva o texto aqui...&#10;&#10;Texto simples sem formatação."
    rows="4"
  ></textarea>
  <div class="blockMeta">
    <span class="charCount">{{ block.content?.length || 0 }} caracteres</span>
  </div>
</template>
