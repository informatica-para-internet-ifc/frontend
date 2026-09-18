<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { anos, getAtividades } from '../data/disciplinas.js'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loginError = ref('')
const isLoading = ref(false)
const showForm = ref(false)

const initials = computed(() => {
  if (!auth.user?.nome) return 'U'
  return auth.user.nome.charAt(0).toUpperCase()
})

const stats = computed(() => {
  let totalDisc = 0
  let totalAtiv = 0
  let totalQuest = 0
  for (const [, ano] of Object.entries(anos)) {
    totalDisc += ano.disciplinas.length
    for (const disc of ano.disciplinas) {
      const lista = getAtividades(disc.id)
      totalAtiv += lista.length
      for (const ativ of lista) {
        totalQuest += (ativ.questoes || []).length
      }
    }
  }
  return { disciplinas: totalDisc, atividades: totalAtiv, questoes: totalQuest }
})

const disciplinasFlat = computed(() => {
  const list = []
  for (const [anoId, ano] of Object.entries(anos)) {
    for (const disc of ano.disciplinas) {
      list.push({
        ...disc,
        anoId,
        anoLabel: ano.label,
        count: getAtividades(disc.id).length,
      })
    }
  }
  return list
})

watch(
  () => auth.isLoggedIn,
  (val) => {
    showForm.value = !val
  },
  { immediate: true },
)

async function handleLogin() {
  loginError.value = ''
  isLoading.value = true
  const ok = await auth.login(email.value, password.value)
  isLoading.value = false
  if (!ok) {
    loginError.value = 'E-mail ou senha inválidos.'
    return
  }
  const redirect = router.currentRoute.value.query.redirect
  if (redirect) router.push(redirect)
}

async function handleLogout() {
  isLoading.value = true
  auth.logout()
  isLoading.value = false
}

async function handleQuickLogin() {
  isLoading.value = true
  await auth.quickLogin()
  isLoading.value = false
  const redirect = router.currentRoute.value.query.redirect
  if (redirect) router.push(redirect)
}
</script>

<template>
  <div class="profilePage">
<Transition name="card-switch" mode="out-in">
      <!-- ===== ADMIN PANEL ===== -->
      <div v-if="auth.isLoggedIn" key="logged" class="adminView">
        <div class="adminTopBar">
          <div class="adminUser">
            <div class="avatarRing">
              <div class="avatar">{{ initials }}</div>
            </div>
            <div class="adminUserInfo">
              <h1 class="adminName">{{ auth.user?.nome || 'Usuário' }}</h1>
              <p class="adminEmail">{{ auth.user?.email }}</p>
            </div>
          </div>
          <button class="logoutBtn" @click="handleLogout">
            <i class="mdi mdi-logout"></i>
            <span>Sair</span>
          </button>
        </div>

        <div class="statsRow" v-reveal>
          <div class="statPill">
            <i class="mdi mdi-bookshelf"></i>
            <span class="statNum">{{ stats.disciplinas }}</span>
            <span class="statTxt">Disciplinas</span>
          </div>
          <div class="statPill">
            <i class="mdi mdi-file-document-multiple"></i>
            <span class="statNum">{{ stats.atividades }}</span>
            <span class="statTxt">Atividades</span>
          </div>
          <div class="statPill">
            <i class="mdi mdi-help-rhombus"></i>
            <span class="statNum">{{ stats.questoes }}</span>
            <span class="statTxt">Questões</span>
          </div>
        </div>

        <div class="quickActions" v-reveal="1">
          <RouterLink to="/criar-atividade" class="quickCard quickCardPrimary">
            <div class="quickIcon">
              <i class="mdi mdi-plus-circle-outline"></i>
            </div>
            <div class="quickText">
              <h3>Criar Atividade</h3>
              <p>Adicione novas atividades com blocos de conteúdo</p>
            </div>
            <i class="mdi mdi-chevron-right quickArrow"></i>
          </RouterLink>

          <RouterLink to="/buscar" class="quickCard">
            <div class="quickIcon">
              <i class="mdi mdi-magnify"></i>
            </div>
            <div class="quickText">
              <h3>Buscar Conteúdo</h3>
              <p>Pesquise atividades existentes</p>
            </div>
            <i class="mdi mdi-chevron-right quickArrow"></i>
          </RouterLink>

          <RouterLink to="/" class="quickCard">
            <div class="quickIcon">
              <i class="mdi mdi-school-outline"></i>
            </div>
            <div class="quickText">
              <h3>Ver Anos</h3>
              <p>Navegue pela estrutura do curso</p>
            </div>
            <i class="mdi mdi-chevron-right quickArrow"></i>
          </RouterLink>
        </div>

        <div class="adminSection" v-reveal="2">
          <div class="sectionHeader">
            <h2 class="sectionTitle">
              <i class="mdi mdi-folder-open-outline"></i>
              Disciplinas
            </h2>
            <span class="sectionCount">
              {{ disciplinasFlat.length }} disciplina{{ disciplinasFlat.length !== 1 ? 's' : '' }}
            </span>
          </div>

          <div class="discGrid">
            <RouterLink
              v-for="disc in disciplinasFlat"
              :key="disc.id"
              :to="`/disciplina/${disc.anoId}/${disc.id}`"
              class="discCard"
            >
              <div class="discCardTop">
                <div class="discCardIcon">
                  <i :class="`mdi ${disc.icon}`"></i>
                </div>
                <span class="discAnoBadge">{{ disc.anoLabel }}</span>
              </div>
              <h4 class="discCardTitle">{{ disc.name }}</h4>
              <div class="discCardFooter">
                <span class="discAtivCount">
                  <i class="mdi mdi-file-document-multiple-outline"></i>
                  {{ disc.count }} atividade{{ disc.count !== 1 ? 's' : '' }}
                </span>
                <i class="mdi mdi-chevron-right discCardArrow"></i>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- ===== LOGIN CARD ===== -->
      <div v-else key="login" class="loginWrapper">
        <div class="loginLayout">
          <div class="loginCard animate-fade-in-up delay-1">
          <div class="loginBody">
            <div class="loginIconWrap">
              <div class="loginIconRing">
                <i class="mdi mdi-shield-lock-outline loginIcon"></i>
              </div>
            </div>

            <div class="loginInfo">
              <h1 class="loginTitle">Acesso Restrito</h1>
              <p class="loginDesc">Faça login para gerenciar atividades e conteúdos.</p>
            </div>

            <form class="loginForm" @submit.prevent="handleLogin">
              <div class="field">
                <label for="email">
                  <i class="mdi mdi-email-outline"></i>
                  E-mail
                </label>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div class="field">
                <label for="password">
                  <i class="mdi mdi-lock-outline"></i>
                  Senha
                </label>
                <input
                  id="password"
                  v-model="password"
                  type="password"
                  placeholder="Sua senha"
                  required
                />
              </div>

              <Transition name="error-slide">
                <p v-if="loginError" class="error">
                  <i class="mdi mdi-alert-circle-outline"></i>
                  {{ loginError }}
                </p>
              </Transition>

              <button
                type="submit"
                class="loginBtn"
                :class="{ loading: isLoading }"
                :disabled="isLoading"
              >
                <Transition name="btn-icon" mode="out-in">
                  <i v-if="isLoading" key="loading" class="mdi mdi-loading mdi-spin"></i>
                  <i v-else key="idle" class="mdi mdi-login"></i>
                </Transition>
                {{ isLoading ? 'Entrando...' : 'Entrar' }}
              </button>
            </form>

            <div class="divider">
              <span>ou</span>
            </div>

            <button class="quickLoginBtn" @click="handleQuickLogin" :disabled="isLoading">
              <i class="mdi mdi-flash-outline"></i>
              Entrar rápido (Demo)
            </button>
          </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.profilePage {
  position: relative;
  min-height: calc(100vh - var(--header-h));
}

/* =============================================
   LOGIN
   ============================================= */
.loginWrapper {
  display: flex;
  justify-content: center;
  padding: var(--sp-10) var(--sp-6);
}

.loginLayout {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.loginCard {
  width: 100%;
  max-width: 440px;
  border-radius: var(--radius-xl);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 1;
}

.loginBody {
  padding: var(--sp-8) var(--sp-8) var(--sp-6);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-5);
}

.loginIconWrap {
  margin-bottom: var(--sp-1);
}

.loginIconRing {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  border: 2px solid var(--color-border-2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--duration-normal) var(--ease-spring);
}

.loginIconRing:hover {
  transform: scale(1.04);
  border-color: var(--color-navy-accent);
}

.loginIcon {
  font-size: 2.2rem;
  color: var(--color-navy-accent);
}

.loginInfo {
  text-align: center;
}

.loginTitle {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
  margin-bottom: var(--sp-1);
}

.loginDesc {
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.loginForm {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  width: 100%;
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.field label {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.field label i {
  font-size: 0.9rem;
  color: var(--color-navy-accent);
}

.field input {
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-2);
  background: var(--color-surface-3);
  font-size: var(--text-sm);
  color: var(--color-text-1);
  outline: none;
  transition: all var(--duration-normal) var(--ease-spring);
}

.field input::placeholder {
  color: var(--color-text-5);
}

.field input:focus {
  border-color: var(--color-navy-accent);
  box-shadow: 0 0 0 3px var(--color-navy-accent-muted);
  transform: translateY(-1px);
}

.error {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--text-sm);
  color: var(--color-danger);
  justify-content: center;
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius-md);
  background: var(--color-danger-muted);
}

.loginBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-6);
  border-radius: var(--radius-md);
  background: var(--color-navy-accent);
  border: none;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-on-accent);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
  width: 100%;
  justify-content: center;
}

.loginBtn:hover {
  background: var(--color-navy-accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.loginBtn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.divider {
  width: 100%;
  height: 1px;
  background: var(--color-border-1);
  position: relative;
}

.divider span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0 var(--sp-3);
  background: var(--color-surface-2);
  font-size: var(--text-xs);
  color: var(--color-text-5);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

.quickLoginBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-3) var(--sp-6);
  border-radius: var(--radius-md);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-2);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-2);
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-spring);
  width: 100%;
  justify-content: center;
}

.quickLoginBtn:hover {
  border-color: var(--color-navy-accent);
  color: var(--color-navy-accent);
  background: var(--color-navy-accent-muted);
  transform: translateY(-1px);
}

.quickLoginBtn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

/* =============================================
   ADMIN PANEL
   ============================================= */
.adminView {
  position: relative;
  z-index: 1;
  max-width: var(--max-w);
  margin: 0 auto;
  padding: var(--sp-8) var(--sp-6);
}

.adminTopBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-4);
  margin-bottom: var(--sp-6);
  padding-bottom: var(--sp-6);
  border-bottom: 1px solid var(--color-border-1);
}

.adminUser {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
}

.avatarRing {
  padding: 3px;
  border-radius: var(--radius-full);
  background: var(--color-navy-accent);
  flex-shrink: 0;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-full);
  background: var(--color-navy);
  border: 2px solid var(--color-surface);
  color: #ffffff;
  font-size: var(--text-xl);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.adminUserInfo {
  display: flex;
  flex-direction: column;
}

.adminName {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-1);
  letter-spacing: var(--tracking-tight);
}

.adminEmail {
  font-size: var(--text-sm);
  color: var(--color-text-4);
}

.logoutBtn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-2) var(--sp-4);
  border-radius: var(--radius-md);
  background: var(--color-surface-3);
  border: 1px solid var(--color-border-2);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-3);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-spring);
  flex-shrink: 0;
}

.logoutBtn:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background: var(--color-danger-muted);
  transform: translateY(-1px);
}

/* Stats */
.statsRow {
  display: flex;
  gap: var(--sp-3);
  margin-bottom: var(--sp-6);
}

.statPill {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
}

.statPill i {
  font-size: 1.2rem;
  color: var(--color-navy-accent);
}

.statNum {
  font-size: var(--text-xl);
  font-weight: 800;
  color: var(--color-text-1);
}

.statTxt {
  font-size: var(--text-xs);
  color: var(--color-text-4);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

/* Quick Actions */
.quickActions {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  margin-bottom: var(--sp-8);
}

.quickCard {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-4) var(--sp-5);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-spring);
}

.quickCard:hover {
  border-color: var(--color-border-2);
  transform: translateX(4px);
  box-shadow: var(--shadow-md);
}

.quickCardPrimary {
  background: var(--color-navy-accent-muted);
  border-color: var(--color-navy-accent);
}

.quickCardPrimary:hover {
  background: var(--color-navy-accent);
}

.quickCardPrimary:hover .quickText h3,
.quickCardPrimary:hover .quickText p {
  color: var(--color-text-on-accent);
}

.quickCardPrimary:hover .quickIcon {
  background: rgba(255, 255, 255, 0.2);
}

.quickCardPrimary:hover .quickIcon i {
  color: var(--color-text-on-accent);
}

.quickCardPrimary:hover .quickArrow {
  color: var(--color-text-on-accent);
  opacity: 0.7;
}

.quickIcon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-surface-3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--duration-normal) var(--ease-spring);
}

.quickIcon i {
  font-size: 1.2rem;
  color: var(--color-navy-accent);
  transition: color var(--duration-fast) var(--ease-out);
}

.quickCard:hover .quickIcon {
  transform: scale(1.05);
}

.quickText {
  flex: 1;
  min-width: 0;
}

.quickText h3 {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 2px;
}

.quickText p {
  font-size: var(--text-xs);
  color: var(--color-text-4);
}

.quickArrow {
  font-size: 1.2rem;
  color: var(--color-text-5);
  flex-shrink: 0;
  transition: all var(--duration-normal) var(--ease-spring);
}

.quickCard:hover .quickArrow {
  color: var(--color-navy-accent);
  transform: translateX(4px);
}

/* Sections */
.adminSection {
  margin-bottom: var(--sp-8);
}

.sectionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-5);
}

.sectionTitle {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text-1);
}

.sectionTitle i {
  color: var(--color-navy-accent);
}

.sectionCount {
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-text-4);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wider);
}

/* Discipline Grid */
.discGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--sp-4);
}

.discCard {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding: var(--sp-5);
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border-1);
  text-decoration: none;
  transition: all var(--duration-normal) var(--ease-spring);
}

.discCard:hover {
  border-color: var(--color-navy-accent);
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.discCardTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
}

.discCardIcon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-surface-3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all var(--duration-normal) var(--ease-spring);
}

.discCardIcon i {
  font-size: 1.1rem;
  color: var(--color-text-3);
  transition: color var(--duration-fast) var(--ease-out);
}

.discCard:hover .discCardIcon {
  background: var(--color-navy-accent);
}

.discCard:hover .discCardIcon i {
  color: var(--color-text-on-accent);
}

.discAnoBadge {
  padding: var(--sp-1) var(--sp-2);
  border-radius: var(--radius-full);
  background: var(--color-navy-accent-muted);
  color: var(--color-navy-accent);
  font-size: var(--text-xs);
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.discCardTitle {
  flex: 1;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-1);
  line-height: var(--leading-snug);
}

.discCardFooter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  padding-top: var(--sp-3);
  border-top: 1px solid var(--color-border-1);
}

.discAtivCount {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  font-size: var(--text-xs);
  color: var(--color-text-5);
}

.discAtivCount i {
  font-size: 0.95rem;
  color: var(--color-text-5);
}

.discCardArrow {
  font-size: 1rem;
  color: var(--color-text-5);
  flex-shrink: 0;
  transition: all var(--duration-normal) var(--ease-spring);
}

.discCard:hover .discCardArrow {
  color: var(--color-navy-accent);
  transform: translateX(3px);
}

/* Transitions */
.card-switch-enter-active {
  transition: all 0.5s var(--ease-out);
}

.card-switch-leave-active {
  transition: all 0.3s var(--ease-out);
}

.card-switch-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.card-switch-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.error-slide-enter-active {
  transition: all 0.3s var(--ease-spring);
}

.error-slide-leave-active {
  transition: all 0.2s var(--ease-out);
}

.error-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.error-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.btn-icon-enter-active {
  transition: all 0.2s var(--ease-spring);
}

.btn-icon-leave-active {
  transition: all 0.1s ease-in;
}

.btn-icon-enter-from {
  opacity: 0;
  transform: scale(0.5);
}

.btn-icon-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

@media (max-width: 860px) {
  .adminView {
    padding: var(--sp-6) var(--sp-5);
  }

  .discGrid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 640px) {
  .loginWrapper {
    padding: var(--sp-6) var(--sp-4);
  }

  .adminTopBar {
    flex-wrap: wrap;
    gap: var(--sp-3);
  }

  .adminName {
    font-size: var(--text-lg);
  }

  .adminEmail {
    max-width: 60vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .logoutBtn span {
    display: none;
  }

  .statsRow {
    gap: var(--sp-2);
  }

  .statPill {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-1);
    padding: var(--sp-3);
  }

  .statNum {
    font-size: var(--text-lg);
  }

  .quickCard {
    padding: var(--sp-3) var(--sp-4);
  }

  .sectionHeader {
    flex-wrap: wrap;
    gap: var(--sp-1);
  }

  .discGrid {
    grid-template-columns: 1fr 1fr;
    gap: var(--sp-3);
  }
}

@media (max-width: 460px) {
  .adminView {
    padding: var(--sp-5) var(--sp-4);
  }

  .avatar {
    width: 44px;
    height: 44px;
    font-size: var(--text-lg);
  }

  .statsRow {
    flex-direction: column;
  }

  .statPill {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .quickIcon {
    width: 38px;
    height: 38px;
  }

  .quickText h3 {
    font-size: var(--text-xs);
  }

  .quickText p {
    display: none;
  }

  .discGrid {
    grid-template-columns: 1fr;
  }

  .loginBody {
    padding: var(--sp-6) var(--sp-5) var(--sp-4);
  }
}

@media (max-width: 360px) {
  .adminEmail {
    max-width: 50vw;
  }
}
</style>
