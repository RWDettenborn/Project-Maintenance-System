import { initializeApp } from 
'https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js';

import { getAuth } from 
'https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyBRC5RIQrEbBUI8TOBMFZGCE4OjePGtJP4",
  authDomain: "project-maintenance-system.firebaseapp.com",
  projectId: "project-maintenance-system",
  storageBucket: "project-maintenance-system.firebasestorage.app",
  messagingSenderId: "408727049814",
  appId: "1:408727049814:web:b8c303b0a47b095a310df7",
  measurementId: "G-Y1XTVJ7GBY"
};

const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
