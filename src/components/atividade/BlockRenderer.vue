<script setup>
import TextBlock from './blocks/TextBlock.vue'
import MarkdownBlock from './blocks/MarkdownBlock.vue'
import HeadingBlock from './blocks/HeadingBlock.vue'
import CodeBlock from './blocks/CodeBlock.vue'
import ImageBlock from './blocks/ImageBlock.vue'
import ListBlock from './blocks/ListBlock.vue'
import QuoteBlock from './blocks/QuoteBlock.vue'
import AlertBlock from './blocks/AlertBlock.vue'
import LinkBlock from './blocks/LinkBlock.vue'
import VideoBlock from './blocks/VideoBlock.vue'
import TableBlock from './blocks/TableBlock.vue'
import FileBlock from './blocks/FileBlock.vue'
import LinksBlock from './blocks/LinksBlock.vue'
import GalleryBlock from './blocks/GalleryBlock.vue'
import TerminalBlock from './blocks/TerminalBlock.vue'
import StepsBlock from './blocks/StepsBlock.vue'
import ChecklistBlock from './blocks/ChecklistBlock.vue'
import AccordionBlock from './blocks/AccordionBlock.vue'
import EmbedBlock from './blocks/EmbedBlock.vue'
import DividerBlock from './blocks/DividerBlock.vue'
import QuestionBlock from './blocks/QuestionBlock.vue'

defineProps({
  blocks: { type: Array, required: true },
  printExpandAll: { type: Boolean, default: false },
})
</script>

<template>
  <div class="blocksView">
    <template v-for="(block, idx) in blocks" :key="idx">
      <TextBlock v-if="block.type === 'text'" :block="block" />
      <MarkdownBlock v-else-if="block.type === 'markdown'" :block="block" />
      <HeadingBlock v-else-if="block.type === 'heading'" :block="block" />
      <CodeBlock v-else-if="block.type === 'code'" :block="block" />
      <ImageBlock v-else-if="block.type === 'image' && block.url" :block="block" />
      <ListBlock v-else-if="block.type === 'list'" :block="block" />
      <QuoteBlock v-else-if="block.type === 'quote'" :block="block" />
      <AlertBlock v-else-if="block.type === 'alert'" :block="block" />
      <LinkBlock v-else-if="block.type === 'link'" :block="block" />
      <VideoBlock v-else-if="block.type === 'video'" :block="block" />
      <TableBlock v-else-if="block.type === 'table'" :block="block" />
      <FileBlock v-else-if="block.type === 'file' && block.url" :block="block" />
      <LinksBlock v-else-if="block.type === 'links'" :block="block" />
      <GalleryBlock v-else-if="block.type === 'gallery'" :block="block" />
      <TerminalBlock v-else-if="block.type === 'terminal'" :block="block" />
      <StepsBlock v-else-if="block.type === 'steps'" :block="block" />
      <ChecklistBlock v-else-if="block.type === 'checklist'" :block="block" />
      <AccordionBlock v-else-if="block.type === 'accordion'" :block="block" :print-expand-all="printExpandAll" />
      <EmbedBlock v-else-if="block.type === 'embed' && block.url" :block="block" />
      <DividerBlock v-else-if="block.type === 'divider'" />
      <QuestionBlock v-else-if="block.type === 'question'" :block="block" :index="idx" :print-expand-all="printExpandAll" />
    </template>
  </div>
</template>

<style scoped>
.blocksView {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}
</style>
