const { initializeApp, applicationDefault, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

// Credencial do Firebase
function getCredential() {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
    }
    return applicationDefault();
}

const firebaseApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: getCredential(),
    });

const firebaseAdminAuth = getAuth(firebaseApp);

module.exports = { firebaseAdminAuth };
