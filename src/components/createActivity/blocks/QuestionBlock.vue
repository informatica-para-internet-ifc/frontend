<script setup>
import { renderMarkdown } from '../../../composables/useMarkdown.js'
import { questionModos } from '../../../utils/activityBlocks.js'
import '../createActivityShared.css'

const block = defineModel('block', { type: Object, required: true })

function addAlternativa() {
  block.value.alternativas.push({ texto: '' })
}

function removeAlternativa(idx) {
  if (block.value.alternativas.length > 2) block.value.alternativas.splice(idx, 1)
}
</script>

<template>
  <textarea
    v-model="block.enunciado"
    class="blockTextarea"
    placeholder="Escreva o enunciado da questão..."
    rows="3"
  ></textarea>
  <div class="blockMeta">
    <span class="charCount">{{ block.enunciado?.length || 0 }} caracteres</span>
  </div>
  <div class="questionTypeRow">
    <button
      class="tipoBtn"
      :class="{ active: block.tipo === 'exercicio' }"
      @click="block.tipo = 'exercicio'"
    >
      <i class="mdi mdi-pencil-outline"></i>
      Exercício
    </button>
    <button
      class="tipoBtn"
      :class="{ active: block.tipo === 'teorica' }"
      @click="block.tipo = 'teorica'"
    >
      <i class="mdi mdi-text-box-outline"></i>
      Teórica
    </button>
  </div>
  <div class="questionTypeRow">
    <button
      v-for="qm in questionModos"
      :key="qm.value"
      class="tipoBtn modoBtn"
      :class="{ active: block.modo === qm.value }"
      @click="block.modo = qm.value"
    >
      <i :class="`mdi ${qm.icon}`"></i>
      {{ qm.label }}
    </button>
  </div>
  <div v-if="block.modo === 'multipla_escolha'" class="alternativasEditor">
    <div v-for="(alt, ai) in block.alternativas" :key="ai" class="alternativaRow">
      <label class="radioCorrect">
        <input type="radio" name="correta" :value="ai" v-model="block.correta" />
        <span class="radioCorrectBox"><i class="mdi mdi-check"></i></span>
      </label>
      <input
        v-model="alt.texto"
        class="blockInput"
        :placeholder="`Alternativa ${String.fromCharCode(65 + ai)}`"
      />
      <button class="listItemRemove" @click="removeAlternativa(ai)" :disabled="block.alternativas.length <= 2">
        <i class="mdi mdi-close"></i>
      </button>
    </div>
    <button type="button" class="addListItemBtn" @click="addAlternativa()">
      <i class="mdi mdi-plus"></i>
      Adicionar alternativa
    </button>
  </div>
  <div v-else-if="block.modo === 'verdadeiro_falso'" class="vfRow">
    <button
      class="tipoBtn"
      :class="{ active: block.respostaVf === true }"
      @click="block.respostaVf = true"
    >
      <i class="mdi mdi-check-circle-outline"></i>
      Verdadeiro
    </button>
    <button
      class="tipoBtn"
      :class="{ active: block.respostaVf === false }"
      @click="block.respostaVf = false"
    >
      <i class="mdi mdi-close-circle-outline"></i>
      Falso
    </button>
  </div>
  <div v-else-if="block.modo === 'programacao'" class="progFields">
    <select v-model="block.linguagem" class="blockInput">
      <option value="javascript">JavaScript</option>
      <option value="python">Python</option>
      <option value="html">HTML</option>
      <option value="css">CSS</option>
      <option value="sql">SQL</option>
      <option value="bash">Bash</option>
      <option value="java">Java</option>
    </select>
    <textarea
      v-model="block.codigoEsperado"
      class="blockTextarea"
      placeholder="Código esperado (opcional)"
      rows="3"
    ></textarea>
  </div>
  <div class="blockPreview" v-if="block.enunciado">
    <div class="mdRender" v-html="renderMarkdown(block.enunciado)"></div>
    <div v-if="block.modo === 'multipla_escolha' && block.alternativas.some((a) => a.texto)" class="previewAltList">
      <template v-for="(alt, ai) in block.alternativas" :key="ai">
        <div v-if="alt.texto" class="previewAltItem" :class="{ correta: ai === block.correta }">
          <span class="previewAltBadge">{{ String.fromCharCode(65 + ai) }}</span>
          <span class="previewAltText">{{ alt.texto }}</span>
          <i v-if="ai === block.correta" class="mdi mdi-check previewAltCorrect"></i>
        </div>
      </template>
    </div>
    <div v-if="block.modo === 'verdadeiro_falso'" class="previewVf">
      Resposta correta: <strong>{{ block.respostaVf ? 'Verdadeiro' : 'Falso' }}</strong>
    </div>
    <div v-if="block.modo === 'programacao' && block.codigoEsperado" class="previewProg">
      <span class="previewProgLang">{{ block.linguagem }}</span>
      <pre><code>{{ block.codigoEsperado }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.questionTypeRow {
  display: flex;
  gap: var(--sp-2);
}

.tipoBtn {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface);
  color: var(--color-text-4);
  font-size: var(--text-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.tipoBtn.active {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.modoBtn {
  font-size: var(--text-xs);
}

.alternativasEditor {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.alternativaRow {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
}

.radioCorrect {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  flex-shrink: 0;
}

.radioCorrect input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.radioCorrectBox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border-3);
  color: transparent;
  font-size: 0.8rem;
  transition: all var(--duration-fast) var(--ease-out);
  flex-shrink: 0;
}

.radioCorrect input:checked + .radioCorrectBox {
  background: var(--color-success);
  border-color: var(--color-success);
  color: #ffffff;
}

.vfRow {
  display: flex;
  gap: var(--sp-2);
}

.progFields {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
</style>
