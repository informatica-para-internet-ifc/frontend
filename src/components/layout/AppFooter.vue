<script setup>
import { RouterLink } from 'vue-router'
import AppLogo from './ui/logo/AppLogo.vue'
import { anos } from '../../data/disciplinas.js'

const year = new Date().getFullYear()

const anosList = Object.entries(anos).map(([id, ano]) => ({
  id,
  label: ano.label,
}))

const links = [
  { to: '/', label: 'Início', icon: 'mdi-home-outline' },
  { to: '/buscar', label: 'Buscar', icon: 'mdi-magnify' },
  { to: '/sobre', label: 'Sobre', icon: 'mdi-information-outline' },
]
</script>

<template>
  <footer class="footer">
    <div class="footerInner">
      <div class="footerCol footerBrandCol" v-reveal="0">
        <AppLogo desc="Curso Técnico em Informática" />
        <p class="footerDesc">
          Sistema que reúne atividades, listas, projetos e materiais do curso técnico
          em Informática para Internet.
        </p>
        <span class="footerBadge">
          <i class="mdi mdi-map-marker-outline"></i>
          IFC Campus Araquari
        </span>
      </div>

      <div class="footerCol" v-reveal="1">
        <span class="footerColTitle">Navegação</span>
        <nav class="footerLinks">
          <RouterLink v-for="l in links" :key="l.to" :to="l.to" class="footerLink">
            <i :class="`mdi ${l.icon}`"></i>
            {{ l.label }}
          </RouterLink>
        </nav>
      </div>

      <div class="footerCol" v-reveal="2">
        <span class="footerColTitle">Anos do curso</span>
        <nav class="footerLinks">
          <RouterLink
            v-for="ano in anosList"
            :key="ano.id"
            :to="`/ano/${ano.id}`"
            class="footerLink"
          >
            <i class="mdi mdi-chevron-right"></i>
            {{ ano.label }}
          </RouterLink>
        </nav>
      </div>

      <div class="footerCol" v-reveal="3">
        <span class="footerColTitle">Contato</span>
        <nav class="footerLinks">
          <a href="mailto:informatica.araquari@ifc.edu.br" class="footerLink">
            <i class="mdi mdi-email-outline"></i>
            informatica.araquari@ifc.edu.br
          </a>
          <a href="https://ifc.edu.br/araquari" target="_blank" rel="noopener noreferrer" class="footerLink">
            <i class="mdi mdi-open-in-new"></i>
            ifc.edu.br/araquari
          </a>
        </nav>
      </div>
    </div>

    <div class="footerBottom">
      <div class="footerBottomInner">
        <span class="copy">&copy; {{ year }} Informática para Internet.</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--color-border-1);
  background: var(--color-surface);
  margin-top: auto;
}

.footerInner {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: var(--sp-12) var(--sp-6);
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1.2fr;
  gap: var(--sp-8);
}

.footerCol {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}

.footerBrandCol {
  gap: var(--sp-4);
}

.footerDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
  line-height: var(--leading-normal);
  max-width: 320px;
}

.footerBadge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  width: fit-content;
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-2);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-3);
  transition: all var(--duration-fast) var(--ease-out);
}

.footerBadge:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
}

.footerBadge i {
  color: var(--color-navy-accent);
  font-size: 0.9rem;
}

.footerColTitle {
  font-size: var(--text-sm);
  font-weight: 700;
  color: var(--color-text-1);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
  margin-bottom: var(--sp-2);
}

.footerLinks {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.footerLink {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--text-sm);
  color: var(--color-text-4);
  text-decoration: none;
  width: fit-content;
  max-width: 100%;
  word-break: break-word;
  transition: all var(--duration-fast) var(--ease-out);
}

.footerLink i {
  font-size: 0.9rem;
  color: var(--color-text-5);
  transition: all var(--duration-fast) var(--ease-out);
}

.footerLink:hover {
  color: var(--color-navy-accent);
  transform: translateX(3px);
}

.footerLink:hover i {
  color: var(--color-navy-accent);
}

.footerBottom {
  border-top: 1px solid var(--color-border-1);
  padding: var(--sp-5) var(--sp-6);
}

.footerBottomInner {
  max-width: var(--max-w);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-3);
  flex-wrap: wrap;
}

.copy {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  letter-spacing: var(--tracking-wide);
}

.madeWith {
  font-size: var(--text-xs);
  color: var(--color-text-5);
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
}

.madeWith i {
  color: var(--color-danger);
  font-size: 0.85rem;
}

@media (max-width: 860px) {
  .footerInner {
    grid-template-columns: 1fr 1fr;
  }

  .footerBrandCol {
    grid-column: 1 / -1;
  }
}

@media (max-width: 560px) {
  .footerInner {
    grid-template-columns: 1fr;
    gap: var(--sp-6);
  }

  .footerBottomInner {
    flex-direction: column;
    text-align: center;
  }
}
</style>
