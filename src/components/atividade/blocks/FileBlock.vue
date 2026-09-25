<script setup>
import { fixMediaUrl } from '../../../api/client.js'

defineProps({
  block: { type: Object, required: true },
})

function getFileType(url) {
  if (!url) return ''
  const m = url.match(/\.([a-z0-9]{2,5})(?:$|\?)/i)
  return m ? m[1].toLowerCase() : ''
}

function getDownloadUrl(rawUrl, filename) {
  const url = fixMediaUrl(rawUrl)
  if (!url) return url
  const marker = '/upload/'
  const idx = url.indexOf(marker)
  if (idx === -1 || !url.includes('res.cloudinary.com')) return url

  let flag = 'fl_attachment'
  const safeName = filename?.trim().replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '_')
  if (safeName) flag += `:${safeName}`

  return `${url.slice(0, idx + marker.length)}${flag}${url.slice(idx + marker.length)}`
}

function getFileIcon(type) {
  const map = {
    pdf: 'mdi-file-pdf-box',
    doc: 'mdi-file-word-box',
    docx: 'mdi-file-word-box',
    xls: 'mdi-file-excel-box',
    xlsx: 'mdi-file-excel-box',
    ppt: 'mdi-file-powerpoint-box',
    pptx: 'mdi-file-powerpoint-box',
    zip: 'mdi-folder-zip-outline',
    rar: 'mdi-folder-zip-outline',
    md: 'mdi-language-markdown-outline',
  }
  return map[type] || 'mdi-file-outline'
}
</script>

<template>
  <div v-if="block.url" class="viewBlock viewFile">
    <a
      :href="getDownloadUrl(block.url, block.label)"
      class="fileCardView"
      :download="block.label || true"
      target="_blank"
      rel="noopener"
    >
      <div class="fileCardViewIcon">
        <i :class="`mdi ${getFileIcon(getFileType(block.label || block.url))}`"></i>
      </div>
      <div class="fileCardViewBody">
        <span class="fileCardViewName">{{ block.label || block.url }}</span>
        <span class="fileCardViewMeta">
          {{ getFileType(block.label || block.url).toUpperCase() }}
          <template v-if="block.size"> · {{ block.size }}</template>
        </span>
        <span v-if="block.desc" class="fileCardViewDesc">{{ block.desc }}</span>
      </div>
      <i class="mdi mdi-download fileCardViewDownload"></i>
    </a>
  </div>
</template>

<style scoped>
.viewFile {
  padding: 0;
  background: transparent;
  border: none;
}

.fileCardView {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-5) var(--sp-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-spring);
}

.fileCardView:hover {
  border-color: var(--color-navy-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.fileCardViewIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: 1.5rem;
  flex-shrink: 0;
}

.fileCardView:hover .fileCardViewIcon {
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
}

.fileCardViewBody {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.fileCardViewName {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
}

.fileCardViewMeta {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  font-weight: 500;
}

.fileCardViewDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.fileCardViewDownload {
  font-size: 1.4rem;
  color: var(--color-navy-accent);
  flex-shrink: 0;
  transition: transform var(--duration-fast) var(--ease-spring);
}

.fileCardView:hover .fileCardViewDownload {
  transform: translateY(2px);
}
</style>
