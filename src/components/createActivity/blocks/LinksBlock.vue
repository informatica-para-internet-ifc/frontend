<script setup>
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })

function addLinkItem() {
  block.value.links.push({ title: '', url: '', desc: '' })
}

function removeLinkItem(idx) {
  if (block.value.links.length > 1) block.value.links.splice(idx, 1)
}
</script>

<template>
  <div v-for="(lk, i) in block.links" :key="i" class="linkGroup">
    <div class="groupHead">
      <span class="groupLabel">Referência {{ i + 1 }}</span>
      <button class="groupRemoveBtn" @click="removeLinkItem(i)" :disabled="block.links.length <= 1">
        <i class="mdi mdi-close"></i>
      </button>
    </div>
    <input
      v-model="lk.title"
      class="blockInput"
      :placeholder="`Título (ex: Documentação do Vue)`"
    />
    <input
      v-model="lk.url"
      class="blockInput"
      :placeholder="`URL (https://...)`"
    />
    <input
      v-model="lk.desc"
      class="blockInput blockInputSecondary"
      :placeholder="`Descrição (opcional)`"
    />
  </div>
  <button type="button" class="addListItemBtn" @click="addLinkItem()">
    <i class="mdi mdi-plus"></i>
    Adicionar referência
  </button>
</template>
