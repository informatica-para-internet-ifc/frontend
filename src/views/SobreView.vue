<script setup>
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

const pessoas = [
  {
    nome: 'Kennedy Araujo',
    papel: 'Professor orientador',
    desc: 'Propôs o projeto como forma de organizar o material das próprias disciplinas.',
  },
  {
    nome: 'Paulo Artur Pereira',
    papel: 'Monitor · desenvolvimento',
    desc: 'Cuidou da maior parte do código, do front ao back.',
    github: 'https://github.com/Pauloartur-23',
  },
]
</script>

<template>
  <div class="sobreView">
<div class="sobreContent">
      <div class="sobreHeader" v-reveal>
        <button class="backBtn" @click="router.back()">
          <i class="mdi mdi-arrow-left"></i>
        </button>
        <h1 class="sobreTitle">Sobre este site</h1>
      </div>

      <div class="sobreBody" v-reveal="1">
        <section class="sobreSection">
          <h2 class="sobreSectionTitle">O que é</h2>
          <p>
            Este site é um catálogo do material do Curso Técnico em Informática para Internet do
            IFC Campus Araquari, organizado por ano e disciplina. Reúne listas de exercícios,
            provas, projetos e outros materiais de apoio num só lugar, com acesso livre e sem
            necessidade de login para consultar.
          </p>
        </section>

        <section class="sobreSection">
          <h2 class="sobreSectionTitle">Por que existe</h2>
          <p>
            Antes deste projeto, o material do curso ficava espalhado entre grupos de WhatsApp,
            Google Classroom e arquivos trocados individualmente entre alunos — sem um ponto único
            de consulta. Encontrar uma lista antiga dependia de perguntar a alguém que já tivesse
            cursado a disciplina. Este site resolve esse problema centralizando o conteúdo e
            facilitando o acesso para toda a turma, atual e futura.
          </p>
        </section>

        <section class="sobreSection">
          <h2 class="sobreSectionTitle">Como funciona</h2>
          <p>
            Os professores continuam publicando o conteúdo pelos canais de sempre — este site não
            substitui esse processo, apenas reúne e organiza o que já foi disponibilizado. A
            manutenção e atualização do catálogo são feitas pela monitoria de Informática.
          </p>
        </section>

        <section class="sobreSection">
          <h2 class="sobreSectionTitle">Contribua</h2>
          <p>
            Este é um projeto em desenvolvimento contínuo, mantido por estudantes para estudantes.
            Encontrou algo quebrado, desatualizado ou faltando? O contato está no rodapé desta
            página — toda sugestão é bem-vinda e ajuda a manter o material atualizado para os
            próximos alunos do curso.
          </p>
        </section>
      </div>

      <div class="sobreTeam" v-reveal="2">
        <h2 class="sobreTeamTitle">Quem fez</h2>
        <div class="teamGrid">
          <div v-for="p in pessoas" :key="p.nome" class="teamCard">
            <div class="teamAvatar">{{ p.nome.charAt(0) }}</div>
            <div class="teamInfo">
              <h3>{{ p.nome }}</h3>
              <span class="teamRole">{{ p.papel }}</span>
              <p>{{ p.desc }}</p>
              <a v-if="p.github" :href="p.github" target="_blank" rel="noopener noreferrer" class="teamGithub">
                <i class="mdi mdi-github"></i>
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="sobreFooterLinks" v-reveal="3">
        <RouterLink to="/" class="sobreLink">Ver o material do curso →</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sobreView {
  position: relative;
  min-height: calc(100vh - var(--header-h));
}

.sobreContent {
  position: relative;
  z-index: 1;
  max-width: var(--max-w-narrow);
  margin: 0 auto;
  padding: var(--sp-8) var(--sp-6) var(--sp-16);
}

.sobreHeader {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  margin-bottom: var(--sp-8);
}

.sobreTitle {
  font-size: var(--text-2xl);
  font-weight: 800;
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
}

.sobreBody {
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);
  margin-bottom: var(--sp-12);
}

.sobreSection {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.sobreSectionTitle {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-navy-accent);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

.sobreBody p {
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: var(--color-text-3);
}

.sobreTeamTitle {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-1);
  margin-bottom: var(--sp-5);
}

.teamGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--sp-4);
}

.teamCard {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-3);
  padding: var(--sp-5);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  box-shadow: var(--shadow-sm);
}

.teamAvatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background: var(--color-navy);
  color: #ffffff;
  font-weight: 700;
  font-size: var(--text-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.teamInfo h3 {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-1);
}

.teamRole {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-navy-accent);
  font-weight: 600;
  margin: 2px 0 var(--sp-2);
}

.teamInfo p {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  line-height: var(--leading-normal);
}

.teamGithub {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  margin-top: var(--sp-2);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-4);
  text-decoration: none;
}

.teamGithub:hover {
  color: var(--color-navy-accent);
}

.sobreFooterLinks {
  margin-top: var(--sp-12);
  padding-top: var(--sp-6);
  border-top: 1px solid var(--color-border-1);
}

.sobreLink {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-navy-accent);
  text-decoration: none;
}

.sobreLink:hover {
  text-decoration: underline;
}

@media (max-width: 480px) {
  .sobreTitle {
    font-size: var(--text-xl);
  }
}
</style>
