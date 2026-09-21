<script setup>
import { renderMarkdown } from '../../composables/useMarkdown.js'
import {
  getAlertIcon,
  getFileIcon,
  getFileType,
  getVideoEmbed,
  isDirectVideoUrl,
  getQuestionModoLabel,
} from '../../utils/activityBlocks.js'
import './createActivityShared.css'

defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  capa: { type: String, default: '' },
  blocks: { type: Array, required: true },
  anoLabel: { type: String, default: '' },
  discNome: { type: String, default: '' },
  dificuldadeLabel: { type: String, default: '' },
  dificuldadeIcon: { type: String, default: '' },
  tempoEstimado: { type: String, default: '' },
  tags: { type: Array, default: () => [] },
})
</script>

<template>
  <div class="previewSection previewPane animate-fade-in-up delay-2">
    <div v-if="!title && !blocks.length" class="emptyPreview">
      <div class="emptyIcon">
        <i class="mdi mdi-eye-off-outline"></i>
      </div>
      <h3>Nada para visualizar</h3>
      <p>Adicione blocos para ver a pré-visualização.</p>
    </div>

    <div v-else class="previewCard">
      <img v-if="capa" :src="capa" alt="" class="previewCover" />
      <div class="previewBody">
        <h1 v-if="title" class="previewTitle">{{ title }}</h1>
        <p v-if="description" class="previewDesc">{{ description }}</p>
        <div v-if="anoLabel || discNome || dificuldadeLabel || tempoEstimado" class="previewMeta">
          <span v-if="anoLabel" class="previewTag">
            {{ anoLabel }}
          </span>
          <span v-if="discNome" class="previewTag previewTagDisc">
            {{ discNome }}
          </span>
          <span v-if="dificuldadeLabel" class="previewTag">
            <i :class="`mdi ${dificuldadeIcon}`"></i>
            {{ dificuldadeLabel }}
          </span>
          <span v-if="tempoEstimado" class="previewTag">
            <i class="mdi mdi-clock-outline"></i>
            {{ tempoEstimado }}
          </span>
        </div>
        <div v-if="tags.length" class="tagList">
          <span v-for="tag in tags" :key="tag" class="tagChip">{{ tag }}</span>
        </div>

        <div class="previewBlocks">
          <template v-for="block in blocks" :key="block.id">
            <div v-if="block.type === 'text'" class="previewBlock">
              <p class="previewPlainText">{{ block.content }}</p>
            </div>

            <div v-else-if="block.type === 'markdown'" class="previewBlock">
              <div class="mdRender" v-html="renderMarkdown(block.content)"></div>
            </div>

            <div v-else-if="block.type === 'heading'" class="previewBlock">
              <component :is="`h${block.level}`">{{ block.content }}</component>
            </div>

            <div v-else-if="block.type === 'code'" class="previewBlock">
              <div class="previewCodeBlock">
                <div class="previewCodeLang">{{ block.language }}</div>
                <pre class="previewCode"><code>{{ block.content }}</code></pre>
              </div>
            </div>

            <div v-else-if="block.type === 'image' && block.url" class="previewBlock">
              <img :src="block.url" :alt="block.alt || ''" class="previewImage" />
              <p v-if="block.alt" class="previewImageAlt">{{ block.alt }}</p>
            </div>

            <div v-else-if="block.type === 'list'" class="previewBlock">
              <ul class="previewList">
                <li v-for="(item, i) in block.items.filter(Boolean)" :key="i" class="previewListItem">
                  <span v-if="block.ordered" class="previewListMarkerNum">{{ i + 1 }}</span>
                  <span v-else class="previewListMarkerDot"><i class="mdi mdi-circle-small"></i></span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <div v-else-if="block.type === 'quote'" class="previewBlock">
              <blockquote class="previewQuote">
                <i class="mdi mdi-format-quote-open previewQuoteIcon"></i>
                <p>{{ block.content }}</p>
                <footer v-if="block.author" class="previewQuoteAuthor">— {{ block.author }}</footer>
              </blockquote>
            </div>

            <div v-else-if="block.type === 'alert'" class="previewBlock">
              <div class="previewAlert" :class="`alert-${block.tipo}`">
                <i :class="`mdi ${getAlertIcon(block.tipo)}`" class="previewAlertIcon"></i>
                <div class="mdRender" v-html="renderMarkdown(block.content)"></div>
              </div>
            </div>

            <div v-else-if="block.type === 'link'" class="previewBlock">
              <a :href="block.url" class="previewLink" target="_blank" rel="noopener">
                <div class="previewLinkIcon">
                  <i class="mdi mdi-link-variant"></i>
                </div>
                <div class="previewLinkBody">
                  <span class="previewLinkLabel">{{ block.label || block.url }}</span>
                  <span class="previewLinkUrl">{{ block.url }}</span>
                  <span v-if="block.desc" class="previewLinkDesc">{{ block.desc }}</span>
                </div>
                <i class="mdi mdi-open-in-new previewLinkOpen"></i>
              </a>
            </div>

            <div v-else-if="block.type === 'video'" class="previewBlock">
              <div v-if="getVideoEmbed(block.url)" class="previewVideoWrap">
                <iframe
                  :src="getVideoEmbed(block.url)"
                  title="Vídeo"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  loading="lazy"
                ></iframe>
              </div>
              <div v-else-if="isDirectVideoUrl(block.url)" class="previewVideoWrap">
                <video :src="block.url" controls preload="metadata"></video>
              </div>
              <p v-if="block.title" class="previewVideoTitle">{{ block.title }}</p>
            </div>

            <div v-else-if="block.type === 'table'" class="previewBlock">
              <div class="previewTableWrap">
                <table class="previewTable">
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

            <div v-else-if="block.type === 'file' && block.url" class="previewBlock">
              <a :href="block.url" target="_blank" rel="noopener" class="fileCardPreview" title="Abrir/baixar arquivo">
                <div class="fileCardIcon">
                  <i :class="`mdi ${getFileIcon(getFileType(block.url))}`"></i>
                </div>
                <div class="fileCardBody">
                  <span class="fileCardName">{{ block.label || block.url }}</span>
                  <span class="fileCardMeta">
                    {{ getFileType(block.url).toUpperCase() }}
                    <template v-if="block.size"> · {{ block.size }}</template>
                  </span>
                  <span v-if="block.desc" class="fileCardDesc">{{ block.desc }}</span>
                </div>
                <i class="mdi mdi-download fileCardDownload"></i>
              </a>
            </div>

            <div v-else-if="block.type === 'links'" class="previewBlock">
              <div class="previewExtLinks">
                <a
                  v-for="(lk, i) in block.links.filter((l) => l.title || l.url)"
                  :key="i"
                  :href="lk.url"
                  class="previewExtLink"
                  target="_blank"
                  rel="noopener"
                >
                  <div class="previewExtLinkIcon">
                    <i class="mdi mdi-link-variant"></i>
                  </div>
                  <div class="previewExtLinkBody">
                    <span class="previewExtLinkTitle">{{ lk.title || lk.url }}</span>
                    <span v-if="lk.desc" class="previewExtLinkDesc">{{ lk.desc }}</span>
                    <span class="previewExtLinkUrl">{{ lk.url }}</span>
                  </div>
                  <i class="mdi mdi-open-in-new previewExtLinkOpen"></i>
                </a>
              </div>
            </div>

            <div v-else-if="block.type === 'gallery'" class="previewBlock">
              <div class="previewGallery">
                <figure v-for="(img, i) in block.images.filter((g) => g.url)" :key="i" class="previewGalleryFig">
                  <img :src="img.url" :alt="img.caption || ''" loading="lazy" />
                  <figcaption v-if="img.caption">{{ img.caption }}</figcaption>
                </figure>
              </div>
              <p v-if="block.caption" class="previewImageAlt">{{ block.caption }}</p>
            </div>

            <div v-else-if="block.type === 'terminal'" class="previewBlock">
              <div class="terminalPreview">
                <div class="terminalBar">
                  <span class="termDot termDotRed"></span>
                  <span class="termDot termDotYellow"></span>
                  <span class="termDot termDotGreen"></span>
                  <span class="termTitle">terminal</span>
                </div>
                <div class="terminalBody">
                  <div v-for="(cmd, i) in block.commands.filter(Boolean)" :key="i" class="termLine">
                    <span class="termPrompt">$</span> {{ cmd }}
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="block.type === 'steps'" class="previewBlock">
              <ol class="previewSteps">
                <li v-for="(st, i) in block.steps.filter((s) => s.title)" :key="i" class="previewStep">
                  <span class="previewStepNum">{{ String(i + 1).padStart(2, '0') }}</span>
                  <div class="previewStepBody">
                    <span class="previewStepTitle">{{ st.title }}</span>
                    <span v-if="st.desc" class="previewStepDesc">{{ st.desc }}</span>
                  </div>
                </li>
              </ol>
            </div>

            <div v-else-if="block.type === 'checklist'" class="previewBlock">
              <ul class="previewChecklist">
                <li v-for="(it, i) in block.items.filter((x) => x.text)" :key="i" class="previewCheckItem" :class="{ done: it.done }">
                  <i :class="it.done ? 'mdi mdi-checkbox-marked' : 'mdi mdi-checkbox-blank-outline'"></i>
                  <span>{{ it.text }}</span>
                </li>
              </ul>
            </div>

            <div v-else-if="block.type === 'accordion'" class="previewBlock">
              <div v-for="(it, i) in block.items.filter((x) => x.title)" :key="i" class="previewAcc">
                <details :open="i === 0">
                  <summary>
                    <span>{{ it.title }}</span>
                    <i class="mdi mdi-chevron-down previewAccChevron"></i>
                  </summary>
                  <div class="previewAccBody mdRender" v-html="renderMarkdown(it.content)"></div>
                </details>
              </div>
            </div>

            <div v-else-if="block.type === 'embed' && block.url" class="previewBlock">
              <div class="embedPreviewWrap">
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

            <div v-else-if="block.type === 'divider'" class="previewBlock">
              <hr class="previewHr" />
            </div>

            <div v-else-if="block.type === 'question'" class="previewBlock previewQuestion">
              <div class="previewQuestionBadge" :class="block.tipo">
                {{ block.tipo === 'exercicio' ? 'Exercício' : 'Teórica' }} · {{ getQuestionModoLabel(block.modo) }}
              </div>
              <div class="mdRender" v-html="renderMarkdown(block.enunciado)"></div>
              <div v-if="block.modo === 'multipla_escolha'" class="previewAltList">
                <template v-for="(alt, ai) in block.alternativas" :key="ai">
                  <div
                    v-if="alt.texto"
                    class="previewAltItem"
                    :class="{ correta: ai === block.correta }"
                  >
                    <span class="previewAltBadge">{{ String.fromCharCode(65 + ai) }}</span>
                    <span class="previewAltText">{{ alt.texto }}</span>
                    <i v-if="ai === block.correta" class="mdi mdi-check previewAltCorrect"></i>
                  </div>
                </template>
              </div>
              <div v-if="block.modo === 'verdadeiro_falso'" class="previewVf">
                Resposta correta: <strong>{{ block.respostaVf ? 'Verdadeiro' : 'Falso' }}</strong>
              </div>
              <div v-if="block.modo === 'programacao'" class="previewProg">
                <span v-if="block.linguagem" class="previewProgLang">{{ block.linguagem }}</span>
                <pre v-if="block.codigoEsperado"><code>{{ block.codigoEsperado }}</code></pre>
              </div>
              <p v-if="block.modo === 'discursiva'" class="previewDiscursiva">Resposta livre em texto.</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.emptyPreview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-4);
  text-align: center;
  padding: var(--sp-16) var(--sp-6);
  border-radius: var(--radius-xl);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
}

.emptyIcon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  border: 1px dashed var(--color-border-2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.emptyIcon i {
  font-size: 1.8rem;
  color: var(--color-text-5);
}

.emptyPreview h3 {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-1);
}

.emptyPreview p {
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.previewCard {
  border-radius: var(--radius-xl);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  overflow: hidden;
}

.previewCover {
  display: block;
  width: 100%;
  height: 260px;
  object-fit: cover;
}

.previewBody {
  padding: var(--sp-8) var(--sp-8);
}

.previewTitle {
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--sp-2);
}

.previewDesc {
  font-size: var(--text-base);
  color: var(--color-text-4);
  margin-bottom: var(--sp-4);
}

.previewMeta {
  display: flex;
  gap: var(--sp-2);
  margin-bottom: var(--sp-6);
}

.previewTag {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: var(--text-xs);
  font-weight: 600;
}

.previewTag i {
  font-size: 0.85rem;
}

.previewBlocks {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.previewBlock {
  font-size: var(--text-base);
  color: var(--color-text-2);
  line-height: var(--leading-relaxed);
}

.previewPlainText {
  white-space: pre-wrap;
}

.previewCodeBlock {
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
}

.previewCodeLang {
  padding: var(--sp-2) var(--sp-4);
  background: var(--color-navy);
  color: var(--color-text-5);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

.previewCode {
  margin: 0;
  padding: var(--sp-4);
  background: var(--color-surface);
  overflow-x: auto;
}

.previewCode code {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: var(--text-sm);
  color: var(--color-text-2);
  line-height: 1.6;
}

.previewImage {
  width: 100%;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-1);
}

.previewImageAlt {
  font-size: var(--text-sm);
  color: var(--color-text-5);
  text-align: center;
  margin-top: var(--sp-2);
  font-style: italic;
}

.previewList {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.previewListItem {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: var(--text-sm);
  color: var(--color-text-2);
}

.previewListMarkerNum {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
  font-size: 0.65rem;
  font-weight: 700;
}

.previewListMarkerDot {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--color-navy-accent);
  font-size: 1.2rem;
}

.previewHr {
  border: none;
  height: 1px;
  background: var(--color-border-2);
  margin: var(--sp-4) 0;
}

.previewQuote {
  margin: 0;
  padding: var(--sp-5) var(--sp-6);
  border-left: 3px solid var(--color-navy-accent);
  background: var(--color-surface-3);
  border-radius: var(--radius-md);
}

.previewQuoteIcon {
  font-size: 1.4rem;
  color: var(--color-navy-accent);
  opacity: 0.5;
  display: block;
  margin-bottom: var(--sp-2);
}

.previewQuote p {
  font-size: var(--text-lg);
  font-style: italic;
  line-height: var(--leading-relaxed);
  color: var(--color-text-2);
  margin: 0;
}

.previewQuoteAuthor {
  margin-top: var(--sp-3);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-4);
}

.previewTableWrap {
  overflow-x: auto;
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
}

.previewTable {
  width: 100%;
  border-collapse: collapse;
}

.previewTable td {
  padding: var(--sp-2) var(--sp-4);
  border: 1px solid var(--color-border-1);
  font-size: var(--text-sm);
  color: var(--color-text-2);
  white-space: pre-wrap;
}

.previewTable th {
  padding: var(--sp-2) var(--sp-4);
  border: 1px solid var(--color-border-1);
  background: var(--color-surface-3);
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-1);
  text-align: left;
  white-space: pre-wrap;
}

.previewQuestion {
  padding: var(--sp-5);
  border-radius: var(--radius-lg);
  background: var(--color-surface-3);
  border-left: 3px solid var(--color-navy-accent);
}

.previewQuestionBadge {
  display: inline-flex;
  padding: var(--sp-1) var(--sp-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
  margin-bottom: var(--sp-3);
}

.previewQuestionBadge.exercicio {
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
}

.previewQuestionBadge.teorica {
  background: var(--color-surface-4);
  color: var(--color-text-3);
}

.previewVideoTitle {
  margin-top: var(--sp-2);
  font-size: var(--text-sm);
  color: var(--color-text-4);
  text-align: center;
}

.previewExtLinks {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.previewExtLink {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-2);
  text-decoration: none;
  transition: all var(--duration-fast) var(--ease-out);
}

.previewExtLink:hover {
  border-color: var(--color-navy-accent);
  transform: translateY(-1px);
}

.previewExtLinkIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: 1.1rem;
  flex-shrink: 0;
}

.previewExtLinkBody {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.previewExtLinkTitle {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-1);
}

.previewExtLinkDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.previewExtLinkUrl {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.previewExtLinkOpen {
  font-size: 1.1rem;
  color: var(--color-text-5);
  flex-shrink: 0;
}

.previewGallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--sp-4);
}

.previewGalleryFig {
  margin: 0;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border-2);
}

.previewGalleryFig img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  display: block;
}

.previewGalleryFig figcaption {
  padding: var(--sp-2) var(--sp-3);
  font-size: var(--text-xs);
  color: var(--color-text-4);
  font-style: italic;
  background: var(--color-surface-2);
}

.previewSteps {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
}

.previewStep {
  display: flex;
  gap: var(--sp-4);
}

.previewStepNum {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 700;
  flex-shrink: 0;
}

.previewStepBody {
  display: flex;
  flex-direction: column;
  padding-top: var(--sp-1);
}

.previewStepTitle {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
}

.previewStepDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
}

.previewChecklist {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.previewCheckItem {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: var(--text-sm);
  color: var(--color-text-2);
}

.previewCheckItem i {
  color: var(--color-text-5);
  flex-shrink: 0;
}

.previewCheckItem.done {
  opacity: 0.6;
}

.previewCheckItem.done i {
  color: var(--color-success);
}

.previewCheckItem.done span {
  text-decoration: line-through;
}

.previewAcc {
  margin-bottom: var(--sp-3);
  border: 1px solid var(--color-border-2);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-surface-2);
}

.previewAcc summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-4);
  cursor: pointer;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-1);
  list-style: none;
}

.previewAcc summary::-webkit-details-marker {
  display: none;
}

.previewAccChevron {
  color: var(--color-text-5);
  transition: transform var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.previewAcc[open] .previewAccChevron {
  transform: rotate(180deg);
}

.previewAccBody {
  padding: 0 var(--sp-4) var(--sp-3);
  font-size: var(--text-sm);
  color: var(--color-text-2);
  line-height: var(--leading-relaxed);
}

@media (max-width: 768px) {
  .previewBody {
    padding: var(--sp-5);
  }
}

@media (max-width: 480px) {
  .previewTitle {
    font-size: var(--text-2xl);
  }
}
</style>
