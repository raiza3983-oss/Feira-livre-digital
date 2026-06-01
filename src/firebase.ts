import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import appletConfig from "../firebase-applet-config.json";

// Configuração robusta com fallback automático para variáveis de ambiente (essencial para deploy no Vercel/Netlify/GitHub)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || appletConfig.measurementId || "",
  firestoreDatabaseId: (() => {
    const envDBId = import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID;
    if (envDBId && !envDBId.includes("://") && !envDBId.includes("firebaseio.com") && !envDBId.includes("firebasestorage")) {
      return envDBId;
    }
    return appletConfig.firestoreDatabaseId;
  })()
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  ignoreUndefinedProperties: true
}, firebaseConfig.firestoreDatabaseId);

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  // Configura para abrir sempre por Pop-up (Janela flutuante)
  console.log("Abrindo login do Google via Pop-up.");
  return signInWithPopup(auth, provider);
};

export const getFriendlyAuthErrorMessage = (err: any): string => {
  const code = err?.code || "";
  const message = err?.message || "";
  
  if (code === "auth/unauthorized-domain" || message.includes("unauthorized-domain") || message.includes("unauthorized domain")) {
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : 'este domínio';
    return `Domínio não autorizado! Você precisa adicionar este domínio no seu Console do Firebase:\n\n1. Acesse o Console do Firebase (meuapp-e998a)\n2. Vá em 'Authentication' > guia 'Configurações' > 'Domínios autorizados'\n3. Clique em 'Adicionar domínio' e insira:\n   👉 ${currentDomain}\n\nIsso é necessário para que o login do Google funcione no ambiente web de testes!`;
  }
  if (code === "auth/operation-not-allowed" || message.includes("operation-not-allowed")) {
    return "O provedor de login do Google não está ativado no seu Firebase!\n\nNo Console do Firebase, acesse:\n1. 'Authentication' > guia 'Método de login'\n2. Clique em 'Adicionar novo provedor' e selecione 'Google'\n3. Ative-o e salve as alterações.";
  }
  if (code === "auth/popup-blocked" || message.includes("popup-blocked")) {
    return "O pop-up de login do Google foi bloqueado pelo seu navegador.\n\nPor favor, permita pop-ups para este site ou clique para tentar novamente.";
  }
  if (code === "auth/web-storage-unsupported" || message.includes("web-storage-unsupported")) {
    return "Armazenamento ou cookies do navegador não suportados (comum em abas anônimas ou dentro de iframes).\n\nTente utilizar o botão de abrir o app em uma Nova Guia (no topo do AI Studio) ou habilite cookies de terceiros.";
  }
  if (code === "auth/network-request-failed" || message.includes("network-request-failed")) {
    return "Erro de conexão de rede ao comunicar com o Firebase Authentication. Verifique sua conexão.";
  }
  return err?.message || "Ocorreu um erro desconhecido ao entrar com o Google.";
};

export const logout = () => signOut(auth);
export { getRedirectResult };

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