import * as admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Firebase configuration interface
interface FirebaseConfig {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

// Initialize Firebase Admin SDK
export function initializeFirebase(): admin.app.App {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      return admin.apps[0]!;
    }

    // Get Firebase service account credentials from environment variables
    const serviceAccount: FirebaseConfig = {
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID || '',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || '',
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
      client_email: process.env.FIREBASE_CLIENT_EMAIL || '',
      client_id: process.env.FIREBASE_CLIENT_ID || '',
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL || '',
    };

    // Validate required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      throw new Error('Missing required Firebase configuration. Please check your environment variables.');
    }

    // Initialize Firebase Admin SDK
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}.firebaseio.com`,
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
    return app;

  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    throw error;
  }
}

// Get Firestore database instance
export function getFirestore(): admin.firestore.Firestore {
  const app = initializeFirebase();
  return app.firestore();
}

// Get Realtime Database instance
export function getDatabase(): admin.database.Database {
  const app = initializeFirebase();
  return app.database();
}

// Get Auth instance
export function getAuth(): admin.auth.Auth {
  const app = initializeFirebase();
  return app.auth();
}

// Close Firebase connections
export async function closeFirebase(): Promise<void> {
  try {
    const apps = admin.apps;
    for (const app of apps) {
      if (app) {
        await app.delete();
      }
    }
    console.log('✅ Firebase connections closed successfully');
  } catch (error) {
    console.error('⚠️ Warning: Error closing Firebase connections:', error);
  }
}
