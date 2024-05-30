import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import RegisterView from '../views/RegisterView.vue';
import SignInView from '../views/SignInView.vue';
import FirstPage from '../views/FirstPage.vue';
import BackOffice from '../views/BackOffice.vue';
import Perfil from '../views/PerfilView.vue';
import UserProfile from '../views/UserProfile.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/Register', name: 'register', component: RegisterView },
  { path: '/Sign-in', name: 'sign-in', component: SignInView },
  { path: '/MainPage', name: 'main-page', component: FirstPage
    
   },
  {
    path: '/backoffice',
    name: 'backoffice',
    component: BackOffice,
    children: [
      {
        path: 'users',
        name: 'user-management',
        component: () => import('../components/UserManagement.vue')
      },
      {
        path: 'tweets',
        name: 'tweet-management',
        component: () => import('../components/TweetManagement.vue')
      }
    ]
  },
  { path: '/Perfil', name: 'perfil', component: Perfil },
  { path: '/user/:userId', name: 'user-profile', component: UserProfile }

];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
