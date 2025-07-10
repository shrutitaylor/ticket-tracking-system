import { doc, updateDoc } from "firebase/firestore";
import { db } from "../pages/firebaseConfig";
 // adjust path as needed

export const updateTicketStatus = async (ticketId, newStatus) => {
  const ticketRef = doc(db, "tickets", ticketId);
  await updateDoc(ticketRef, { status: newStatus });
};
