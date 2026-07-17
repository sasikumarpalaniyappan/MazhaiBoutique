import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: any = undefined;
let auth: any = undefined;
let db: any = undefined;

if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  console.log("Firebase initialized in browser:", {
    appInitialized: Boolean(app),
    authInitialized: Boolean(auth),
    dbInitialized: Boolean(db),
    firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "present" : "missing",
  });
} else {
  // When running on the server (SSR) or env vars are missing,
  // avoid initializing Firebase to prevent runtime errors like invalid-api-key.
  console.log("Firebase not initialized:", {
    isBrowser: typeof window !== "undefined",
    firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "present" : "missing",
  });
}

export { app, auth, db };
