<script setup>
import { reactive } from 'vue'
import { getTipoLabel, getTipoIcon, getTipoClass } from '../../utils/atividadeQuestion.js'

defineProps({
  questoes: { type: Array, required: true },
})

const revealed = reactive({})

function toggleReveal(idx) {
  revealed[idx] = !revealed[idx]
}
</script>

<template>
  <div class="questoesList">
    <div
      v-for="(q, idx) in questoes"
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
      <button class="revealBtn" @click="toggleReveal(idx)">
        <i :class="revealed[idx] ? 'mdi mdi-eye-off' : 'mdi mdi-eye'"></i>
        {{ revealed[idx] ? 'Ocultar dica' : 'Ver dica' }}
      </button>
      <Transition name="expand">
        <div v-if="revealed[idx]" class="dicaBox">
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
</template>

<style scoped>
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
