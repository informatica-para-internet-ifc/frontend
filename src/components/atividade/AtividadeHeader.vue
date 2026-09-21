<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth.js'
import { useToast } from '../../composables/useToast.js'

const props = defineProps({
  atividade: { type: Object, required: true },
  disciplinaName: { type: String, default: '' },
  anoId: { type: [Number, String], default: null },
  disciplinaId: { type: String, required: true },
  atividadeId: { type: String, required: true },
  questionCount: { type: Number, default: 0 },
  totalBlocks: { type: Number, default: 0 },
})

defineEmits(['delete-request'])

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

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
        title: props.atividade?.title || 'Atividade',
        text: `${props.atividade?.title || 'Atividade'} — ${props.disciplinaName}`,
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

function exportPdf() {
  window.print()
}

async function downloadCover() {
  try {
    const resp = await fetch(props.atividade.capa)
    if (!resp.ok) throw new Error('network')
    const blob = await resp.blob()
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = `capa-${props.atividade.title || 'atividade'}`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(blobUrl)
  } catch {
    toast.error('Não foi possível baixar a imagem.')
    window.open(props.atividade.capa, '_blank', 'noopener')
  }
}
</script>

<template>
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
          <button class="shareBtn deleteBtn no-print" @click="$emit('delete-request')" title="Excluir atividade">
            <i class="mdi mdi-delete-outline"></i>
            <span class="shareBtnLabel">Excluir</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

@media (max-width: 480px) {
  .ativTitle {
    font-size: var(--text-xl);
  }

  .shareBtnLabel {
    display: none;
  }

  .shareBtn {
    padding: var(--sp-2);
  }
}
</style>
