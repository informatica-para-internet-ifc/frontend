<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { getAno } from '../data/disciplinas.js'

const props = defineProps({
  anoId: { type: String, required: true },
})

const router = useRouter()

const ano = computed(() => getAno(Number(props.anoId)))
const disciplinas = computed(() => ano.value?.disciplinas || [])
</script>

<template>
  <div class="anoView">
    <div class="pageDeco">
      <div class="pageDecoDots"></div>
      <div class="pageDecoGrid"></div>
    </div>

    <div class="anoContent" v-if="ano">
      <div class="anoHeader" v-reveal>
        <button class="backBtn" @click="router.back()">
          <i class="mdi mdi-arrow-left"></i>
        </button>
        <div class="anoInfo">
          <div class="breadcrumb">
            <RouterLink to="/anos">Anos</RouterLink>
            <i class="mdi mdi-chevron-right"></i>
            <span>{{ ano.label }}</span>
          </div>
          <h1 class="anoTitle">{{ ano.label }}</h1>
          <p class="anoDesc">{{ ano.desc }}</p>
        </div>
      </div>

      <div class="disciplinasGrid">
        <RouterLink
          v-for="(disc, idx) in disciplinas"
          :key="disc.id"
          :to="`/disciplina/${anoId}/${disc.id}`"
          class="disciplinaCard"
          v-reveal="idx % 8"
        >
          <div class="discIcon">
            <i :class="`mdi ${disc.icon}`"></i>
          </div>
          <div class="discContent">
            <h2 class="discName">{{ disc.name }}</h2>
          </div>
          <i class="mdi mdi-chevron-right discArrow"></i>
        </RouterLink>
      </div>
    </div>

    <div class="anoContent" v-else>
      <div class="emptyState animate-fade-in-up">
        <div class="emptyStateIcon">
          <i class="mdi mdi-alert-circle-outline"></i>
        </div>
        <h2>Ano não encontrado</h2>
        <p>O ano solicitado não existe.</p>
        <RouterLink to="/" class="backHome">Voltar ao início</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anoView {
  position: relative;
  min-height: calc(100vh - var(--header-h));
}

.anoContent {
  position: relative;
  z-index: 1;
  max-width: var(--max-w);
  margin: 0 auto;
  padding: var(--sp-8) var(--sp-6);
}

.anoHeader {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-4);
  margin-bottom: var(--sp-8);
}

.anoInfo {
  flex: 1;
}

.anoTitle {
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--sp-2);
}

.anoDesc {
  font-size: var(--text-base);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
}

.disciplinasGrid {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.disciplinaCard {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-5) var(--sp-6);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-spring);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.disciplinaCard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 3px;
  background: var(--color-navy-accent);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.disciplinaCard:hover {
  background: var(--color-surface-3);
  border-color: var(--color-border-2);
  transform: translateX(4px) translateY(-1px);
  box-shadow: var(--shadow-md);
}

.disciplinaCard:hover::before {
  opacity: 1;
}

.discIcon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--duration-normal) var(--ease-spring);
}

.disciplinaCard:hover .discIcon {
  background: var(--color-navy-accent);
}

.discIcon i {
  font-size: 1.4rem;
  color: var(--color-navy-accent);
  transition: color var(--duration-fast) var(--ease-out);
}

.disciplinaCard:hover .discIcon i {
  color: var(--color-text-on-accent);
}

.discContent {
  flex: 1;
  min-width: 0;
}

.discName {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
}

.discArrow {
  font-size: 1.2rem;
  color: var(--color-text-5);
  transition: all var(--duration-normal) var(--ease-spring);
  flex-shrink: 0;
}

.disciplinaCard:hover .discArrow {
  color: var(--color-navy-accent);
  transform: translateX(6px) scale(1.1);
}

@media (max-width: 480px) {
  .anoTitle {
    font-size: var(--text-2xl);
  }

  .disciplinaCard {
    padding: var(--sp-4);
  }
}
</style>
