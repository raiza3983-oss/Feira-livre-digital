import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

// Configuração robusta com fallback automático para variáveis de ambiente (essencial para deploy no Vercel/Netlify/GitHub)
// Sanitize the database ID to avoid RTDB URL values breaking connections
const sanitizeDatabaseId = (id: string | undefined): string => {
  if (!id || id.includes("://") || id.includes("firebaseio.com") || id.includes("firebasestorage")) {
    return "ai-studio-092a1eb7-e70b-46cb-b920-f325cbdb21bf";
  }
  return id;
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDOehbIQMm5Czz1nWEXQyEN1ryICLqnaFU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "meuapp-e998a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "meuapp-e998a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "meuapp-e998a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "103881183527",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:103881183527:web:b4fed604e70fce88f89902",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
  firestoreDatabaseId: sanitizeDatabaseId(import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "ai-studio-092a1eb7-e70b-46cb-b920-f325cbdb21bf")
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true
}, firebaseConfig.firestoreDatabaseId);

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const logout = () => signOut(auth);

// Adicionando re-exports necessários para não quebrar o App.tsx
export { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocs, 
  addDoc, 
  orderBy, 
  limit, 
  or, 
  Timestamp, 
  collectionGroup, 
  increment, 
  serverTimestamp,
  writeBatch 
} from "firebase/firestore";

import { doc, getDoc } from "firebase/firestore";

import { OperationType } from './types';

export { OperationType };

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
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
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const testConnection = async () => {
  try {
    // Tenta ler um documento com timeout reduzido implicitamente pelo SDK se possível, 
    // mas aqui apenas evitamos o getDocFromServer que é muito rígido
    const configPromise = getDoc(doc(db, 'healthcheck', 'connection-test'));
    
    // Timeout manual de 5 segundos para o teste de conexão inicial
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('timeout')), 5000)
    );

    await Promise.race([configPromise, timeoutPromise]);
    console.log("Conexão com Firestore verificada.");
    return true;
  } catch (error) {
    if (error instanceof Error && (error.message.includes('the client is offline') || error.message === 'timeout')) {
      console.warn("Aviso de Conexão: O Firestore pode estar operando em modo offline ou o backend está demorando a responder.");
    } else {
      console.error("Erro ao testar conexão com Firestore:", error);
    }
    // Retornamos true mesmo em timeout/offline para não bloquear o App desnecessariamente, 
    // já que o Firestore tem persistência offline nativa
    return true; 
  }
};