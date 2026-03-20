import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, onSnapshot, query, orderBy, limit, addDoc, updateDoc, deleteDoc, Timestamp, getDocFromServer, increment } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase SDK
console.log('Initializing Firebase with config:', { 
  projectId: firebaseConfig.projectId, 
  databaseId: firebaseConfig.firestoreDatabaseId,
  apiKey: firebaseConfig.apiKey ? 'PRESENT' : 'MISSING'
});
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Error handling types
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

// Test connection to Firestore
async function testConnection() {
  console.log('Testing Firestore connection to path: test/connection');
  try {
    const testDoc = await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firestore connection test successful. Doc exists:', testDoc.exists());
  } catch (error) {
    console.error('Firestore connection test failed:', error);
    if(error instanceof Error) {
      console.error('Error message:', error.message);
      if (error.message.includes('the client is offline')) {
        console.error("CRITICAL: Firestore client is offline. This usually means the configuration (projectId, databaseId, or apiKey) is incorrect or the database is not provisioned.");
      }
    }
  }
}
testConnection();

export { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  Timestamp,
  increment,
  signInWithPopup,
  onAuthStateChanged
};
export type { User };
