const admin = require('firebase-admin');
const { firebaseApp } = require('../configs/firebase');

let auth;
if (firebaseApp) {
  auth = admin.auth();
}

exports.verifyIdToken = async (idToken) => {
  if (!auth) {
    throw new Error('Firebase is not configured. Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.');
  }

  const decodedToken = await auth.verifyIdToken(idToken);
  return decodedToken;
};
