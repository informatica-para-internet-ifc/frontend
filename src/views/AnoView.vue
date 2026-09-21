<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AppListCard from '../components/ui/AppListCard.vue'
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
<div class="anoContent" v-if="ano">
      <div class="anoHeader" v-reveal>
        <button class="backBtn" @click="router.back()">
          <i class="mdi mdi-arrow-left"></i>
        </button>
        <div class="anoInfo">
          <div class="breadcrumb">
            <RouterLink to="/">Início</RouterLink>
            <i class="mdi mdi-chevron-right"></i>
            <span>{{ ano.label }}</span>
          </div>
          <h1 class="anoTitle">{{ ano.label }}</h1>
          <p class="anoDesc">{{ ano.desc }}</p>
        </div>
      </div>

      <div class="disciplinasGrid">
        <AppListCard
          v-for="(disc, idx) in disciplinas"
          :key="disc.id"
          :to="`/disciplina/${anoId}/${disc.id}`"
          v-reveal.left="idx"
        >
          <template #leading>
            <div class="discIcon">
              <i :class="`mdi ${disc.icon}`"></i>
            </div>
          </template>
          <h2 class="discName">{{ disc.name }}</h2>
        </AppListCard>
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

.discIcon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-navy-accent-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--duration-fast) var(--ease-out);
}

.listCard:hover .discIcon {
  background: var(--color-navy-accent);
}

.discIcon i {
  font-size: 1.4rem;
  color: var(--color-navy-accent);
  transition: color var(--duration-fast) var(--ease-out);
}

.listCard:hover .discIcon i {
  color: var(--color-text-on-accent);
}

.discName {
  font-size: var(--text-md);
  font-weight: 600;
  color: var(--color-text-1);
}

@media (max-width: 480px) {
  .anoTitle {
    font-size: var(--text-2xl);
  }
}
</style>
