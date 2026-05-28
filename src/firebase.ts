import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, onSnapshot, collection, doc, setDoc, getDocFromServer, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth();

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = async () => {
    try {
        const supported = await isSupported();
        if (supported) {
            return getMessaging(app);
        }
    } catch (e) {
        console.error("Firebase Messaging not supported", e);
    }
    return null;
};

export const requestNotificationPermissionAndGetToken = async (vapidKey: string) => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const msg = await messaging();
            if (msg) {
                const token = await getToken(msg, { vapidKey });
                return token;
            }
        }
    } catch (error) {
        console.error('Error getting notification token:', error);
    }
    return null;
};

export const listenToForegroundMessages = async (callback: (payload: any) => void) => {
     const msg = await messaging();
     if (msg) {
         return onMessage(msg, (payload) => {
             callback(payload);
         });
     }
     return () => {};
};



export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
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
       providerInfo: auth.currentUser?.providerData?.map(provider => ({
         providerId: provider.providerId,
         email: provider.email,
       })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
