import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Ingredients from '../views/Ingredients.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {requiresAuth: true}
  },
  {
    path: '/ingredients',
    name: 'Ingredients',
    component: Ingredients,
    meta:{requiresAuth: true}
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('accessToken')
  if (to.meta.requiresAuth && !isAuthenticated){
    next('/');
  } else {
    next();
  }

})

export default router
