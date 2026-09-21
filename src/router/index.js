import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { getAno, getDisciplina, getAtividade } from '../data/disciplinas.js'

const BASE_TITLE = 'Informática para Internet · IFC Campus Araquari'
const TITLE_SUFFIX = '· Informática para Internet'

function resolveTitle(to) {
  const meta = to.meta?.title
  if (typeof meta === 'function') return meta(to)
  return meta || ''
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: 'Início' },
    },
    {
      path: '/anos',
      redirect: '/',
    },
    {
      path: '/ano/:anoId',
      name: 'ano',
      component: () => import('../views/AnoView.vue'),
      props: true,
      meta: {
        title: (to) => getAno(Number(to.params.anoId))?.label || 'Ano do Curso',
      },
    },
    {
      path: '/disciplina/:anoId/:disciplinaId',
      name: 'disciplina',
      component: () => import('../views/DisciplinaView.vue'),
      props: true,
      meta: {
        title: (to) =>
          getDisciplina(Number(to.params.anoId), to.params.disciplinaId)?.name || 'Disciplina',
      },
    },
    {
      path: '/atividade/:disciplinaId/:atividadeId',
      name: 'atividade',
      component: () => import('../views/AtividadeView.vue'),
      props: true,
      meta: {
        title: (to) => getAtividade(to.params.disciplinaId, to.params.atividadeId)?.title || 'Atividade',
      },
    },
    {
      path: '/buscar',
      name: 'search',
      component: () => import('../views/SearchView.vue'),
      meta: { title: 'Buscar' },
    },
    {
      path: '/sobre',
      name: 'sobre',
      component: () => import('../views/SobreView.vue'),
      meta: { title: 'Sobre' },
    },
    {
      path: '/criar-atividade',
      name: 'create-activity',
      component: () => import('../views/CreateActivityView.vue'),
      meta: { title: 'Criar Atividade', requiresAuth: true },
    },
    {
      path: '/editar-atividade/:disciplinaId/:atividadeId',
      name: 'edit-activity',
      component: () => import('../views/CreateActivityView.vue'),
      props: true,
      meta: { title: 'Editar Atividade', requiresAuth: true },
    },
    {
      path: '/perfil',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { title: 'Minha Conta' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
      meta: { title: 'Página não encontrada' },
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const title = resolveTitle(to)
  document.title = title ? `${title} ${TITLE_SUFFIX}` : BASE_TITLE
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) {
      return { name: 'profile', query: { redirect: to.fullPath } }
    }
  }
})

export default router
