import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage} from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCLIdX67aAt4trpe-64SBPn0V9qGq75iG8",
    authDomain: "dwfd-c37d9.firebaseapp.com",
    projectId: "dwfd-c37d9",
    storageBucket: "dwfd-c37d9.appspot.com",
    messagingSenderId: "411415637977",
    appId: "1:411415637977:web:2b298308675d119739b3c8",
    measurementId: "G-HG7RXWEL71"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);



export { auth,storage};
