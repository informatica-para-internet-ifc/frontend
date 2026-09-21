<script setup>
defineProps({
  disciplinaName: { type: String, default: '' },
  disciplinaId: { type: String, default: '' },
  anoId: { type: [Number, String], default: null },
})
</script>

<template>
  <div class="atividadeContent">
    <div class="notFound animate-fade-in-up">
      <div class="notFoundIllustration">
        <div class="notFoundCircle">
          <i class="mdi mdi-file-question-outline"></i>
        </div>
        <div class="notFoundDots">
          <span></span><span></span><span></span>
        </div>
      </div>

      <div class="notFoundContent">
        <h2>Atividade não encontrada</h2>
        <p class="notFoundDesc">
          A atividade que você procura não existe, foi removida ou o link está incorreto.
        </p>

        <div class="notFoundReasons">
          <div class="reasonItem">
            <i class="mdi mdi-link-variant-off"></i>
            <span>Link incorreto ou desatualizado</span>
          </div>
          <div class="reasonItem">
            <i class="mdi mdi-delete-outline"></i>
            <span>Atividade removida</span>
          </div>
          <div class="reasonItem">
            <i class="mdi mdi-database-remove-outline"></i>
            <span>Dados não encontrados no servidor</span>
          </div>
        </div>

        <div class="notFoundActions">
          <RouterLink :to="disciplinaName ? `/disciplina/${anoId || 1}/${disciplinaId}` : '/'" class="actionBtn actionBtnPrimary">
            <i class="mdi mdi-arrow-left"></i>
            {{ disciplinaName ? `Voltar para ${disciplinaName}` : 'Ver disciplinas' }}
          </RouterLink>
          <RouterLink to="/" class="actionBtn">
            <i class="mdi mdi-home-outline"></i>
            Página inicial
          </RouterLink>
          <RouterLink to="/buscar" class="actionBtn">
            <i class="mdi mdi-magnify"></i>
            Buscar atividades
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.atividadeContent {
  position: relative;
  z-index: 1;
  max-width: var(--max-w-narrow);
  margin: 0 auto;
  padding: var(--sp-8) var(--sp-6);
}

.notFound {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--sp-16) var(--sp-6);
}

.notFoundIllustration {
  position: relative;
  margin-bottom: var(--sp-8);
}

.notFoundCircle {
  width: 120px;
  height: 120px;
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  border: 2px dashed var(--color-border-2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  animation: notFoundPulse 3s ease-in-out infinite;
}

.notFoundCircle i {
  font-size: 3rem;
  color: var(--color-text-5);
}

@keyframes notFoundPulse {
  0%, 100% { transform: scale(1); border-color: var(--color-border-2); }
  50% { transform: scale(1.05); border-color: var(--color-navy-accent-muted); }
}

.notFoundDots {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 8px;
}

.notFoundDots span {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  animation: dotFloat 2s ease-in-out infinite;
}

.notFoundDots span:nth-child(2) { animation-delay: 0.3s; }
.notFoundDots span:nth-child(3) { animation-delay: 0.6s; }

@keyframes dotFloat {
  0%, 100% { opacity: 0.3; transform: translateY(0); }
  50% { opacity: 0.8; transform: translateY(-8px); }
}

.notFoundContent {
  max-width: 480px;
}

.notFoundContent h2 {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-1);
  margin-bottom: var(--sp-3);
}

.notFoundDesc {
  font-size: var(--text-base);
  color: var(--color-text-4);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--sp-6);
}

.notFoundReasons {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  margin-bottom: var(--sp-8);
  text-align: left;
}

.reasonItem {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  font-size: var(--text-sm);
  color: var(--color-text-3);
}

.reasonItem i {
  font-size: 1.1rem;
  color: var(--color-text-5);
  flex-shrink: 0;
}

.notFoundActions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-3);
  justify-content: center;
}

.actionBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-5);
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-2);
  color: var(--color-text-2);
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-spring);
  cursor: pointer;
}

.actionBtn:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.actionBtnPrimary {
  background: var(--color-navy-accent);
  border-color: var(--color-navy-accent);
  color: var(--color-text-on-accent);
}

.actionBtnPrimary:hover {
  background: var(--color-navy-accent-hover);
  border-color: var(--color-navy-accent-hover);
  color: var(--color-text-on-accent);
  box-shadow: var(--shadow-md);
}

@media (max-width: 480px) {
  .notFoundCircle {
    width: 96px;
    height: 96px;
  }

  .notFoundCircle i {
    font-size: 2.2rem;
  }

  .notFoundActions {
    flex-direction: column;
    width: 100%;
  }

  .actionBtn {
    justify-content: center;
  }
}
</style>
