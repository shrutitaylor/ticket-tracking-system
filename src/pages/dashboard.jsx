import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, orderBy, limit } from "firebase/firestore";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [newTicket, setNewTicket] = useState({
    ticketNo: "",
    priority: "",
    status: "open",
    name: "",
    contactNo: "",
    device: "",
    issuesDemands: "",
    price: "",
    service: "",
    partsUsed: "",
    called: "",
    notes: "",
    date: "",
  });

  // Function to convert display name to field name
  const getFieldName = (displayName) => {
    const fieldMap = {
      "Ticket No.": "ticketNo",
      "Priority": "priority",
      "Status": "status",
      "Name": "name",
      "Contact No.": "contactNo",
      "Device": "device",
      "Issues/Demands": "issuesDemands",
      "$$$": "price",
      "Service": "service",
      "Parts Used": "partsUsed",
      "Called": "called",
      "Notes": "notes",
      "Date": "date"
    };
    return fieldMap[displayName] || displayName;
  };

  // Function to convert field name to display name
  const getDisplayName = (fieldName) => {
    const displayMap = {
      "ticketNo": "Ticket No.",
      "priority": "Priority",
      "status": "Status",
      "name": "Name",
      "contactNo": "Contact No.",
      "device": "Device",
      "issuesDemands": "Issues/Demands",
      "price": "$$$",
      "service": "Service",
      "partsUsed": "Parts Used",
      "called": "Called",
      "notes": "Notes",
      "date": "Date"
    };
    return displayMap[fieldName] || fieldName;
  };

  // Function to get priority circle style
  const getPriorityStyle = (priority) => {
    const styles = {
      H: "bg-red-500",
      M: "bg-yellow-500",
      L: "bg-green-500"
    };
    return styles[priority] || "bg-gray-500";
  };

  // Function to get status badge style
  const getStatusStyle = (status) => {
    const styles = {
      "open": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "in progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "to be collected": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      "closed": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };
    return styles[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  };

  // Function to get the next ticket number
  const getNextTicketNumber = async () => {
    try {
      const ticketsRef = collection(db, "tickets");
      const q = query(ticketsRef, orderBy("ticketNo", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return "1";
      }
      
      const lastTicket = querySnapshot.docs[0].data();
      const lastNumber = parseInt(lastTicket.ticketNo);
      return (lastNumber + 1).toString();
    } catch (error) {
      console.error("Error getting next ticket number:", error);
      return "1";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tickets"));
        const tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort tickets by ticket number
        tickets.sort((a, b) => parseInt(a.ticketNo) - parseInt(b.ticketNo));
        setData(tickets);
      } catch (error) {
        console.error("Error loading tickets:", error);
      }
    };
    fetchData();
  }, []);

  const handleDeleteAll = async () => {
    if (window.confirm("Are you sure you want to delete all tickets? This action cannot be undone.")) {
      try {
        const querySnapshot = await getDocs(collection(db, "tickets"));
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
        setData([]);
        alert("All tickets have been deleted successfully!");
      } catch (error) {
        console.error("Error deleting tickets:", error);
        alert("Error deleting tickets. Please try again.");
      }
    }
  };

  const handleOpen = async (ticket = null) => {
    if (ticket) {
      // Update mode
      setNewTicket(ticket);
      setIsUpdateMode(true);
    } else {
      // Create mode
      const today = new Date();
      const date = today.toLocaleDateString('en-GB');
      const nextTicketNo = await getNextTicketNumber();
      
      setNewTicket({
        ticketNo: nextTicketNo,
        name: "",
        contactNo: "",
        device: "",
        issuesDemands: "",
        price: "",
        service: "",
        partsUsed: "",
        called: "",
        notes: "",
        priority: "",
        status: "open",
        date: date,
      });
      setIsUpdateMode(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setIsUpdateMode(false);
  };

  const handleChange = (e) => {
    const fieldName = getFieldName(e.target.name);
    setNewTicket({ ...newTicket, [fieldName]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (isUpdateMode) {
        // Update existing ticket
        const ticketRef = doc(db, "tickets", newTicket.id);
        await updateDoc(ticketRef, newTicket);
        setData(data.map(ticket => 
          ticket.id === newTicket.id ? newTicket : ticket
        ));
      } else {
        // Create new ticket
        const docRef = await addDoc(collection(db, "tickets"), newTicket);
        setData([...data, { id: docRef.id, ...newTicket }].sort((a, b) => parseInt(a.ticketNo) - parseInt(b.ticketNo)));
      }
      setOpen(false);
      setIsUpdateMode(false);
    } catch (error) {
      console.error("Error saving ticket:", error);
    }
  };

  const filteredData = data.filter(ticket =>
    Object.values(ticket).some(value =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex  mb-8">
        <h1 className="text-4xl font-spaceGrotesk text-black font-bold">
          Dashboard
        </h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => handleOpen()}
            className="bg-[#9C795C] hover:scale-110 transition-all duration-300 text-white px-4 py-2 rounded-lg font-spaceGrotesk transition-colors"
          >
            Create Ticket
          </button>
          <button
            onClick={handleDeleteAll}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-spaceGrotesk transition-colors"
          >
            Delete All Tickets
          </button>
        </div>
        <div class="relative hidden md:block">
            <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
                <span class="sr-only">Search icon</span>
            </div>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-gray-500 focus:border-gray-500 text-black "
        />
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-spaceGrotesk mb-4">
              {isUpdateMode ? "Update Ticket" : "Create Ticket"}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(newTicket).map(([key, value]) => (
                <div key={key} className="col-span-1">
                  <label className="block text-sm font-spaceGrotesk mb-1">{getDisplayName(key)}</label>
                  {key === "priority" ? (
                    <div className="flex gap-4">
                      {["H", "M", "L"].map((p) => (
                        <label key={p} className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="Priority"
                            value={p}
                            checked={value === p}
                            onChange={handleChange}
                            className="hidden"
                          />
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            value === p ? getPriorityStyle(p) : "bg-gray-300"
                          }`}>
                            {p}
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : key === "status" ? (
                    <select
                      name="Status"
                      value={value}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-spaceGrotesk"
                    >
                      <option value="open">Open</option>
                      <option value="in progress">In Progress</option>
                      <option value="to be collected">To Be Collected</option>
                      <option value="closed">Closed</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      name={getDisplayName(key)}
                      value={value}
                      onChange={handleChange}
                      disabled={key === "date" || key === "ticketNo"}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-spaceGrotesk ${
                        (key === "date" || key === "ticketNo") ? "bg-gray-100" : ""
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-spaceGrotesk"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-spaceGrotesk"
              >
                {isUpdateMode ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {filteredData.length === 0 ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-3 rounded relative" role="alert">
          <span className="block sm:inline">No matching tickets found.</span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-md shadow-lg mt-5">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-300">
                {Object.keys(newTicket).map((key) => (
                  <th key={key} className="px-2 py-3 text-center text-sm font-spaceGrotesk font-medium text-gray-500 uppercase tracking-wider">
                    {getDisplayName(key)}
                  </th>
                ))}
                <th className="px-2 py-3 text-left text-sm font-spaceGrotesk font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {Object.keys(newTicket).map((key) => (
                    <td key={key} className="px-2 text-center items-center py-3 whitespace-nowrap text-md font-spaceGrotesk text-gray-900">
                      {key === "priority" ? (
                        <div className={`w-8 h-8 mx-auto self-align-center rounded-full flex items-center justify-center text-white font-bold ${getPriorityStyle(row[key])}`}>
                          {row[key]}
                        </div>
                      ) : key === "status" ? (
                        <span className={`text-sm font-medium px-2.5 py-0.5 rounded-sm ${getStatusStyle(row[key])}`}>
                          {row[key]}
                        </span>
                      ) : (
                        row[key]
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-3 whitespace-nowrap text-sm font-spaceGrotesk">
                    <button
                      onClick={() => handleOpen(row)}
                      className="bg-[#9C795C] hover:scale-105 text-white px-3 py-1 rounded-lg transition-colors"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
