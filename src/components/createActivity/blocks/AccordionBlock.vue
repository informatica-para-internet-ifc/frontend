<script setup>
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })

function addAccItem() {
  block.value.items.push({ title: '', content: '' })
}

function removeAccItem(idx) {
  if (block.value.items.length > 1) block.value.items.splice(idx, 1)
}
</script>

<template>
  <div v-for="(it, i) in block.items" :key="i" class="accEditor">
    <div class="groupHead">
      <input
        v-model="it.title"
        class="blockInput accTitleInput"
        :placeholder="`Pergunta ${i + 1} (ex: O que é Git?)`"
      />
      <button class="groupRemoveBtn" @click="removeAccItem(i)" :disabled="block.items.length <= 1">
        <i class="mdi mdi-close"></i>
      </button>
    </div>
    <textarea
      v-model="it.content"
      class="blockTextarea"
      :placeholder="`Resposta ${i + 1}...`"
      rows="2"
    ></textarea>
  </div>
  <button type="button" class="addListItemBtn" @click="addAccItem()">
    <i class="mdi mdi-plus"></i>
    Adicionar pergunta
  </button>
</template>

<style scoped>
.accTitleInput {
  flex: 1;
}
</style>
