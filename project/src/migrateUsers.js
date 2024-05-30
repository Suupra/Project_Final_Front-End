const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dwfd-c37d9.firebaseio.com"
});

const db = admin.firestore();
const auth = admin.auth();

const migrateUsers = async () => {
  try {
    const listUsersResult = await auth.listUsers(1000);
    listUsersResult.users.forEach(async (userRecord) => {
      const user = {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || ''
      };
      await db.collection('users').doc(user.uid).set(user);
    });
    console.log('Migração concluída com sucesso.');
  } catch (error) {
    console.error('Erro ao migrar usuários: ', error);
  }
};

migrateUsers();
