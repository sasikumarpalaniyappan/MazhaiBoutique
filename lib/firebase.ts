import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const requiredFirebaseFields = ["apiKey", "authDomain", "projectId", "appId"] as const;
const missingFirebaseFields = requiredFirebaseFields.filter(
  (field) => !firebaseConfig[field]
);
const hasFirebaseConfig = missingFirebaseFields.length === 0;

let app: any = undefined;
let auth: any = undefined;
let db: any = undefined;
let storage: any = undefined;

if (hasFirebaseConfig) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);

    // Try to initialize storage (if configured)
    try {
      storage = getStorage(app);
    } catch (storageError) {
      console.warn("Storage initialization failed:", storageError);
      storage = undefined;
    }

    // Try to initialize auth, but don't fail if Identity Toolkit API is not enabled
    try {
      auth = getAuth(app);
    } catch (authError) {
      console.warn("Auth initialization failed (Identity Toolkit API may not be enabled):", authError);
      auth = undefined;
    }
    
    console.log("Firebase initialized:", {
      appInitialized: Boolean(app),
      authInitialized: Boolean(auth),
      dbInitialized: Boolean(db),
      configSource: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "NEXT_PUBLIC" : "FIREBASE",
    });
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  console.warn("Firebase not initialized: missing required Firebase environment variables.", {
    isBrowser: typeof window !== "undefined",
    missingFields: missingFirebaseFields,
    apiKeyPresent: Boolean(firebaseConfig.apiKey),
    projectIdPresent: Boolean(firebaseConfig.projectId),
    authDomainPresent: Boolean(firebaseConfig.authDomain),
    appIdPresent: Boolean(firebaseConfig.appId),
  });
}

export { app, auth, db, storage };

