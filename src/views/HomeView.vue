<script setup>
import { computed } from 'vue'
import AppListCard from '../components/ui/AppListCard.vue'
import AppButton from '../components/ui/AppButton.vue'
import { anos, getAtividades } from '../data/disciplinas.js'

const anosList = computed(() =>
  Object.entries(anos).map(([id, ano]) => {
    let totalAtiv = 0
    for (const disc of ano.disciplinas) {
      totalAtiv += getAtividades(disc.id).length
    }
    return { id, ...ano, totalAtiv }
  }),
)

const stats = computed(() => {
  const disciplinas = anosList.value.reduce((sum, a) => sum + a.disciplinas.length, 0)
  const atividades = anosList.value.reduce((sum, a) => sum + a.totalAtiv, 0)
  return { anos: anosList.value.length, disciplinas, atividades }
})
</script>

<template>
  <div class="homeView">
    <div class="homeContent">
      <div class="homeHeader" v-reveal>
        <span class="homeKicker">Material do curso · IFC Campus Araquari</span>
        <h1 class="homeTitle">Escolha o seu ano</h1>
        <p class="homeDesc">Listas, provas e projetos do curso, organizados por ano.</p>

        <div class="homeRow">
          <div v-if="stats.disciplinas" class="homeStats">
            <span><strong>{{ stats.anos }}</strong> ano{{ stats.anos !== 1 ? 's' : '' }}</span>
            <span class="statDot">·</span>
            <span><strong>{{ stats.disciplinas }}</strong> disciplina{{ stats.disciplinas !== 1 ? 's' : '' }}</span>
            <span class="statDot">·</span>
            <span><strong>{{ stats.atividades }}</strong> atividade{{ stats.atividades !== 1 ? 's' : '' }}</span>
          </div>
          <div class="homeActions">
            <AppButton to="/buscar">
              <template #icon><i class="mdi mdi-magnify"></i></template>
              Buscar atividades
            </AppButton>
            <AppButton to="/sobre">
              <template #icon><i class="mdi mdi-information-outline"></i></template>
              Sobre o projeto
            </AppButton>
          </div>
        </div>
      </div>

      <div v-if="anosList.length" class="anosList">
        <AppListCard
          v-for="(item, idx) in anosList"
          :key="item.id"
          :to="`/ano/${item.id}`"
          v-reveal.left="idx"
        >
          <template #leading>
            <div class="anoNumber">{{ item.id }}º</div>
          </template>
          <h2 class="anoLabel">{{ item.label }}</h2>
          <p v-if="item.desc" class="anoDesc">{{ item.desc }}</p>
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
        </AppListCard>
      </div>

      <div v-else class="emptyState animate-fade-in-up">
        <div class="emptyStateIcon">
          <i class="mdi mdi-school-outline"></i>
        </div>
        <h2>Nenhum ano cadastrado</h2>
        <p>Ainda não há anos do curso configurados. Volte em breve.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.homeView {
  position: relative;
  min-height: calc(100vh - var(--header-h));
}

.homeContent {
  position: relative;
  z-index: 1;
  max-width: var(--max-w);
  margin: 0 auto;
  padding: var(--sp-8) var(--sp-6);
}

.homeHeader {
  margin-bottom: var(--sp-10);
}

.homeKicker {
  display: block;
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--color-navy-accent);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  margin-bottom: var(--sp-3);
}

.homeTitle {
  font-size: var(--text-4xl);
  font-weight: 800;
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--sp-2);
}

.homeDesc {
  font-size: var(--text-base);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
  max-width: 480px;
}

.homeRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--sp-4);
  margin-top: var(--sp-6);
  padding-top: var(--sp-5);
  border-top: 1px solid var(--color-border-1);
}

.homeStats {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.homeStats strong {
  color: var(--color-text-1);
  font-weight: 700;
}

.statDot {
  color: var(--color-text-5);
}

.homeActions {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex-wrap: wrap;
}

.anosList {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.anoNumber {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent);
  color: var(--color-text-on-accent);
  font-size: var(--text-lg);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.anoLabel {
  font-size: var(--text-md);
  font-weight: 700;
  color: var(--color-text-1);
  margin-bottom: var(--sp-1);
}

.anoDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  line-height: var(--leading-normal);
  margin-bottom: var(--sp-2);
}

.anoMeta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-1) var(--sp-4);
}

@media (max-width: 640px) {
  .homeTitle {
    font-size: var(--text-3xl);
  }

  .homeRow {
    flex-direction: column;
    align-items: flex-start;
  }

  .anoDesc {
    display: none;
  }
}
</style>
