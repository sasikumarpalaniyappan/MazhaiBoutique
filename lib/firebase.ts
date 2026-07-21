import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID,
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || process.env.FIREBASE_MEASUREMENT_ID,
};

const hasFirebaseConfig = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
);

let app: any = undefined;
let auth: any = undefined;
let db: any = undefined;

if (hasFirebaseConfig) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    
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
  console.warn("Firebase not initialized: missing Firebase environment variables.", {
    isBrowser: typeof window !== "undefined",
    apiKeyPresent: Boolean(firebaseConfig.apiKey),
    projectIdPresent: Boolean(firebaseConfig.projectId),
    authDomainPresent: Boolean(firebaseConfig.authDomain),
    appIdPresent: Boolean(firebaseConfig.appId),
  });
}

export { app, auth, db };

