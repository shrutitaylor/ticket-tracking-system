const admin = require("firebase-admin");

const serviceAccount = require("./firebaseServiceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Only POST allowed" }),
    };
  }

  try {
    const { ticketId } = JSON.parse(event.body);
    await db.collection("tickets").doc(ticketId).delete();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Ticket ${ticketId} deleted.` }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
