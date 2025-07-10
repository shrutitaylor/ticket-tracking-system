import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../pages/firebaseConfig";
 // adjust path as needed

export async function getActiveTickets(){
    
      try {
        const querySnapshot = await getDocs(collection(db, "tickets"));
        const tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
        // Filter tickets with specific statuses
        const filtered = tickets.filter(ticket =>
          ticket.priority !== "O"
        );
        
        // Sort by date descending (newest on top)
        filtered.sort((a, b) => {
          const parseDate = (d) => {
            if (typeof d === "string") {
              const [day, month, year] = d.split("/").map(Number);
              return new Date(year, month - 1, day);
            } else if (d instanceof Date) {
              return d;
            } else if (d?.seconds) {
              return new Date(d.seconds * 1000);
            } else {
              return new Date(0);
            }
          };
    
          return parseDate(b.date) - parseDate(a.date);
        });
    
        return filtered;
      } catch (error) {
        console.error("Error loading tickets:", error);
      }
    
  
};
