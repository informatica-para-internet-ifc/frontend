<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { renderMarkdown } from '../../../composables/useMarkdown.js'
import { copyText } from '../../../composables/useClipboard.js'
import { getTipoLabel, getTipoIcon, getTipoClass, getQuestionModoLabel } from '../../../utils/atividadeQuestion.js'

defineProps({
  block: { type: Object, required: true },
  index: { type: Number, required: true },
  printExpandAll: { type: Boolean, default: false },
})

const revealed = ref(false)

function toggleReveal() {
  revealed.value = !revealed.value
}

const copied = ref(false)
let copiedTimer = null

async function copyCode(text) {
  const ok = await copyText(text)
  copied.value = ok
  clearTimeout(copiedTimer)
  if (ok) copiedTimer = setTimeout(() => { copied.value = false }, 2000)
}

onBeforeUnmount(() => clearTimeout(copiedTimer))
</script>

<template>
  <div class="viewBlock viewQuestion">
    <div class="questionCard">
      <div class="questionHeader">
        <span class="questionNumber">Q{{ index + 1 }}</span>
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
            :class="{ copied }"
            @click="copyCode(block.codigoEsperado)"
          >
            <i :class="copied ? 'mdi mdi-check' : 'mdi mdi-content-copy'"></i>
            {{ copied ? 'Copiado!' : 'Copiar' }}
          </button>
        </div>
        <pre v-if="block.codigoEsperado" class="viewProgCode"><code>{{ block.codigoEsperado }}</code></pre>
      </div>
      <div v-else-if="block.modo === 'discursiva'" class="viewDiscursiva">
        <span class="viewDiscursivaLabel">Resposta em texto livre</span>
      </div>
      <button class="revealBtn no-print" @click="toggleReveal">
        <i :class="revealed ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
        {{ revealed ? 'Ocultar dica' : 'Ver dica' }}
      </button>
      <Transition name="expand">
        <div v-if="revealed || printExpandAll" class="dicaBox">
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

<style scoped>
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

.viewProgCode {
  margin: 0;
  padding: var(--sp-4);
  background: var(--color-navy);
  overflow-x: auto;
}

.viewProgCode code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: #e5e7eb;
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
</style>
