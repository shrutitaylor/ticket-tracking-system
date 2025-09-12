const admin = require("firebase-admin");

const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const db = admin.firestore();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Only POST allowed" };
  }

  try {
    const { ticketId } = JSON.parse(event.body);

    // Get ticket from deletedTickets
    const docRef = db.collection("deletedTickets").doc(ticketId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return { statusCode: 404, body: JSON.stringify({ error: "Ticket not found" }) };
    }

    const ticketData = doc.data();

    // Add back to tickets collection
    await db.collection("tickets").doc(ticketId).set(ticketData);

    // Remove from deletedTickets
    await docRef.delete();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Restored ticket ${ticketId}` }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
