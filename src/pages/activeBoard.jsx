import { useEffect, useLayoutEffect, useState } from "react";
import { db } from "./firebaseConfig";
import { getAuth } from "firebase/auth";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc,where, getDoc, query, orderBy, limit } from "firebase/firestore";
import {  InformationCircleIcon } from "@heroicons/react/20/solid";
import PrintTicketButton from "../components/printTicketButton";
import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import TrelloBoard from "../components/TrelloBoard";


export default function ActiveBoard() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 20;
  const [exportData, setExportData] = useState(false)
  const auth = getAuth();
  const user = auth.currentUser;

  //Checkboxes handle
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkPriority, setBulkPriority] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const handleBulkChange = (field, value) => {
    if (!value) return;
    const updatedData = data.map((ticket) => {
      if (selectedRows.includes(ticket.id)) {
        return { ...ticket, [field]: value };
      }
      return ticket;
    });
  
    // Update your state (and backend if needed)
    setData(updatedData);
  
    // Optionally update Firebase here
    selectedRows.forEach(async (id) => {
      const ticketRef = doc(db, "tickets", id); // adjust path as needed
      await updateDoc(ticketRef, {
        [field]: value,
      });
    });
  
    setSelectedRows([]); // clear selection
    setSelectAll(false);
  };
  



  const [newTicket, setNewTicket] = useState({
    ticketNo: "",
    priority: "",
    status: "open",
    name: "",
    contactNo: "",
    device: "",
    issues: "",
    price: "",
    service: "",
    partsUsed: "",
    called: "",
    notes: "",
    date: "",
    paid: "No",
  });

  const ticketFields = [
    // "ticketNo",
    "priority",
    "status",
    "name",
    "contactNo",
    "device",
    "issues",
    "price",
    "date"

  ];
  const updateTicketFields = [
    "ticketNo",
    "name",
    "contactNo",
    "device",
    "issues",
    "price",
    "service",
    "partsUsed",
    "called",
    "notes",
    "paid",
    "priority",
    "status",
    "date"

  ];
 
  const phoneFields = [
    // iPhones
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15 Plus",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14 Plus",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13 Pro",
    "iPhone 13",
    "iPhone 13 Mini",
    "iPhone 12 Pro Max",
    "iPhone 12 Pro",
    "iPhone 12",
    "iPhone 12 Mini",
    "iPhone 11 Pro Max",
    "iPhone 11 Pro",
    "iPhone 11",
    "iPhone XR",
    "iPhone XS Max",
    "iPhone XS",
    "iPhone X",
    "iPhone 8 Plus",
    "iPhone 8",
    "iPhone 7 Plus",
    "iPhone 7",
    "iPhone SE (2nd Gen)",
    "iPhone SE (3rd Gen)",
  
    // Samsung Galaxy S series
    "Samsung Galaxy S24 Ultra",
    "Samsung Galaxy S24+",
    "Samsung Galaxy S24",
    "Samsung Galaxy S23 Ultra",
    "Samsung Galaxy S23+",
    "Samsung Galaxy S23",
    "Samsung Galaxy S22 Ultra",
    "Samsung Galaxy S22+",
    "Samsung Galaxy S22",
    "Samsung Galaxy S21 Ultra",
    "Samsung Galaxy S21+",
    "Samsung Galaxy S21",
    "Samsung Galaxy S20 Ultra",
    "Samsung Galaxy S20+",
    "Samsung Galaxy S20",
    
    // Samsung Galaxy Note series
    "Samsung Galaxy Note 20 Ultra",
    "Samsung Galaxy Note 20",
    "Samsung Galaxy Note 10+",
    "Samsung Galaxy Note 10",
  
    // Samsung Galaxy A series (popular mid-range)
    "Samsung Galaxy A74",
    "Samsung Galaxy A73",
    "Samsung Galaxy A72",
    "Samsung Galaxy A54",
    "Samsung Galaxy A53",
    "Samsung Galaxy A52",
    "Samsung Galaxy A34",
    "Samsung Galaxy A33",
    "Samsung Galaxy A32",
  
    // Samsung Galaxy Z series (foldables)
    "Samsung Galaxy Z Fold 5",
    "Samsung Galaxy Z Fold 4",
    "Samsung Galaxy Z Flip 5",
    "Samsung Galaxy Z Flip 4"
  ];
  
  
const statusPriority = [
  "EMERGENCY",
  "Under Pending",
  "Pending Payment",
  "Send Invoice",
  "Waiting for Customer",
  "Waiting for Parts",
  "Waiting for Device",
  "Sent to Mike",
  "Repaired, informed",
  "Warranty",
  "Refund",
  "Not Fixable / Closed",
  "Return with update",
  "Collected Device", // always pushed to the bottom
];



  
  
  // Function to convert display name to field name
  const getFieldName = (displayName) => {
    const fieldMap = {
      "Ticket No.": "TicketNo",
      "Priority": "priority",
      "Status": "status",
      "Name": "name",
      "Contact No.": "contactNo",
      "Device": "device",
      "Issues/Demands": "issues",
      "$$$": "price",
      "Service": "service",
      "Parts Used": "partsUsed",
      "Called": "called",
      "Notes": "notes",
      "Date": "date",
      "Paid": "paid",
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
      "issues": "issues",
      "price": "$$$",
      "service": "Service",
      "partsUsed": "Parts Used",
      "called": "Called",
      "notes": "Notes",
      "date": "Date",
      "paid": "Paid",
    };
    return displayMap[fieldName] || fieldName;
  };

  // Function to get priority circle style
  const getPriorityStyle = (priority) => {
    const styles = {
      H: "bg-red-500",
      M: "bg-yellow-500",
      L: "bg-lime-500",
      O: "bg-gray-500"
    };
    return styles[priority] || "bg-gray-500";
  };

  // Function to get status badge style
  const styles = {
    "Collected Device": "bg-lime-800 text-lime-100 ",
    "Not Fixable / Closed": "bg-blue-100 text-blue-800 ",
    "Waiting for Device": "bg-violet-100 text-violet-800 ",
    "Waiting for Parts": "bg-violet-100 text-violet-800 ",
    "Waiting for Customer": "bg-violet-100 text-violet-800 ",
    "Sent to Mike": "bg-violet-800 text-violet-100 ",
    "Return with update": "bg-red-600 text-red-100 ",
    "Under Pending": "bg-yellow-100 text-yellow-800 ",
    "EMERGENCY": "bg-red-500 text-red-100 ",
    "Repaired, informed": "bg-green-100 text-green-800 ",
    "Pending Payment": "bg-amber-100 text-amber-800 ",
    "Send Invoice": "bg-pink-100 text-pink-800 ",
    "Refund": "bg-amber-800 text-amber-100 ",
    "Warranty": "bg-blue-800 text-blue-100 ",
  };
  const getStatusStyle = (status) => {
    return styles[status] || "bg-gray-100 text-gray-800 ";
  };

  // Function to get the next ticket number
  const getCustomerId = async () => {
    try {
      const ticketsRef = collection(db, "tickets");
      const q = query(ticketsRef, orderBy("customerId", "desc"), limit(1));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return "1";
      }
      
      const lastTicket = querySnapshot.docs[0].data();
      const lastNumber = parseInt(lastTicket.customerId);
      // console.log("Last customer id:", lastNumber);

      return (lastNumber + 1).toString();
    } catch (error) {
      console.error("Error getting next ticket number:", error);
      return "1";
    }
  };

  const [activeTickets, setActiveTickets] = useState([]);
  const [todayTickets, setTodayTickets] = useState([]);
  const [monthTickets, setMonthTickets] = useState([]);
  const [displayTickets, setDisplayTickets] = useState([]);

  const fetchData = async () => {
  try {
    const today = new Date();
    const todayStr = today.toLocaleDateString("en-GB"); // "dd/mm/yyyy"
    const querySnapshot = await getDocs(collection(db, "tickets"));
    const tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Filter tickets CURRENT MONTH
    // const filtered = tickets.filter(ticket =>
    //   ticket.status === "Return with update" || ticket.status === "Sent to Mike"
    // );
    const filtered = tickets
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
    
    setData(tickets); // this will trigger re-render
    setCounts(getTicketStats(tickets)); // compute stats directly here
    setActiveTickets(tickets.filter(ticket => ticket.priority !== "O"));
    setDisplayTickets(tickets.filter(ticket => ticket.priority !== "O"));
    setTodayTickets(tickets.filter(ticket => ticket.date === todayStr));
    setMonthTickets(tickets.filter(ticket => { 
      const ticketDate = new Date(ticket.date); 
      return (
      ticketDate.getMonth() === today.getMonth() && ticketDate.getFullYear() === today.getFullYear())
    }));
    
  } catch (error) {
    console.error("Error loading tickets:", error);
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
      const nextTicketNo = await getCustomerId();
      
      setNewTicket({
        ticketNo: nextTicketNo,
        customerId:"",
        name: "",
        contactNo: "",
        device: "",
        issues: "",
        price: "",
        service: "",
        partsUsed: "",
        called: "",
        paid:"",
        notes: "",
        priority: "L",
        status: "Return with update",
        date: date,
      });
      setIsUpdateMode(false);
    }
    setOpen(true);
  };

// Format the incoming phone numbers
const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters
  const digits = phone.toString().replace(/\D/g, "");

  // If the number is less than 9 digits, return as-is
  if (digits.length < 9) return phone;

  // Pad the number with a leading 0 if it starts with 4 and has 9 digits
  const padded = digits.length === 9 && digits.startsWith("4") ? "0" + digits : digits;

  // Return formatted as 0123 456 789
  return padded.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
};

  const getCustomerByPhone = async (phone) => {
  const q = query(collection(db, "tickets"), where("contactNo", "==", phone));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    // console.log("Customer found:", doc.data());
    return { id: doc.id, data: doc.data() };
  }
  return null;
};

  const handleClose = () => {
    setOpen(false);
    setIsUpdateMode(false);
  };

  const handleChange = (e) => {
    const fieldName = getFieldName(e.target.name);
    let value = e.target.value;
      if (fieldName === "contactNo") {
      value = formatPhoneNumber(value);
      }
    setNewTicket({ ...newTicket, [fieldName]: value });
  };

  const handleSubmit = async () => {
  try {
    if (isUpdateMode) {
      // Update existing ticket
      const ticketRef = doc(db, "tickets", newTicket.id);
      await updateDoc(ticketRef, newTicket);
    } else {
      // --- Generate Ticket Number before saving ---
      const phone = newTicket.contactNo;
      if (!phone) {
        alert("Contact number is required.");
        return;
      }

      const existingCustomer = await getCustomerByPhone(phone);
      let customerID;

      if (existingCustomer) {
        customerID = existingCustomer.data.customerId;
      } else {
        const newID = await getCustomerId();
        customerID = newID;
      }

      const today = new Date();
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
      const year = String(today.getFullYear()).slice(-2); // Get last two digits of year
      const dateStr = `${day}${month}${year}`;
      const ticketNo = `${customerID}${dateStr}`;
      // console.log("Generated ticket number:", ticketNo);

      // Final ticket object with ticketNo and date
      const finalTicket = {
        ...newTicket,
        ticketNo,
        date: today.toLocaleDateString("en-GB"),
        customerId: customerID,
      };

      // Save to tickets collection
      await addDoc(collection(db, "tickets"), finalTicket);
    }

    // Close modal
    setOpen(false);
    setIsUpdateMode(false);

    // Refresh data
    await fetchData();
  } catch (error) {
    console.error("Error saving ticket:", error);
  }
};

  const handleOpenPayModal = (ticket) => {
    console.log("yes")
    setSelectedTicket(ticket);
    setPayModalOpen(true);
  };
  
  const handlePayment = async (method) => {
    // console.log(method);
    if (!selectedTicket) return;
  
    try {
      const ticketRef = doc(db, "tickets", selectedTicket.id);
      await updateDoc(ticketRef, {
        paid: method,
        // status: "Collected Device" , // Only close if paid by Cash or card
      });
  
      setPayModalOpen(false);
      setSelectedTicket(null);
      fetchData(); // Refresh the data after update
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };
    
const filteredData = data.filter(ticket => {
  const query = searchQuery.toLowerCase().replace(/\s+/g, ""); // remove all spaces

  return Object.values(ticket).some(value => {
    if (typeof value === "string" || typeof value === "number") {
      const normalizedValue = String(value).toLowerCase().replace(/\s+/g, "");
      return normalizedValue.includes(query);
    }
    return false;
  });
});


// 2. Paginate the filtered data
const indexOfLastTicket = currentPage * ticketsPerPage;
const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
const currentTickets = filteredData.slice(indexOfFirstTicket, indexOfLastTicket);

//Sort 
const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });

const handleSort = (key) => {
  let direction = 'asc';
  if (sortConfig.key === key && sortConfig.direction === 'asc') {
    direction = 'desc';
  }
  setSortConfig({ key, direction });
};

const handleSortActive = () => {
  setSortConfig({ key: 'customActiveSort', direction: 'asc' });
};

const sortedTickets = [...filteredData].sort((a, b) => {
  if (!sortConfig.key) return 0;

  if (sortConfig.key === 'customActiveSort') {
    const isCollectedA = a.priority === "O";
    const isCollectedB = b.priority === "O";

    if (isCollectedA && !isCollectedB) return 1;
    if (!isCollectedA && isCollectedB) return -1;

    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateB - dateA !== 0) return dateB - dateA;

    const priorityA = statusPriority.indexOf(a.status);
    const priorityB = statusPriority.indexOf(b.status);
    return priorityA - priorityB;
  }

  const aVal = a[sortConfig.key];
  const bVal = b[sortConfig.key];

  // Special handling for dates
  if (sortConfig.key === "date") {
    const parseDate = (d) => {
      if (typeof d === "string") {
        const [day, month, year] = d.split("/").map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(d);
    };

    const dateA = parseDate(aVal);
    const dateB = parseDate(bVal);

    return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
  }

  // Numbers
  if (typeof aVal === 'number' && typeof bVal === 'number') {
    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
  }

  // Strings
  return sortConfig.direction === 'asc'
    ? String(aVal).localeCompare(String(bVal))
    : String(bVal).localeCompare(String(aVal));
});



const paginatedTickets = sortedTickets.slice(
  (currentPage - 1) * ticketsPerPage,
  currentPage * ticketsPerPage
);

//set first page of pagination when search or sort are in use
useEffect(() => {
  setCurrentPage(1);
  // console.log("current data", data);
}, [searchQuery,sortConfig]);






//Duplicate Ticket
const handleDuplicate = async () => {
  try {
    const phone = newTicket.contactNo;
    if (!phone) {
      alert("Contact number is required to duplicate a ticket.");
      return;
    }

    // Check if customer exists
    const existingCustomer = await getCustomerByPhone(phone);
    let customerID;

    if (existingCustomer) {
      customerID = existingCustomer.data.customerId;
    } else {
      const newID = await getCustomerId();
      customerID = newID;
    }

    // Format today's date
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = String(today.getFullYear()).slice(-2);
    const dateStr = `${day}${month}${year}`;
    const ticketNo = `${customerID}${dateStr}`;

    const duplicatedTicket = {
      ...newTicket,
      ticketNo,
      date: today.toLocaleDateString("en-GB"),
      customerId: customerID,
    };

    // Remove Firestore document ID of this ticket
    delete duplicatedTicket.id;

    await addDoc(collection(db, "tickets"), duplicatedTicket);
    // console.log("Ticket duplicated successfully:", duplicatedTicket);
    setOpen(false);
    setIsUpdateMode(false);
    await fetchData();
  } catch (error) {
    console.error("Error duplicating ticket:", error);
    alert("Something went wrong while duplicating the ticket.");
  }
};

const handleDeleteTicketNo = async () => {
  try {
    const q = query(collection(db, "tickets"), where("ticketNo", "==", "121270525"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("No tickets found with ticketNo: 121270525");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${snapshot.size} ticket(s) with ticketNo: 121270525?`
    );
    if (!confirmDelete) return;

    const deletePromises = snapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, "tickets", docSnap.id))
    );

    await Promise.all(deletePromises);

    alert(`Deleted ${snapshot.size} ticket(s) with ticketNo: 121270525`);
    await fetchData(); // refresh UI
  } catch (error) {
    console.error("Error deleting tickets:", error);
    alert("Something went wrong while deleting the tickets.");
  }
};

  const [counts,setCounts] =useState([]);
  const getTicketStats = (tickets) => {
    const today = new Date();
    const todayStr = today.toLocaleDateString("en-GB"); // "dd/mm/yyyy"
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    

    let todayCount = 0;
    let activeCount = 0;
    let thisMonthCount = 0; 

    tickets.forEach((ticket) => {
      const ticketDate = new Date(ticket.date); // assuming ticket.date is a valid date string

      // Check if ticket was created today
      if (ticket.date === todayStr) {
        todayCount++;
      }

      // Check if ticket is active
      if (ticket.priority && ticket.priority !== "O") {
        activeCount++;
      }

      // Check if ticket was created this month
      if (
        ticketDate.getMonth() === currentMonth &&
        ticketDate.getFullYear() === currentYear
      ) {
        thisMonthCount++;
      }
    });

    return {
      todayCount,
      activeCount,
      thisMonthCount,
    };
};


useEffect(() => {
    fetchData();
    
    
  }, []);

const handlePassedTicket = (ticket) => {
        console.log("Data from child:", ticket);
        handleOpen(ticket);
      };
const [activeTab, setActiveTab] = useState("active");
const handleTabs = (key) => {
        setActiveTab(key)
        if(key == "active") {
         setDisplayTickets(activeTickets)
        }else if(key == "today") {
         setDisplayTickets(todayTickets)
        }else{
         setDisplayTickets(monthTickets)
        }
      };
  return (
    <div className="container  mx-auto px-4 py-8">
      <div className="flex  mb-8">
        <h1 className="text-4xl uppercase font-aoMono text-black font-bold">
          Dashboard
        </h1>
      </div>

      

      {/* Modal */}
      {open && 
        <div className="fixed inset-0 font-spaceGrotesk z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white mt-28 rounded-lg p-6 w-full max-w-2xl">
         
              {isVisible && (
                <>
            <h2 className="text-2xl font-spaceGrotesk mb-4">
              {isUpdateMode ? "Update Ticket" : "Create Ticket"}
            </h2>
            <div className="grid grid-cols-3 2xl:grid-cols-2 gap-4">
            {updateTicketFields.map((key) => {
              const value = newTicket[key];
              return (
                <div key={key} className="col-span-1">
                  <label className="block text-sm font-spaceGrotesk mb-1">{getDisplayName(key)}</label>
                  {key === "priority" ? (
                    <div className="flex gap-4">
                      {["H", "M", "L", "O"].map((p) => (
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
                    {Object.entries(styles).map(([statusKey]) => (
                      <option key={statusKey} value={statusKey}>{statusKey}</option> 
                    ))}
                    </select>
                  ) : key === "device" ? (
                    <>
                      <input
                        list="device-options"
                        name={getDisplayName(key)}
                        value={value}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-spaceGrotesk"
                      />
                      <datalist id="device-options">
                        {phoneFields.map((phone) => (
                          <option key={phone} value={phone} />
                        ))}
                      </datalist>
                    </>
                  ) : key === "notes" ? (
                    <textarea
                      type="text"
                      name={getDisplayName(key)}
                      value={value}
                      onChange={handleChange}
                      disabled={key === "date" || key === "ticketNo"}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-spaceGrotesk ${
                        (key === "date" || key === "ticketNo") ? "bg-gray-100" : ""
                      }`}
                    />
                  ) : (
                    <input
                      type="text"
                      name={getDisplayName(key)}
                      value={value}
                      onChange={handleChange}
                      disabled={ user.email !== "iolabs.au.ops@gmail.com" &&   key === "date" || key === "ticketNo"}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-spaceGrotesk ${
                        (key === "date" || key === "ticketNo") ? "bg-gray-100" : ""
                      }`}
                    />
                  )}
                </div>
                
              );
              
            })}

            </div>
           
            <div className="flex justify-end gap-4 mt-6">
              <div >
              <button
                onClick={handleDuplicate}
                className="px-2 py-2 mr-1 rounded-lg bg-amber-300 text-amber-100 hover:bg-amber-600 hover:text-amber-300 font-spaceGrotesk"
              ><DocumentDuplicateIcon className="w-6 h-6 inline" />
              </button>
              <PrintTicketButton ticket={newTicket} onBeforePrint={() => setIsVisible(false)}  /></div>
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
          
            </> )}
          </div>
          
        </div>
}

      {/* Table */}
      {filteredData.length === 0 ? (
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-2 py-3 rounded relative" role="alert">
          <span className="block sm:inline">No matching tickets found.</span>
        </div>

      ) : (
        
        <>
               
      <div className="flex justify-center flex-col lg:flex-row mx-auto mt-5">
          
            <div className="font-aoMono flex flex-col justify-center ">
              <div className="grid grid-cols-3 h-24  sm:h-32 overflow-hidden gap-4 p-4">
                <button
                  onClick={() => handleTabs("today")}
                  className={`${
                    activeTab === "today" ? "bg-rose-200" : "bg-stone-300"
                  } rounded-md shadow-lg p-2 sm:p-5 text-sm sm:text-3xl text-left flex-col cursor-pointer hover:scale-105 transition-all duration-500`}
                >
                  <p className="text-xs sm:text-lg  uppercase">Today's Tickets</p>
                  {counts["todayCount"]}
                </button>

                <div
                  onClick={() => handleTabs("active")}
                  className={`${
                    activeTab === "active" ? "bg-rose-200" : "bg-stone-300"
                  } cursor-pointer rounded-md shadow-lg text-sm sm:text-3xl flex-col p-2 sm:p-5 hover:scale-105 transition-all duration-500`}
                >
                  <p className="text-xs sm:text-lg  uppercase">ACTIVE Tickets</p>
                  {counts["activeCount"]}
                </div>

                <div
                  onClick={() => handleTabs("month")}
                  className={`${
                    activeTab === "month" ? "bg-rose-200" : "bg-stone-300"
                  } rounded-md shadow-lg text-sm sm:text-3xl flex-col p-2 sm:p-5 hover:scale-105 transition-all duration-500 cursor-pointer`}
                >
                  <p className="text-xs sm:text-lg uppercase">This Month</p>
                  {counts["thisMonthCount"]}
                </div>
              </div>
           
            <div className=" ">
              <TrelloBoard paginatedTickets={data} onDataSend={handlePassedTicket} />
            </div>
            
            
          </div>
         
          <div className=" mt-4 bg-stone-100 font-mono rounded-lg h-[50vh] sm:h-[680px] overflow-hidden gap-2 flex flex-col"> 
            <button
            onClick={() => handleOpen()}
            className=" bg-rose-800 hover:bg-rose-300 hover:text-rose-100  transition-all duration-300 text-rose-200 px-4 py-2 rounded-lg font-spaceGrotesk transition-colors"
          >
            Create Ticket
          </button>
            <div className="flex flex-col overflow-y-auto gap-2 p-1">
              <h1 className="uppercase font-aoMono">{activeTab}</h1>
            {displayTickets.map((ticket) => (
              <>
              <div className="bg-stone-200 text-sm min-h-[50px] overflow-hidden font-bold flex flex-col w-full md:w-[150px] rounded-lg p-2 border-l-4 border-lime-300">
                <span className="flex flex-row">{ticket["name"]}<InformationCircleIcon onClick={() => handleOpen(ticket)} className="cursor-pointer h-3 w-3 text-stone-400 mt-1 ml-2"/> </span>
                <p className="text-xs font-thin tracking-tighter">{ticket["device"]}</p>
              </div>
              
              </>
            ))}
            </div>
          </div>

        </div>
        </>
      )}
      

   

    </div>
  );
}
