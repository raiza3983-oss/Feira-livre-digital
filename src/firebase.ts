import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver
} from 'firebase/auth';
import { initializeFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, onSnapshot, getDocs, getDocFromServer, Timestamp, addDoc, orderBy, limit, or, collectionGroup } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase SDK
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with settings optimized for proxy and iframe environments.
// We force long polling because WebSockets/HTTP2 streams often fail in these environments.
// We also use a more robust host configuration and explicit transport settings.
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false,
}, firebaseConfig.firestoreDatabaseId || '(default)');

// Listen for network state changes to help diagnose transport errors
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('🌐 Browser went online. Attempting to reconnect Firestore...');
  });
  window.addEventListener('offline', () => console.warn('🔌 Browser went offline. Firestore will pause streams.'));
}


// Use initializeAuth to prevent "Pending promise was never set" assertion errors
// which can occur in certain environments like iframes.
export const auth = (() => {
  const existingApps = getApps();
  const appInstance = existingApps.length === 0 ? initializeApp(firebaseConfig) : getApp();
  
  try {
    // Try to get existing instance first
    return getAuth(appInstance);
  } catch (e) {
    // Not initialized, so initialize it with specific settings for iframes
    return initializeAuth(appInstance, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  }
})();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ 
  prompt: 'select_account',
  // Adding display: 'popup' can sometimes help in iframe environments
  display: 'popup'
});

// Error Handling Spec for Firestore Operations
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to test connection with more aggressive retry
export async function testConnection(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`📡 Firebase Connection: Attempt ${i + 1}/${retries}...`);
      // Use getDocFromServer to force a network check
      await getDocFromServer(doc(db, 'test', 'handshake'));
      console.log("✅ Firebase Connection: Success");
      return true;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = error.code || 'unknown';
      
      console.warn(`⚠️ Connection attempt ${i + 1} failed: [${errorCode}] ${errorMessage}`);

      // Se for um erro de permissão ou documento não encontrado, a conexão REAMENTE funciona.
      // O erro 'unavailable' é o que queremos capturar para tentar novamente ou reportar falha.
      if (errorCode === 'permission-denied' || errorCode === 'not-found') {
        console.log("✅ Firebase Connection: Handshake complete (authentication/schema check works)");
        return true;
      }

      const isTransient = errorCode === 'unavailable' || 
                          errorMessage.includes('the client is offline') || 
                          errorMessage.includes('timeout');
      
      if (i === retries - 1) {
        if (isTransient) {
          console.error("❌ Firebase Connection: Critical failure. Backend unreachable.");
        }
      }
      
      // Exp backoff with a bit of jitter
      const delay = Math.min(1000 * Math.pow(2, i) + (Math.random() * 500), 10000);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  return false;
}

// Run connection test with a delay to allow the network bridge to stabilize
setTimeout(() => {
  console.log("🚀 Starting initial Firebase connection test...");
  testConnection(7); // More retires for startup
}, 5000);

// Auth Helpers
let loginPromise: Promise<User> | null = null;
let loginStartTime: number = 0;

export const loginWithGoogle = async () => {
  // Se já estiver logado, retorna o usuário atual imediatamente
  if (auth.currentUser) {
    return auth.currentUser;
  }

  const now = Date.now();
  // Se existir uma promessa ativa há menos de 45 segundos, reutiliza ela
  if (loginPromise && (now - loginStartTime) < 45000) {
    console.warn("Login already in progress, returning existing promise.");
    return loginPromise;
  }

  loginStartTime = now;

  // Chamamos signInWithPopup diretamente para preservar o "user gesture"
  // e evitar que o navegador bloqueie o popup.
  loginPromise = signInWithPopup(auth, googleProvider)
    .then(result => result.user)
    .catch(error => {
      // Ignora erro se for apenas o usuário fechando o popup ou cancelando
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        console.error("Login Error:", error);
      }
      throw error;
    })
    .finally(() => {
      loginPromise = null;
      loginStartTime = 0;
    });

  return loginPromise;
};

export const logout = () => signOut(auth);

export { 
  doc, getDoc, setDoc, updateDoc, deleteDoc, collection, query, where, onSnapshot, getDocs, addDoc, orderBy, limit, Timestamp, or, collectionGroup 
};
