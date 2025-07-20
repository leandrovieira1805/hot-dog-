import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Configuração do Firebase - Credenciais reais
const firebaseConfig = {
  apiKey: "AIzaSyAuZ1SJWxlwWtgVhV3qnBafoytho59WE4I",
  authDomain: "device-streaming-77144326.firebaseapp.com",
  databaseURL: "https://device-streaming-77144326-default-rtdb.firebaseio.com",
  projectId: "device-streaming-77144326",
  storageBucket: "device-streaming-77144326.firebasestorage.app",
  messagingSenderId: "375948005973",
  appId: "1:375948005973:web:99b7ff4736d6c17f927adc"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// Inicializar Auth
export const auth = getAuth(app);

// Conectar ao emulador apenas em desenvolvimento local
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    // Verificar se estamos no navegador e não em produção
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectAuthEmulator(auth, 'http://localhost:9099');
      console.log('Firebase: Conectado ao emulador local');
    }
  } catch (error) {
    console.log('Firebase: Emulador não disponível ou já conectado');
  }
}

export default app; 