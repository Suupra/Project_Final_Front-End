import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './assets/css/tailwind.css';
import 'jquery';
import 'lightbox2';
import 'lightbox2/dist/css/lightbox.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faHome, faSearch, faBell, faEnvelope, faBookmark, faUserFriends, faGem, faUser, faEllipsisH, faHeart, faImage, faSmile, faCalendar, faMapMarkerAlt,faTrash,faGear, faComment, faEdit  } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Adiciona ícones ao FontAwesome
library.add(faHome, faSearch, faBell, faEnvelope, faBookmark, faUserFriends, faGem, faUser, faEllipsisH, faHeart, faImage, faSmile, faCalendar, faMapMarkerAlt,faTrash,faGear,faComment, faEdit );

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCLIdX67aAt4trpe-64SBPn0V9qGq75iG8",
  authDomain: "dwfd-c37d9.firebaseapp.com",
  projectId: "dwfd-c37d9",
  storageBucket: "dwfd-c37d9.appspot.com",
  messagingSenderId: "411415637977",
  appId: "1:411415637977:web:2b298308675d119739b3c8",
  measurementId: "G-HG7RXWEL71"
};

// Inicializa o Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

// Cria a aplicação Vue
const app = createApp(App);

// Registra o componente de ícone do FontAwesome
app.component('font-awesome-icon', FontAwesomeIcon);

// Usa Vuex Store e Vue Router
app.use(store);
app.use(router);

// Verifica o estado de autenticação antes de montar a aplicação
let appInitialized = false;
onAuthStateChanged(auth, () => {
  if (!appInitialized) {
    app.mount('#app');
    appInitialized = true;
  }
});

export { db };
