<script setup>
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })
</script>

<template>
  <input
    v-model="block.url"
    class="blockInput"
    placeholder="URL do link (https://...)"
  />
  <input
    v-model="block.label"
    class="blockInput"
    placeholder="Texto do link"
  />
  <input
    v-model="block.desc"
    class="blockInput blockInputSecondary"
    placeholder="Descrição curta (opcional)"
  />
  <div v-if="block.url" class="blockPreview">
    <div class="linkPreview">
      <div class="linkPreviewIcon">
        <i class="mdi mdi-link-variant"></i>
      </div>
      <div class="linkPreviewBody">
        <span class="linkPreviewLabel">{{ block.label || block.url }}</span>
        <span class="linkPreviewUrl">{{ block.url }}</span>
        <span v-if="block.desc" class="linkPreviewDesc">{{ block.desc }}</span>
      </div>
      <i class="mdi mdi-open-in-new linkPreviewOpen"></i>
    </div>
  </div>
</template>
