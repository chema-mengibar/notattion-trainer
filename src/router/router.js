import * as vueRouter from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: { name: 'Trainer' },
  },
  {
    path: '/trainer',
    name: 'Trainer',
    component: () => import('../views/Trainer.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue'),
  },
  {
    path: '/config',
    redirect: { name: 'Settings' },
  },
];

const router = vueRouter.createRouter({
  history: vueRouter.createWebHistory(''),
  routes,
});

router.beforeEach(() => {
  window.scrollTo(0, 0);
});

export default router;
