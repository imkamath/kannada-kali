// Firebase project used for syncing progress between the phone app and the web app.
// Access is controlled by Firestore rules (see firestore.rules): a progress document can only be
// read or written by someone who knows its 12-character sync code, and documents can never be listed.
export const FIREBASE = {
  projectId: 'kannada-kali-afcf0',
  apiKey: '', // optional; Firestore's REST API works without one for these rules
};

export const syncConfigured = () => !!FIREBASE.projectId;
