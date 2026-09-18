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
        <p>
          Isso aqui começou como um problema chato: material do curso espalhado entre grupo do
          WhatsApp, Google Classroom, pen-drive e memória de quem já fez a disciplina. Toda vez
          que alguém precisava de uma lista antiga, tinha que perguntar pra alguém.
        </p>
        <p>
          A monitoria de Informática resolveu juntar tudo num lugar só, organizado por ano e
          disciplina, sem precisar de login pra consultar. Professores continuam publicando o
          conteúdo pelos canais de sempre — este site só reúne e organiza.
        </p>
        <p>
          É um projeto de estudante pra estudante, ainda em construção. Se encontrar algo quebrado,
          desatualizado ou faltando, o contato está no rodapé — toda sugestão ajuda.
        </p>
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
  gap: var(--sp-4);
  margin-bottom: var(--sp-12);
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
