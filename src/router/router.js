import * as vueRouter from 'vue-router';

const routes = [{
        path: '/',
        name: 'Home',
        component: () => (
            import ('../views/Home.vue'))
    },
    {
        path: '/trainer',
        name: 'Trainer',
        component: () => (
            import ('../views/Trainer.vue'))
    },
    {
        path: '/config',
        name: 'Config',
        component: () => (
            import ('../views/Config.vue'))
    },


];

const baseUrl = ''

const router = vueRouter.createRouter({
    history: vueRouter.createWebHistory(baseUrl),
    routes
});

router.beforeEach(() => {
    window.scrollTo(0, 0)
})

export default router;