<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { getAtividade, disciplinaNomes, getAnoIdByDisciplina, deleteAtividade } from '../data/disciplinas.js'
import { useAuthStore } from '../stores/auth.js'
import { renderMarkdown } from '../composables/useMarkdown.js'
import { useToast } from '../composables/useToast.js'
import { copyText } from '../composables/useClipboard.js'

const props = defineProps({
  disciplinaId: { type: String, required: true },
  atividadeId: { type: String, required: true },
})

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const atividade = computed(() => getAtividade(props.disciplinaId, props.atividadeId))
const disciplinaName = computed(() => disciplinaNomes[props.disciplinaId] || '')
const anoId = computed(() => getAnoIdByDisciplina(props.disciplinaId))

const showDeleteModal = ref(false)
const isDeleting = ref(false)

function confirmDelete() {
  showDeleteModal.value = true
}

function cancelDelete() {
  if (isDeleting.value) return
  showDeleteModal.value = false
}

async function executeDelete() {
  if (isDeleting.value) return
  isDeleting.value = true
  try {
    await deleteAtividade(props.disciplinaId, props.atividadeId)
    toast.success('Atividade excluída com sucesso.')
    showDeleteModal.value = false
    router.push(`/disciplina/${anoId.value || 1}/${props.disciplinaId}`)
  } catch (err) {
    toast.error(`Não foi possível excluir a atividade${err?.message ? `: ${err.message}` : '.'}`)
  } finally {
    isDeleting.value = false
  }
}
const readProgress = ref(0)
let progressTicking = false

function updateReadProgress() {
  const doc = document.documentElement
  const total = doc.scrollHeight - doc.clientHeight
  readProgress.value = total > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / total) * 100)) : 0
  progressTicking = false
}

function onScroll() {
  if (progressTicking) return
  progressTicking = true
  requestAnimationFrame(updateReadProgress)
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  updateReadProgress()
})

onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const hasBlocks = computed(() => atividade.value?.blocks && atividade.value.blocks.length > 0)
const totalBlocks = computed(() => atividade.value?.blocks?.length || 0)

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const toc = computed(() => {
  if (!hasBlocks.value) return []
  return atividade.value.blocks
    .filter((b) => b.type === 'heading' && b.content)
    .map((b) => ({ content: b.content, id: slugify(b.content) }))
})

function scrollToHeading(id) {
  document.getElementById(`titulo-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
const questionCount = computed(() => {
  if (hasBlocks.value) {
    return atividade.value.blocks.filter(b => b.type === 'question').length
  }
  return atividade.value?.questoes?.length || 0
})

const revealed = ref({})

function toggleReveal(key) {
  revealed.value[key] = !revealed.value[key]
}

function getTipoLabel(tipo) {
  if (tipo === 'exercicio') return 'Exercício'
  if (tipo === 'teorica') return 'Teórica'
  return tipo
}

function getTipoIcon(tipo) {
  if (tipo === 'exercicio') return 'mdi-code-braces'
  if (tipo === 'teorica') return 'mdi-book-open-page-variant'
  return 'mdi-help-circle-outline'
}

function getTipoClass(tipo) {
  if (tipo === 'exercicio') return 'tipoExercicio'
  if (tipo === 'teorica') return 'tipoTeorica'
  return ''
}

function getAlertIcon(tipo) {
  const map = {
    info: 'mdi-information-outline',
    success: 'mdi-lightbulb-on-outline',
    warning: 'mdi-alert-outline',
    danger: 'mdi-exclamation-thick',
    erro: 'mdi-alert-octagon-outline',
  }
  return map[tipo] || 'mdi-information-outline'
}

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

function getFileType(url) {
  if (!url) return ''
  const m = url.match(/\.([a-z0-9]{2,5})(?:$|\?)/i)
  return m ? m[1].toLowerCase() : ''
}

function getDownloadUrl(url, filename) {
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

function getQuestionModoLabel(modo) {
  const map = {
    discursiva: 'Discursiva',
    multipla_escolha: 'Múltipla Escolha',
    verdadeiro_falso: 'Verdadeiro/Falso',
    programacao: 'Programação',
  }
  return map[modo] || 'Discursiva'
}

const shareMsg = ref('')
let shareTimer = null

function setShareMsg(msg) {
  shareMsg.value = msg
  clearTimeout(shareTimer)
  if (msg) shareTimer = setTimeout(() => { shareMsg.value = '' }, 2000)
}

async function copyLink() {
  const url = window.location.href
  if (navigator.share) {
    try {
      await navigator.share({
        title: atividade.value?.title || 'Atividade',
        text: `${atividade.value?.title || 'Atividade'} — ${disciplinaName.value}`,
        url,
      })
      return
    } catch (e) {
      if (e.name === 'AbortError') return
    }
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url)
    } else {
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setShareMsg('copiado')
  } catch {
    setShareMsg('erro')
  }
}

onBeforeUnmount(() => clearTimeout(shareTimer))

const copiedKey = ref('')
let copiedTimer = null

async function copyCode(key, text) {
  const ok = await copyText(text)
  copiedKey.value = ok ? key : ''
  clearTimeout(copiedTimer)
  if (ok) copiedTimer = setTimeout(() => { copiedKey.value = '' }, 2000)
}

function exportPdf() {
  window.print()
}

async function downloadCover() {
  try {
    const resp = await fetch(atividade.value.capa)
    if (!resp.ok) throw new Error('network')
    const blob = await resp.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `capa-${atividade.value.title || 'atividade'}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl)
  } catch {
    toast.error('Não foi possível baixar a imagem.')
    window.open(atividade.value.capa, '_blank', 'noopener')
  }
}

const printExpandAll = ref(false)
function onBeforePrint() { printExpandAll.value = true }
function onAfterPrint() { printExpandAll.value = false }

onMounted(() => {
  window.addEventListener('beforeprint', onBeforePrint)
  window.addEventListener('afterprint', onAfterPrint)
})

onBeforeUnmount(() => {
  clearTimeout(copiedTimer)
  window.removeEventListener('beforeprint', onBeforePrint)
  window.removeEventListener('afterprint', onAfterPrint)
})
</script>

<template>
  <div class="atividadeView">
    <div v-if="atividade" class="readProgress no-print" aria-hidden="true">
      <div class="readProgressBar" :style="{ width: `${readProgress}%` }"></div>
    </div>

<div class="atividadeContent" v-if="atividade">
      <div v-if="atividade.capa" class="ativCoverWrap animate-fade-in-up no-print">
        <img :src="atividade.capa" alt="" class="ativCover" />
        <button class="ativCoverDownload" title="Baixar imagem" @click="downloadCover">
          <i class="mdi mdi-download"></i>
        </button>
      </div>

      <div class="ativHeader animate-fade-in-up">
        <button class="backBtn no-print" @click="router.back()">
          <i class="mdi mdi-arrow-left"></i>
        </button>
        <div class="ativInfo">
          <div class="breadcrumb">
            <RouterLink v-if="anoId" :to="`/ano/${anoId}`">{{ anoId }}º Ano</RouterLink>
            <i class="mdi mdi-chevron-right"></i>
            <RouterLink :to="`/disciplina/${anoId || 1}/${disciplinaId}`">{{ disciplinaName }}</RouterLink>
            <i class="mdi mdi-chevron-right"></i>
            <span>{{ atividade.title }}</span>
          </div>
          <h1 class="ativTitle">{{ atividade.title }}</h1>
          <p v-if="atividade.desc" class="ativDesc">{{ atividade.desc }}</p>
          <div v-if="atividade.tags?.length" class="ativTags">
            <span v-for="tag in atividade.tags" :key="tag" class="ativTagChip">{{ tag }}</span>
          </div>
          <div class="ativMeta">
            <span class="metaItem" v-if="atividade.fixada">
              <i class="mdi mdi-pin"></i>
              Fixada
            </span>
            <span class="metaItem" v-if="atividade.dificuldade">
              <i class="mdi mdi-speedometer"></i>
              {{ { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' }[atividade.dificuldade] || atividade.dificuldade }}
            </span>
            <span class="metaItem" v-if="atividade.tempoEstimado">
              <i class="mdi mdi-clock-outline"></i>
              {{ atividade.tempoEstimado }}
            </span>
            <span class="metaItem" v-if="questionCount > 0">
              <i class="mdi mdi-help-circle-outline"></i>
              {{ questionCount }} questão{{ questionCount > 1 ? 'ões' : '' }}
            </span>
            <span class="metaItem" v-if="totalBlocks > 0">
              <i class="mdi mdi-cube-outline"></i>
              {{ totalBlocks }} bloco{{ totalBlocks > 1 ? 's' : '' }}
            </span>
            <button
              class="shareBtn no-print"
              :class="{ shared: shareMsg === 'copiado', failed: shareMsg === 'erro' }"
              @click="copyLink"
              :title="shareMsg === 'copiado' ? 'Link copiado!' : shareMsg === 'erro' ? 'Não foi possível copiar' : 'Compartilhar'"
            >
              <i :class="shareMsg === 'copiado' ? 'mdi mdi-check' : shareMsg === 'erro' ? 'mdi mdi-alert' : 'mdi mdi-share-variant'"></i>
              <span class="shareBtnLabel">{{ shareMsg === 'copiado' ? 'Link copiado!' : shareMsg === 'erro' ? 'Falhou' : 'Compartilhar' }}</span>
            </button>
            <button class="shareBtn no-print" @click="exportPdf" title="Exportar como PDF">
              <i class="mdi mdi-file-pdf-box"></i>
              <span class="shareBtnLabel">Exportar PDF</span>
            </button>
            <template v-if="auth.isLoggedIn">
              <RouterLink
                :to="`/editar-atividade/${disciplinaId}/${atividadeId}`"
                class="shareBtn editBtn no-print"
                title="Editar atividade"
              >
                <i class="mdi mdi-pencil-outline"></i>
                <span class="shareBtnLabel">Editar</span>
              </RouterLink>
              <button class="shareBtn deleteBtn no-print" @click="confirmDelete" title="Excluir atividade">
                <i class="mdi mdi-delete-outline"></i>
                <span class="shareBtnLabel">Excluir</span>
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- AUTO SUMMARY (RF-19) -->
      <div v-if="toc.length > 1" class="viewBlock viewToc animate-fade-in-up">
        <span class="tocLabel">
          <i class="mdi mdi-format-list-bulleted-square"></i>
          Nesta atividade:
        </span>
        <span class="tocItems">
          <button
            v-for="(item, ti) in toc"
            :key="ti"
            class="tocItem no-print"
            @click="scrollToHeading(item.id)"
          >
            {{ item.content }}
          </button>
        </span>
      </div>

      <!-- BLOCKS VIEW -->
      <div v-if="hasBlocks" class="blocksView">
        <template v-for="(block, idx) in atividade.blocks" :key="idx">

          <div v-if="block.type === 'text'" class="viewBlock viewText">
            <p class="plainText">{{ block.content }}</p>
          </div>

          <div v-else-if="block.type === 'markdown'" class="viewBlock viewMarkdown">
            <div class="mdRender" v-html="renderMarkdown(block.content)"></div>
          </div>

          <div v-else-if="block.type === 'heading'" class="viewBlock viewHeading">
            <component :is="`h${block.level}`" :id="`titulo-${slugify(block.content)}`" class="headingEl">{{ block.content }}</component>
          </div>

          <div v-else-if="block.type === 'code'" class="viewBlock viewCode">
            <div class="codeBlock">
              <div class="codeBlockHeader">
                <span class="codeBlockLang">
                  <i class="mdi mdi-code-tags"></i>
                  {{ block.language }}
                </span>
                <button
                  class="copyCodeBtn no-print"
                  :class="{ copied: copiedKey === `code-${idx}` }"
                  @click="copyCode(`code-${idx}`, block.content)"
                >
                  <i :class="copiedKey === `code-${idx}` ? 'mdi mdi-check' : 'mdi mdi-content-copy'"></i>
                  {{ copiedKey === `code-${idx}` ? 'Copiado!' : 'Copiar' }}
                </button>
              </div>
              <pre class="codePre"><code>{{ block.content }}</code></pre>
            </div>
          </div>

          <div v-else-if="block.type === 'image' && block.url" class="viewBlock viewImage">
            <img :src="block.url" :alt="block.alt || ''" class="viewImageEl" />
            <p v-if="block.alt" class="viewImageAlt">{{ block.alt }}</p>
          </div>

          <div v-else-if="block.type === 'list'" class="viewBlock viewList">
            <component :is="block.ordered ? 'ol' : 'ul'" class="viewListEl">
              <li v-for="(item, i) in block.items.filter(Boolean)" :key="i">{{ item }}</li>
            </component>
          </div>

          <div v-else-if="block.type === 'quote'" class="viewBlock viewQuote">
            <blockquote class="quoteBox">
              <i class="mdi mdi-format-quote-open quoteIcon"></i>
              <p>{{ block.content }}</p>
              <footer v-if="block.author" class="quoteAuthor">— {{ block.author }}</footer>
            </blockquote>
          </div>

          <div v-else-if="block.type === 'alert'" class="viewBlock viewAlert">
            <div class="alertBox" :class="`alert-${block.tipo}`">
              <i :class="`mdi ${getAlertIcon(block.tipo)}`" class="alertBoxIcon"></i>
              <div class="mdRender" v-html="renderMarkdown(block.content)"></div>
            </div>
          </div>

          <div v-else-if="block.type === 'link'" class="viewBlock viewLink">
            <a :href="block.url" class="linkCard" target="_blank" rel="noopener">
              <div class="linkCardIcon">
                <i class="mdi mdi-link-variant"></i>
              </div>
              <div class="linkCardBody">
                <span class="linkCardLabel">{{ block.label || block.url }}</span>
                <span class="linkCardUrl">{{ block.url }}</span>
                <span v-if="block.desc" class="linkCardDesc">{{ block.desc }}</span>
              </div>
              <i class="mdi mdi-open-in-new linkCardOpen"></i>
            </a>
          </div>

          <div v-else-if="block.type === 'video'" class="viewBlock viewVideo">
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
              <video :src="block.url" controls preload="metadata"></video>
            </div>
            <p v-if="block.title" class="viewVideoTitle">{{ block.title }}</p>
          </div>

          <div v-else-if="block.type === 'table'" class="viewBlock viewTable">
            <div class="tableWrap">
              <table class="viewTableEl">
                <thead v-if="block.hasHeader && block.rows.length">
                  <tr>
                    <th v-for="(cell, ci) in block.rows[0]" :key="ci">{{ cell }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, ri) in block.hasHeader ? block.rows.slice(1) : block.rows" :key="ri">
                    <td v-for="(cell, ci) in row" :key="ci">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else-if="block.type === 'file' && block.url" class="viewBlock viewFile">
            <a
              :href="getDownloadUrl(block.url, block.label)"
              class="fileCardView"
              :download="block.label || true"
              target="_blank"
              rel="noopener"
            >
              <div class="fileCardViewIcon">
                <i :class="`mdi ${getFileIcon(getFileType(block.url))}`"></i>
              </div>
              <div class="fileCardViewBody">
                <span class="fileCardViewName">{{ block.label || block.url }}</span>
                <span class="fileCardViewMeta">
                  {{ getFileType(block.url).toUpperCase() }}
                  <template v-if="block.size"> · {{ block.size }}</template>
                </span>
                <span v-if="block.desc" class="fileCardViewDesc">{{ block.desc }}</span>
              </div>
              <i class="mdi mdi-download fileCardViewDownload"></i>
            </a>
          </div>

          <div v-else-if="block.type === 'links'" class="viewBlock viewLinks">
            <div class="extLinksList">
              <a
                v-for="(lk, li) in block.links.filter((l) => l.title || l.url)"
                :key="li"
                :href="lk.url"
                class="extLink"
                target="_blank"
                rel="noopener"
              >
                <div class="extLinkIcon">
                  <i class="mdi mdi-link-variant"></i>
                </div>
                <div class="extLinkBody">
                  <span class="extLinkTitle">{{ lk.title || lk.url }}</span>
                  <span v-if="lk.desc" class="extLinkDesc">{{ lk.desc }}</span>
                  <span class="extLinkUrl">{{ lk.url }}</span>
                </div>
                <i class="mdi mdi-open-in-new extLinkOpen"></i>
              </a>
            </div>
          </div>

          <div v-else-if="block.type === 'gallery'" class="viewBlock viewGallery">
            <div class="galleryGrid">
              <figure v-for="(img, gi) in block.images.filter((g) => g.url)" :key="gi" class="galleryFig">
                <img :src="img.url" :alt="img.caption || ''" loading="lazy" />
                <figcaption v-if="img.caption">{{ img.caption }}</figcaption>
              </figure>
            </div>
            <p v-if="block.caption" class="galleryCaption">{{ block.caption }}</p>
          </div>

          <div v-else-if="block.type === 'terminal'" class="viewBlock viewTerminal">
            <div class="terminalView">
              <div class="terminalViewBar">
                <span class="termViewDot termViewDotRed"></span>
                <span class="termViewDot termViewDotYellow"></span>
                <span class="termViewDot termViewDotGreen"></span>
                <span class="termViewTitle">terminal</span>
                <button
                  class="copyTermBtn no-print"
                  :class="{ copied: copiedKey === `term-${idx}` }"
                  @click="copyCode(`term-${idx}`, block.commands.filter(Boolean).join('\n'))"
                >
                  <i :class="copiedKey === `term-${idx}` ? 'mdi mdi-check' : 'mdi mdi-content-copy'"></i>
                </button>
              </div>
              <div class="terminalViewBody">
                <div v-for="(cmd, ci) in block.commands.filter(Boolean)" :key="ci" class="termViewLine">
                  <span class="termViewPrompt">$</span> {{ cmd }}
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="block.type === 'steps'" class="viewBlock viewSteps">
            <ol class="stepsList">
              <li v-for="(st, si) in block.steps.filter((s) => s.title)" :key="si" class="stepItem">
                <span class="stepItemNum">{{ String(si + 1).padStart(2, '0') }}</span>
                <div class="stepItemBody">
                  <span class="stepItemTitle">{{ st.title }}</span>
                  <span v-if="st.desc" class="stepItemDesc mdRender" v-html="renderMarkdown(st.desc)"></span>
                </div>
              </li>
            </ol>
          </div>

          <div v-else-if="block.type === 'checklist'" class="viewBlock viewChecklist">
            <ul class="checklistList">
              <li v-for="(it, ci) in block.items.filter((x) => x.text)" :key="ci" class="checklistItem" :class="{ done: it.done }">
                <i :class="it.done ? 'mdi mdi-checkbox-marked' : 'mdi mdi-checkbox-blank-outline'"></i>
                <span>{{ it.text }}</span>
              </li>
            </ul>
          </div>

          <div v-else-if="block.type === 'accordion'" class="viewBlock viewAccordion">
            <div v-for="(it, ai) in block.items.filter((x) => x.title)" :key="ai" class="accordionItem">
              <details :open="ai === 0 || printExpandAll">
                <summary>
                  <span>{{ it.title }}</span>
                  <i class="mdi mdi-chevron-down accordionChevron"></i>
                </summary>
                <div class="accordionBody mdRender" v-html="renderMarkdown(it.content)"></div>
              </details>
            </div>
          </div>

          <div v-else-if="block.type === 'embed' && block.url" class="viewBlock viewEmbed">
            <div class="embedWrap">
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

          <div v-else-if="block.type === 'divider'" class="viewBlock viewDivider">
            <hr />
          </div>

          <div v-else-if="block.type === 'question'" class="viewBlock viewQuestion">
            <div class="questionCard">
              <div class="questionHeader">
                <span class="questionNumber">Q{{ idx + 1 }}</span>
                <span class="questionTipo" :class="getTipoClass(block.tipo)">
                  <i :class="`mdi ${getTipoIcon(block.tipo)}`"></i>
                  {{ getTipoLabel(block.tipo) }} · {{ getQuestionModoLabel(block.modo) }}
                </span>
              </div>
              <div class="questionEnunciado mdRender" v-html="renderMarkdown(block.enunciado)"></div>
              <div v-if="block.modo === 'multipla_escolha'" class="viewAltList">
                <template v-for="(alt, ai) in block.alternativas" :key="ai">
                  <div v-if="alt.texto" class="viewAltItem">
                    <span class="viewAltBadge">{{ String.fromCharCode(65 + ai) }}</span>
                    <span class="viewAltText">{{ alt.texto }}</span>
                  </div>
                </template>
              </div>
              <div v-else-if="block.modo === 'verdadeiro_falso'" class="viewVfRow">
                <span class="viewVfOption"><i class="mdi mdi-check-circle-outline"></i> Verdadeiro</span>
                <span class="viewVfOption"><i class="mdi mdi-close-circle-outline"></i> Falso</span>
              </div>
              <div v-else-if="block.modo === 'programacao'" class="viewProgBlock">
                <div v-if="block.linguagem || block.codigoEsperado" class="viewProgHeader">
                  <span v-if="block.linguagem" class="viewProgLang">{{ block.linguagem }}</span>
                  <button
                    v-if="block.codigoEsperado"
                    class="copyCodeBtn no-print"
                    :class="{ copied: copiedKey === `quest-${idx}` }"
                    @click="copyCode(`quest-${idx}`, block.codigoEsperado)"
                  >
                    <i :class="copiedKey === `quest-${idx}` ? 'mdi mdi-check' : 'mdi mdi-content-copy'"></i>
                    {{ copiedKey === `quest-${idx}` ? 'Copiado!' : 'Copiar' }}
                  </button>
                </div>
                <pre v-if="block.codigoEsperado" class="viewProgCode"><code>{{ block.codigoEsperado }}</code></pre>
              </div>
              <div v-else-if="block.modo === 'discursiva'" class="viewDiscursiva">
                <span class="viewDiscursivaLabel">Resposta em texto livre</span>
              </div>
              <button class="revealBtn no-print" @click="toggleReveal(`q-${idx}`)">
                <i :class="revealed[`q-${idx}`] ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
                {{ revealed[`q-${idx}`] ? 'Ocultar dica' : 'Ver dica' }}
              </button>
              <Transition name="expand">
                <div v-if="revealed[`q-${idx}`] || printExpandAll" class="dicaBox">
                  <p v-if="block.tipo === 'exercicio'">
                    Pense sobre os conceitos abordados na disciplina e tente resolver passo a passo.
                    Considere criar um pseudocódigo antes de implementar.
                  </p>
                  <p v-else>
                    Revise o conteúdo teórico da disciplina e formule uma resposta completa,
                    incluindo exemplos práticos quando possível.
                  </p>
                </div>
              </Transition>
            </div>
          </div>
        </template>
      </div>

      <!-- FALLBACK: old format (only questoes) -->
      <div v-else-if="atividade.questoes && atividade.questoes.length > 0" class="questoesList">
        <div
          v-for="(q, idx) in atividade.questoes"
          :key="idx"
          class="questaoCard"
         
        >
          <div class="questaoHeader">
            <span class="questaoNumber">Q{{ idx + 1 }}</span>
            <span class="questaoTipo" :class="getTipoClass(q.tipo)">
              <i :class="`mdi ${getTipoIcon(q.tipo)}`"></i>
              {{ getTipoLabel(q.tipo) }}
            </span>
          </div>
          <p class="questaoEnunciado">{{ q.enunciado }}</p>
          <button class="revealBtn" @click="toggleReveal(`old-${idx}`)">
            <i :class="revealed[`old-${idx}`] ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
            {{ revealed[`old-${idx}`] ? 'Ocultar dica' : 'Ver dica' }}
          </button>
          <Transition name="expand">
            <div v-if="revealed[`old-${idx}`]" class="dicaBox">
              <p v-if="q.tipo === 'exercicio'">
                Pense sobre os conceitos abordados na disciplina e tente resolver passo a passo.
                Considere criar um pseudocódigo antes de implementar.
              </p>
              <p v-else>
                Revise o conteúdo teórico da disciplina e formule uma resposta completa,
                incluindo exemplos práticos quando possível.
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>

    <!-- NOT FOUND -->
    <div class="atividadeContent" v-else>
      <div class="notFound animate-fade-in-up">
        <div class="notFoundIllustration">
          <div class="notFoundCircle">
            <i class="mdi mdi-file-question-outline"></i>
          </div>
          <div class="notFoundDots">
            <span></span><span></span><span></span>
          </div>
        </div>

        <div class="notFoundContent">
          <h2>Atividade não encontrada</h2>
          <p class="notFoundDesc">
            A atividade que você procura não existe, foi removida ou o link está incorreto.
          </p>

          <div class="notFoundReasons">
            <div class="reasonItem">
              <i class="mdi mdi-link-variant-off"></i>
              <span>Link incorreto ou desatualizado</span>
            </div>
            <div class="reasonItem">
              <i class="mdi mdi-delete-outline"></i>
              <span>Atividade removida</span>
            </div>
            <div class="reasonItem">
              <i class="mdi mdi-database-remove-outline"></i>
              <span>Dados não encontrados no servidor</span>
            </div>
          </div>

          <div class="notFoundActions">
            <RouterLink :to="disciplinaName ? `/disciplina/${anoId || 1}/${disciplinaId}` : '/'" class="actionBtn actionBtnPrimary">
              <i class="mdi mdi-arrow-left"></i>
              {{ disciplinaName ? `Voltar para ${disciplinaName}` : 'Ver disciplinas' }}
            </RouterLink>
            <RouterLink to="/" class="actionBtn">
              <i class="mdi mdi-home-outline"></i>
              Página inicial
            </RouterLink>
            <RouterLink to="/buscar" class="actionBtn">
              <i class="mdi mdi-magnify"></i>
              Buscar atividades
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <Transition name="fade">
      <div v-if="showDeleteModal" class="modalOverlay" @click.self="cancelDelete">
        <div class="deleteModal animate-scale-in">
          <div class="modalIcon">
            <i class="mdi mdi-alert-circle-outline"></i>
          </div>
          <h3 class="modalTitle">Excluir atividade?</h3>
          <p class="modalDesc">
            Tem certeza que deseja excluir <strong>{{ atividade?.title }}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <div class="modalActions">
            <button class="modalBtn modalBtnCancel" :disabled="isDeleting" @click="cancelDelete">
              Cancelar
            </button>
            <button class="modalBtn modalBtnDelete" :disabled="isDeleting" @click="executeDelete">
              <i :class="isDeleting ? 'mdi mdi-loading mdi-spin' : 'mdi mdi-delete-outline'"></i>
              {{ isDeleting ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.atividadeView {
  position: relative;
  min-height: calc(100vh - var(--header-h));
}

.readProgress {
  position: fixed;
  top: var(--header-h);
  left: 0;
  right: 0;
  z-index: 90;
  height: 3px;
  background: transparent;
}

.readProgressBar {
  height: 100%;
  background: var(--color-navy-accent);
  transition: width 0.1s linear;
}

@media (prefers-reduced-motion: reduce) {
  .readProgressBar {
    transition: none;
  }
}

.atividadeContent {
  position: relative;
  z-index: 1;
  max-width: var(--max-w-narrow);
  margin: 0 auto;
  padding: var(--sp-8) var(--sp-6);
}

.ativCoverWrap {
  position: relative;
  margin-bottom: var(--sp-6);
}

.ativCover {
  display: block;
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border-1);
}

.ativCoverDownload {
  position: absolute;
  top: var(--sp-3);
  right: var(--sp-3);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: all var(--duration-fast) var(--ease-out);
}

.ativCoverWrap:hover .ativCoverDownload {
  opacity: 1;
}

.ativCoverDownload:hover {
  background: var(--color-navy-accent);
}

.ativHeader {
  margin-bottom: var(--sp-8);
  display: flex;
  align-items: flex-start;
  gap: var(--sp-4);
}

.ativInfo {
  flex: 1;
}

.ativTitle {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--sp-2);
}

.ativDesc {
  font-size: var(--text-base);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--sp-3);
}

.ativTags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  margin-bottom: var(--sp-3);
}

.ativTagChip {
  padding: 3px var(--sp-3);
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: var(--text-xs);
  font-weight: 600;
}

.ativMeta {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  flex-wrap: wrap;
}

.shareBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-2);
  background: transparent;
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.shareBtn:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
}

.shareBtn i {
  font-size: 0.85rem;
}

.shareBtn.shared {
  border-color: #16a34a;
  color: #16a34a;
  background: rgba(22, 163, 74, 0.08);
}

.shareBtn.failed {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background: var(--color-danger-muted);
}

.shareBtn.editBtn:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
}

.shareBtn.deleteBtn:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background: var(--color-danger-muted);
}

.modalOverlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  backdrop-filter: blur(4px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--sp-6);
}

.deleteModal {
  width: 100%;
  max-width: 400px;
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-border-2);
  box-shadow: var(--shadow-xl);
  padding: var(--sp-8);
  text-align: center;
}

.modalIcon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: var(--color-danger-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--sp-5);
}

.modalIcon i {
  font-size: 2rem;
  color: var(--color-danger);
}

.modalTitle {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-1);
  margin-bottom: var(--sp-3);
}

.modalDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--sp-6);
}

.modalDesc strong {
  color: var(--color-text-2);
}

.modalActions {
  display: flex;
  gap: var(--sp-3);
}

.modalBtn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
  border: none;
}

.modalBtnCancel {
  background: var(--color-surface-3);
  color: var(--color-text-3);
  border: 1px solid var(--color-border-2);
}

.modalBtnCancel:hover {
  background: var(--color-surface-4);
}

.modalBtnDelete {
  background: var(--color-danger);
  color: #ffffff;
}

.modalBtnDelete:hover {
  background: var(--color-danger-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
}

.modalBtn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.fade-enter-active {
  transition: opacity 0.25s var(--ease-out);
}

.fade-leave-active {
  transition: opacity 0.2s var(--ease-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.blocksView {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.viewToc {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: var(--sp-2);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-2);
}

.tocLabel {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-1);
  white-space: nowrap;
}

.tocLabel i {
  color: var(--color-navy-accent);
  font-size: 1rem;
}

.tocItems {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--sp-1);
}

.tocItem {
  background: none;
  border: none;
  padding: 0;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-navy-accent);
  cursor: pointer;
  transition: color var(--duration-fast) var(--ease-out), text-decoration-color var(--duration-fast) var(--ease-out);
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 3px;
}

.tocItems button:not(:last-child)::after {
  content: '·';
  margin-left: var(--sp-2);
  color: var(--color-text-5);
  text-decoration: none;
}

.tocItem:hover {
  color: var(--color-navy);
  text-decoration-color: currentColor;
}

.viewBlock {
  border-radius: var(--radius-lg);
  padding: var(--sp-6);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  transition: all var(--duration-normal) var(--ease-out);
}

.viewBlock:hover {
  border-color: var(--color-border-2);
  box-shadow: var(--shadow-sm);
}

.viewText {
  line-height: var(--leading-relaxed);
}

.plainText {
  font-size: var(--text-base);
  color: var(--color-text-2);
  line-height: var(--leading-relaxed);
  white-space: pre-wrap;
}

.viewMarkdown {
  line-height: var(--leading-relaxed);
}

.viewHeading {
  background: transparent;
  border: none;
  padding: 0;
}

.headingEl {
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
}

h1.headingEl { font-size: var(--text-2xl); font-weight: 800; }
h2.headingEl { font-size: var(--text-xl); font-weight: 700; }
h3.headingEl { font-size: var(--text-lg); font-weight: 700; }

.viewCode {
  padding: 0;
  overflow: hidden;
}

.codeBlock {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
}

.codeBlockHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  background: var(--color-navy);
  color: var(--color-text-5);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

.codeBlockHeader i {
  font-size: 0.85rem;
}

.codeBlockLang {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
}

.copyCodeBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 4px var(--sp-3);
  border-radius: var(--radius-full);
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-text-5);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: none;
  letter-spacing: normal;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
}

.copyCodeBtn:hover {
  border-color: var(--color-navy-accent);
  color: #ffffff;
  background: var(--color-navy-accent);
  transform: translateY(-1px);
}

.copyCodeBtn.copied {
  border-color: var(--color-success);
  color: var(--color-success);
  background: rgba(34, 197, 94, 0.12);
}

.copyCodeBtn i {
  font-size: 0.85rem;
}

.copyTermBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  margin-left: var(--sp-2);
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--color-text-5);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.copyTermBtn:hover {
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
}

.copyTermBtn.copied {
  color: var(--color-success);
}

.copyTermBtn i {
  font-size: 0.95rem;
}

.codePre {
  margin: 0;
  padding: var(--sp-5);
  background: var(--color-surface);
  overflow-x: auto;
  line-height: 1.7;
}

.codePre code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: var(--text-sm);
  color: var(--color-text-2);
}

.viewImage {
  padding: 0;
  overflow: hidden;
}

.viewImageEl {
  width: 100%;
  display: block;
  border-radius: var(--radius-lg);
}

.viewImageAlt {
  padding: var(--sp-3) var(--sp-5);
  font-size: var(--text-sm);
  color: var(--color-text-5);
  text-align: center;
  font-style: italic;
}

.viewListEl {
  padding-left: var(--sp-6);
  color: var(--color-text-2);
  line-height: var(--leading-relaxed);
}

.viewListEl li {
  margin-bottom: var(--sp-2);
}

.viewDivider {
  padding: var(--sp-2) 0;
  background: transparent;
  border: none;
}

.viewDivider hr {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-border-2), transparent);
}

.viewQuote,
.viewAlert,
.viewLink,
.viewVideo,
.viewTable,
.viewFile,
.viewLinks,
.viewGallery,
.viewTerminal,
.viewSteps,
.viewChecklist,
.viewAccordion,
.viewEmbed {
  padding: 0;
  background: transparent;
  border: none;
}

/* ── Quote ── */
.quoteBox {
  margin: 0;
  padding: var(--sp-6) var(--sp-7);
  border-left: 3px solid var(--color-navy-accent);
  background: var(--color-surface-3);
  border-radius: var(--radius-lg);
}

.quoteIcon {
  font-size: 1.5rem;
  color: var(--color-navy-accent);
  opacity: 0.5;
  display: block;
  margin-bottom: var(--sp-2);
}

.quoteBox p {
  font-size: var(--text-lg);
  font-style: italic;
  line-height: var(--leading-relaxed);
  color: var(--color-text-2);
  margin: 0;
}

.quoteAuthor {
  margin-top: var(--sp-3);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-4);
}

/* ── Alert ── */
.alertBox {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  padding: var(--sp-5) var(--sp-6);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-2);
}

.alertBox .mdRender {
  flex: 1;
  min-width: 0;
}

.alertBox .mdRender :deep(p:last-child) {
  margin-bottom: 0;
}

.alertBoxIcon {
  font-size: 1.4rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.alertBox.alert-info {
  background: var(--color-info-muted);
  border-color: var(--color-info);
}

.alertBox.alert-info .alertBoxIcon {
  color: var(--color-info);
}

.alertBox.alert-success {
  background: var(--color-success-muted);
  border-color: var(--color-success);
}

.alertBox.alert-success .alertBoxIcon {
  color: var(--color-success);
}

.alertBox.alert-warning {
  background: var(--color-warning-muted);
  border-color: var(--color-warning);
}

.alertBox.alert-warning .alertBoxIcon {
  color: var(--color-warning);
}

.alertBox.alert-danger {
  background: var(--color-danger-muted);
  border-color: var(--color-danger);
}

.alertBox.alert-danger .alertBoxIcon {
  color: var(--color-danger);
}

.alertBox.alert-erro {
  background: var(--color-purple-muted);
  border-color: var(--color-purple);
}

.alertBox.alert-erro .alertBoxIcon {
  color: var(--color-purple);
}

/* ── Link ── */
.linkCard {
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

.linkCard:hover {
  border-color: var(--color-navy-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.linkCardIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: 1.2rem;
  flex-shrink: 0;
}

.linkCard:hover .linkCardIcon {
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
}

.linkCardBody {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.linkCardLabel {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.linkCardUrl {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.linkCardDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.linkCardOpen {
  font-size: 1.2rem;
  color: var(--color-text-5);
  flex-shrink: 0;
  transition: transform var(--duration-fast) var(--ease-spring);
}

.linkCard:hover .linkCardOpen {
  color: var(--color-navy-accent);
  transform: translate(2px, -2px);
}

/* ── Video ── */
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

/* ── Table ── */
.tableWrap {
  overflow-x: auto;
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
}

.viewTableEl {
  width: 100%;
  border-collapse: collapse;
}

.viewTableEl td {
  padding: var(--sp-3) var(--sp-5);
  border: 1px solid var(--color-border-1);
  font-size: var(--text-sm);
  color: var(--color-text-2);
  line-height: var(--leading-normal);
  white-space: pre-wrap;
}

.viewTableEl tr:nth-child(even) td {
  background: var(--color-surface-3);
}

.viewTableEl th {
  padding: var(--sp-3) var(--sp-5);
  border: 1px solid var(--color-border-1);
  background: var(--color-surface-3);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-1);
  text-align: left;
  white-space: pre-wrap;
}

.viewVideoTitle {
  margin-top: var(--sp-2);
  font-size: var(--text-sm);
  color: var(--color-text-4);
  text-align: center;
}

/* ── File (Download) ── */
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

/* ── Links Externos ── */
.extLinksList {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.extLink {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-spring);
}

.extLink:hover {
  border-color: var(--color-navy-accent);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.extLinkIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: 1.2rem;
  flex-shrink: 0;
}

.extLink:hover .extLinkIcon {
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
}

.extLinkBody {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.extLinkTitle {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-1);
}

.extLinkDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.extLinkUrl {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.extLinkOpen {
  font-size: 1.1rem;
  color: var(--color-text-5);
  flex-shrink: 0;
  transition: transform var(--duration-fast) var(--ease-spring);
}

.extLink:hover .extLinkOpen {
  color: var(--color-navy-accent);
  transform: translate(2px, -2px);
}

/* ── Galeria ── */
.galleryGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--sp-4);
}

.galleryFig {
  margin: 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
}

.galleryFig img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  display: block;
  transition: transform var(--duration-normal) var(--ease-out);
}

.galleryFig:hover img {
  transform: scale(1.03);
}

.galleryFig figcaption {
  padding: var(--sp-2) var(--sp-4);
  font-size: var(--text-xs);
  color: var(--color-text-4);
  font-style: italic;
}

.galleryCaption {
  margin-top: var(--sp-3);
  font-size: var(--text-sm);
  color: var(--color-text-4);
  font-style: italic;
  text-align: center;
}

/* ── Terminal ── */
.terminalView {
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
  background: var(--color-navy);
}

.terminalViewBar {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  background: var(--color-surface-3);
  border-bottom: 1px solid var(--color-border-2);
}

.termViewDot {
  width: 11px;
  height: 11px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.termViewDotRed {
  background: #f87171;
}

.termViewDotYellow {
  background: #fbbf24;
}

.termViewDotGreen {
  background: #4ade80;
}

.termViewTitle {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-5);
}

.terminalViewBody {
  padding: var(--sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.termViewLine {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-2);
  white-space: pre-wrap;
  word-break: break-word;
}

.termViewPrompt {
  color: var(--color-success);
  font-weight: 700;
}

/* ── Passo a Passo ── */
.stepsList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.stepItem {
  display: flex;
  gap: var(--sp-4);
}

.stepItemNum {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 700;
  flex-shrink: 0;
}

.stepItemBody {
  display: flex;
  flex-direction: column;
  padding-top: var(--sp-1);
}

.stepItemTitle {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
}

.stepItemDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
}

/* ── Checklista ── */
.checklistList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.checklistItem {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  font-size: var(--text-sm);
  color: var(--color-text-2);
}

.checklistItem i {
  color: var(--color-text-5);
  flex-shrink: 0;
  font-size: 1.1rem;
}

.checklistItem.done {
  opacity: 0.65;
}

.checklistItem.done i {
  color: var(--color-success);
}

.checklistItem.done span {
  text-decoration: line-through;
}

/* ── Acordeão ── */
.accordionItem {
  margin-bottom: var(--sp-3);
}

.accordionItem:last-child {
  margin-bottom: 0;
}

.accordionItem details {
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-surface-2);
}

.accordionItem summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  padding: var(--sp-4) var(--sp-5);
  cursor: pointer;
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
  list-style: none;
  transition: background var(--duration-fast) var(--ease-out);
}

.accordionItem summary::-webkit-details-marker {
  display: none;
}

.accordionItem summary:hover {
  background: var(--color-surface-3);
}

.accordionChevron {
  color: var(--color-text-5);
  transition: transform var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.accordionItem details[open] .accordionChevron {
  transform: rotate(180deg);
}

.accordionBody {
  padding: 0 var(--sp-5) var(--sp-4);
  font-size: var(--text-sm);
  color: var(--color-text-2);
  line-height: var(--leading-relaxed);
}

/* ── Embed ── */
.embedWrap {
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: var(--color-navy);
}

.embedWrap iframe {
  display: block;
  width: 100%;
  border: none;
}

/* ── Questão: modos ── */
.viewAltList {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  margin: var(--sp-4) 0;
}

.viewAltItem {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-4);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.viewAltBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-weight: 700;
  flex-shrink: 0;
}

.viewAltText {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-text-2);
}

.viewVfRow {
  display: flex;
  gap: var(--sp-2);
  margin: var(--sp-4) 0;
}

.viewVfOption {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: var(--text-sm);
  color: var(--color-text-3);
}

.viewVfOption i {
  color: var(--color-text-5);
}

.viewProgBlock {
  margin: var(--sp-4) 0;
  border-radius: var(--radius-lg);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
}

.viewProgHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  padding: var(--sp-1) var(--sp-2) var(--sp-1) var(--sp-4);
  background: var(--color-surface-3);
}

.viewProgLang {
  display: block;
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.viewProgHeader .copyCodeBtn {
  border-color: var(--color-border-2);
  color: var(--color-text-4);
  background: transparent;
}

.viewProgHeader .copyCodeBtn:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
}

.viewProgCode {
  margin: 0;
  padding: var(--sp-4);
  background: var(--color-navy);
  overflow-x: auto;
}

.viewProgCode code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-text-2);
}

.viewDiscursiva {
  margin: var(--sp-4) 0;
  padding: var(--sp-4);
  border: 1px dashed var(--color-border-3);
  border-radius: var(--radius-lg);
  text-align: center;
}

.viewDiscursivaLabel {
  font-size: var(--text-sm);
  color: var(--color-text-5);
  font-style: italic;
}

.viewQuestion {
  padding: 0;
  background: transparent;
  border: none;
}

.questionCard {
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  padding: var(--sp-6);
  position: relative;
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-spring);
}

.questionCard:hover {
  border-color: var(--color-navy-accent);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.questionHeader {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-bottom: var(--sp-4);
}

.questionNumber {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
  font-size: var(--text-sm);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.questionTipo {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  transition: all var(--duration-fast) var(--ease-out);
}

.tipoExercicio {
  background: var(--color-info-muted);
  color: var(--color-info);
  border: 1px solid rgba(96, 165, 250, 0.15);
}

.tipoExercicio:hover {
  transform: scale(1.05);
}

.tipoTeorica {
  background: var(--color-warning-muted);
  color: var(--color-warning);
  border: 1px solid rgba(251, 191, 36, 0.15);
}

.tipoTeorica:hover {
  transform: scale(1.05);
}

.questionEnunciado {
  font-size: var(--text-base);
  color: var(--color-text-2);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--sp-4);
}

.revealBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-sm);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-2);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-3);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-spring);
  position: relative;
  overflow: hidden;
}

.revealBtn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--color-navy-accent-muted), transparent);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.revealBtn:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  transform: scale(1.05);
}

.revealBtn:hover::before {
  opacity: 1;
}

.revealBtn:active {
  transform: scale(0.97);
}

.dicaBox {
  margin-top: var(--sp-4);
  padding: var(--sp-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-3);
  border-left: 3px solid var(--color-navy-accent);
}

.dicaBox p {
  font-size: var(--text-sm);
  color: var(--color-text-3);
  line-height: var(--leading-relaxed);
}

.questoesList {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.questaoCard {
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  padding: var(--sp-6);
  transition: all var(--duration-normal) var(--ease-spring);
  position: relative;
  overflow: hidden;
}

.questaoCard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--color-navy-accent), transparent);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.questaoCard:hover {
  border-color: var(--color-border-2);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.questaoCard:hover::before {
  opacity: 1;
}

.questaoHeader {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-bottom: var(--sp-3);
}

.questaoNumber {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
  font-size: var(--text-xs);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.questaoTipo {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
}

.questaoEnunciado {
  font-size: var(--text-base);
  color: var(--color-text-2);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--sp-4);
}

.notFound {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--sp-16) var(--sp-6);
}

.notFoundIllustration {
  position: relative;
  margin-bottom: var(--sp-8);
}

.notFoundCircle {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  border: 2px dashed var(--color-border-2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  animation: notFoundPulse 3s ease-in-out infinite;
}

.notFoundCircle i {
  font-size: 3rem;
  color: var(--color-text-5);
}

@keyframes notFoundPulse {
  0%, 100% { transform: scale(1); border-color: var(--color-border-2); }
  50% { transform: scale(1.05); border-color: var(--color-navy-accent-muted); }
}

.notFoundDots {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 8px;
}

.notFoundDots span {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  animation: dotFloat 2s ease-in-out infinite;
}

.notFoundDots span:nth-child(2) { animation-delay: 0.3s; }
.notFoundDots span:nth-child(3) { animation-delay: 0.6s; }

@keyframes dotFloat {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 0.8; transform: translateY(-8px); }
}

.notFoundContent {
  max-width: 480px;
}

.notFoundContent h2 {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-1);
  margin-bottom: var(--sp-3);
}

.notFoundDesc {
  font-size: var(--text-base);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--sp-6);
}

.notFoundReasons {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  margin-bottom: var(--sp-8);
  text-align: left;
}

.reasonItem {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  font-size: var(--text-sm);
  color: var(--color-text-3);
}

.reasonItem i {
  font-size: 1.1rem;
  color: var(--color-text-5);
  flex-shrink: 0;
}

.notFoundActions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  justify-content: center;
}

.actionBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-5);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-2);
  color: var(--color-text-2);
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-spring);
  cursor: pointer;
}

.actionBtn:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.actionBtnPrimary {
  background: var(--color-navy-accent);
  border-color: var(--color-navy-accent);
  color: var(--color-text-on-accent);
}

.actionBtnPrimary:hover {
  background: var(--color-navy-accent-hover);
  border-color: var(--color-navy-accent-hover);
  color: var(--color-text-on-accent);
  box-shadow: var(--shadow-md);
}

.mdRender :deep(h1) {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-1);
  margin: var(--sp-3) 0 var(--sp-2);
}

.mdRender :deep(h2) {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-1);
  margin: var(--sp-3) 0 var(--sp-2);
}

.mdRender :deep(h3) {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-text-1);
  margin: var(--sp-3) 0 var(--sp-2);
}

.mdRender :deep(p) {
  margin-bottom: var(--sp-2);
  line-height: var(--leading-relaxed);
  color: var(--color-text-2);
}

.mdRender :deep(strong) {
  font-weight: 700;
  color: var(--color-text-1);
}

.mdRender :deep(em) {
  font-style: italic;
}

.mdRender :deep(del) {
  text-decoration: line-through;
  color: var(--color-text-5);
}

.mdRender :deep(.md-code) {
  display: block;
  padding: var(--sp-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-2);
  overflow-x: auto;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: var(--text-sm);
  line-height: 1.6;
  margin: var(--sp-3) 0;
}

.mdRender :deep(.md-inline) {
  padding: 2px var(--sp-2);
  border-radius: var(--radius-sm);
  background: var(--color-surface-4);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9em;
}

.mdRender :deep(a) {
  color: var(--color-navy-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 600;
}

.mdRender :deep(a:hover) {
  color: var(--color-navy-accent-hover);
}

.mdRender :deep(ul),
.mdRender :deep(ol) {
  padding-left: var(--sp-6);
  margin: var(--sp-2) 0;
}

.mdRender :deep(li) {
  margin-bottom: var(--sp-1);
}

.expand-enter-active {
  transition: all 0.35s var(--ease-spring);
}

.expand-leave-active {
  transition: all 0.25s var(--ease-out);
}

.expand-enter-from {
  opacity: 0;
  max-height: 0;
  transform: translateY(-12px) scale(0.97);
}

.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-8px);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 300px;
  transform: translateY(0) scale(1);
}

@media (max-width: 480px) {
  .ativTitle {
    font-size: var(--text-xl);
  }

  .notFoundCircle {
    width: 96px;
    height: 96px;
  }

  .notFoundCircle i {
    font-size: 2.2rem;
  }

  .notFoundActions {
    flex-direction: column;
    width: 100%;
  }

  .actionBtn {
    justify-content: center;
  }

  .shareBtnLabel {
    display: none;
  }

  .shareBtn {
    padding: var(--sp-2);
  }
}
</style>
