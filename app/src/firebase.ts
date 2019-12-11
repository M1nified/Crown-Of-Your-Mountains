import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAb67oUw3RCIdLFlA-A1xRKLHnModQJX1U",
    authDomain: "crown-of-your-mountains.firebaseapp.com",
    databaseURL: "https://crown-of-your-mountains.firebaseio.com",
    projectId: "crown-of-your-mountains",
    storageBucket: "crown-of-your-mountains.appspot.com",
    messagingSenderId: "1017441477229",
    appId: "1:1017441477229:web:f2581017561c5608f05564",
    measurementId: "G-KZJQEKMSM8"
};

firebase.initializeApp(firebaseConfig);

export default firebase;
