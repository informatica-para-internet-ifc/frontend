<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { anos, getAtividades } from '../data/disciplinas.js'

const router = useRouter()

const anosList = computed(() =>
  Object.entries(anos).map(([id, ano]) => {
    let totalAtiv = 0
    for (const disc of ano.disciplinas) {
      totalAtiv += getAtividades(disc.id).length
    }
    return { id, ...ano, totalAtiv }
  }),
)
</script>

<template>
  <div class="anosView">
    <div class="pageDeco">
      <div class="pageDecoDots"></div>
      <div class="pageDecoGrid"></div>
    </div>

    <div class="anosContent">
      <div class="anosHeader" v-reveal>
        <button class="backBtn" @click="router.back()">
          <i class="mdi mdi-arrow-left"></i>
        </button>
        <div class="anosHeaderText">
          <h1 class="anosTitle">Atividades por Ano</h1>
          <p class="anosDesc">Selecione um ano para ver todas as atividades e disciplinas do curso técnico.</p>
        </div>
      </div>

      <div v-if="anosList.length" class="anosList">
        <RouterLink
          v-for="(item, idx) in anosList"
          :key="item.id"
          :to="`/ano/${item.id}`"
          class="anoCard"
          v-reveal.left="idx"
        >
          <div class="anoLeft">
            <div class="anoNumber">{{ item.id }}º</div>
            <div class="anoAccent"></div>
          </div>

          <div class="anoContent">
            <h2 class="anoLabel">{{ item.label }}</h2>
            <p class="anoDesc">{{ item.desc }}</p>
            <div class="anoMeta">
              <span class="metaItem">
                <i class="mdi mdi-bookshelf"></i>
                {{ item.disciplinas.length }} disciplina{{ item.disciplinas.length > 1 ? 's' : '' }}
              </span>
              <span class="metaItem">
                <i class="mdi mdi-file-document-outline"></i>
                {{ item.totalAtiv }} atividade{{ item.totalAtiv > 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <div class="anoRight">
            <div class="anoArrow">
              <i class="mdi mdi-arrow-right"></i>
            </div>
          </div>
        </RouterLink>
      </div>

      <div v-else class="emptyState animate-fade-in-up">
        <div class="emptyStateIcon">
          <i class="mdi mdi-school-outline"></i>
        </div>
        <h2>Nenhum ano cadastrado</h2>
        <p>Ainda não há anos do curso configurados. Volte em breve.</p>
        <RouterLink to="/" class="backHome">Voltar ao início</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.anosView {
  position: relative;
  min-height: calc(100vh - var(--header-h));
}

.anosContent {
  position: relative;
  z-index: 1;
  max-width: var(--max-w);
  margin: 0 auto;
  padding: var(--sp-8) var(--sp-6);
}

.anosHeader {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-4);
  margin-bottom: var(--sp-10);
}

.anosHeaderText {
  flex: 1;
}

.anosTitle {
  font-size: var(--text-3xl);
  font-weight: 800;
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--sp-2);
}

.anosDesc {
  font-size: var(--text-base);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
}

.anosList {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.anoCard {
  display: flex;
  align-items: stretch;
  gap: var(--sp-6);
  padding: var(--sp-6);
  border-radius: var(--radius-xl);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-spring);
  overflow: hidden;
  position: relative;
}

.anoCard::before {
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

.anoCard:hover {
  transform: translateX(4px) translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-border-2);
}

.anoCard:hover::before {
  opacity: 1;
}

.anoLeft {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  flex-shrink: 0;
}

.anoNumber {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-xl);
  background: var(--color-navy-accent-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-2xl);
  font-weight: 900;
  color: var(--color-navy-accent);
  transition: all var(--duration-normal) var(--ease-spring);
  position: relative;
}

.anoCard:hover .anoNumber {
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
}

.anoAccent {
  width: 4px;
  flex: 1;
  border-radius: 2px;
  background: linear-gradient(180deg, var(--color-navy-accent), transparent);
  opacity: 0.3;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.anoCard:hover .anoAccent {
  opacity: 0.7;
}

.anoContent {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.anoLabel {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--color-text-1);
}

.anoDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
}

.anoMeta {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  margin-top: var(--sp-1);
}

.anoRight {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.anoArrow {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: var(--color-surface-3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-5);
  transition: all var(--duration-normal) var(--ease-spring);
  flex-shrink: 0;
}

.anoCard:hover .anoArrow {
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
  transform: translateX(4px);
}

@media (max-width: 640px) {
  .anosTitle {
    font-size: var(--text-2xl);
  }

  .anoCard {
    align-items: flex-start;
    padding: var(--sp-5);
    gap: var(--sp-4);
  }

  .anoAccent {
    display: none;
  }

  .anoNumber {
    width: 44px;
    height: 44px;
    font-size: var(--text-lg);
    border-radius: var(--radius-lg);
  }

  .anoRight {
    align-self: flex-start;
  }

  .anoArrow {
    width: 32px;
    height: 32px;
  }

  .anoMeta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-1);
  }
}
</style>
