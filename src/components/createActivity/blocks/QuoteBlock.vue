<script setup>
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })
</script>

<template>
  <textarea
    v-model="block.content"
    class="blockTextarea"
    placeholder="Escreva a citação aqui..."
    rows="3"
  ></textarea>
  <input
    v-model="block.author"
    class="blockInput blockInputSecondary"
    placeholder="Autor da citação (opcional)"
  />
</template>
