const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const env = require('./env');

let firebaseApp;

const normalizePrivateKey = (key) => {
  if (!key) return key;
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.slice(1, -1);
  }
  return key.replace(/\\r/g, '').replace(/\\n/g, '\n').trim();
};

const isPemKey = (key) => {
  return /^-----BEGIN PRIVATE KEY-----/.test(key);
};

const loadServiceAccount = () => {
  if (env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      return JSON.parse(env.FIREBASE_SERVICE_ACCOUNT);
    } catch (parseError) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT as JSON; trying file path fallback.');
    }
  }

  if (env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const serviceAccountPath = path.isAbsolute(env.FIREBASE_SERVICE_ACCOUNT_PATH)
      ? env.FIREBASE_SERVICE_ACCOUNT_PATH
      : path.join(process.cwd(), env.FIREBASE_SERVICE_ACCOUNT_PATH);

    if (fs.existsSync(serviceAccountPath)) {
      return require(serviceAccountPath);
    }

    console.warn(`Firebase service account file not found at ${serviceAccountPath}.`);
  }
  return null;
};

const initializeFirebase = () => {
  const serviceAccount = loadServiceAccount();

  if (serviceAccount) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    return;
  }

  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
    const privateKey = normalizePrivateKey(env.FIREBASE_PRIVATE_KEY);

    if (!isPemKey(privateKey)) {
      console.error('Firebase private key did not normalize to a valid PEM format. Please verify FIREBASE_PRIVATE_KEY in your .env file.');
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    });
    return;
  }

  console.warn('Firebase environment variables are not fully configured. Firebase auth will be disabled.');
};

try {
  initializeFirebase();
} catch (error) {
  console.error('Firebase initialization failed:', error.message);
  console.error('Please verify your Firebase service account credentials in .env.');
}

module.exports = {
  firebaseApp,
};
