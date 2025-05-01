import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { db } from "./firebaseConfig";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, orderBy, limit } from "firebase/firestore";
import { useLoader } from "../contexts/LoaderContext";
import { ArrowDownIcon, ArrowDownTrayIcon, ArrowPathIcon, ArrowPathRoundedSquareIcon, ArrowUpIcon, BarsArrowDownIcon, BarsArrowUpIcon, FunnelIcon } from "@heroicons/react/16/solid";
import FilteredExport from "./exportData";
import { ArrowUturnLeftIcon } from "@heroicons/react/20/solid";
import { Tooltip } from "@mui/material";
import SendSMSButton from "../components/sendSMSButton";


export default function Dashboard() {
  const [data, setData] = useState([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 20;
  const [exportData, setExportData] = useState(false)
  



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
    "name",
    "contactNo",
    "device",
    "issues",
    "price",
    "service",
    "partsUsed",
    "called",
    "notes",
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
  
  const mapCSVRowToTicket = (row) => {
    const rawDate = row["date"];
    const formattedDate =
      typeof rawDate === "string"
        ? rawDate
        : XLSX.SSF.format("dd/mm/yyyy", rawDate); // handle Excel date numbers
  
    return {
      ticketNo: row["ticketNo"] || "",
      priority: row["priority"] || "",
      status: row["status"] || "open",
      name: row["name"] || "",
      contactNo: row["contactNo"] || "",
      device: row["device"] || "",
      issues: row["issues"] || "",
      price: row["price"] || "",
      service: row["service"] || "",
      partsUsed: row["partsUsed"] || "",
      called: row["called"] || "",
      notes: row["notes"] || "",
      paid: row['status'] == "Collected Device" ? "Card" :  "No",
      date: formattedDate || new Date().toLocaleDateString("en-GB"),
    };
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      const tickets = jsonData.map(mapCSVRowToTicket);
  
      try {
        const promises = tickets.map((ticket) => addDoc(collection(db, "tickets"), ticket));
        await Promise.all(promises);
        alert("Tickets imported successfully!");
        fetchData(); // Refresh UI
      } catch (err) {
        console.error("Error importing tickets:", err);
        alert("Failed to import some or all tickets.");
      }
    };
  
    reader.readAsArrayBuffer(file);
  };
  
  
  
  // Function to convert display name to field name
  const getFieldName = (displayName) => {
    const fieldMap = {
      "Ticket No.": "ticketNo",
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
      L: "bg-green-500"
    };
    return styles[priority] || "bg-gray-500";
  };

  // Function to get status badge style
  const styles = {
    "Collected Device": "bg-green-800 text-green-100 ",
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

  const fetchData = async () => {
    try {

      const querySnapshot = await getDocs(collection(db, "tickets"));
      const tickets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by date descending (newest on top)
      tickets.sort((a, b) => {
        const parseDate = (d) => {
          if (typeof d === "string") {
            const [day, month, year] = d.split("/").map(Number);
            return new Date(year, month - 1, day);
          } else if (d instanceof Date) {
            return d;
          } else if (d?.seconds) {
            // Firestore Timestamp object
            return new Date(d.seconds * 1000);
          } else {
            return new Date(0); // Fallback to epoch if unknown
          }
        };
      
        return parseDate(b.date) - parseDate(a.date);
      });
      
      setData(tickets);
      setOriginalData(tickets)
    } catch (error) {
      console.error("Error loading tickets:", error);
    }
  };
  
  useEffect(() => {
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
        issues: "",
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
      } else {
        // Create new ticket
        const docRef = await addDoc(collection(db, "tickets"), newTicket);
      }
  
      // Close modal
      setOpen(false);
      setIsUpdateMode(false);
  
      // Fetch updated data from Firestore
      await fetchData();
    } catch (error) {
      console.error("Error saving ticket:", error);
    }
  };
  
  const handleOpenPayModal = (ticket) => {
    setSelectedTicket(ticket);
    setPayModalOpen(true);
  };
  
  const handlePayment = async (method) => {
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
    
  // 1. Apply search to the full data
const filteredData = data.filter(ticket => {
  const query = searchQuery.toLowerCase();
  return Object.values(ticket).some(
    value =>
      typeof value === "string" &&
      value.toLowerCase().includes(query)
  );
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

const sortedTickets = data.sort((a, b) => {
  if (!sortConfig.key) return 0;
  const aVal = a[sortConfig.key];
  const bVal = b[sortConfig.key];

  if (typeof aVal === 'number' && typeof bVal === 'number') {
    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
  }

  return sortConfig.direction === 'asc'
    ? String(aVal).localeCompare(String(bVal))
    : String(bVal).localeCompare(String(aVal));
});

const paginatedTickets = sortedTickets.slice(
  (currentPage - 1) * ticketsPerPage,
  currentPage * ticketsPerPage
);
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

const handleSortActive = () => {
  const sorted = [...data].sort((a, b) => {
    const isCollectedA = a.status === "Collected Device";
    const isCollectedB = b.status === "Collected Device";

    // Collected Device always last
    if (isCollectedA && !isCollectedB) return 1;
    if (!isCollectedA && isCollectedB) return -1;
      // Then sort by date (newest first)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateB - dateA !== 0) return dateB - dateA;

    const priorityA = statusPriority.indexOf(a.status);
    const priorityB = statusPriority.indexOf(b.status);
    return priorityA - priorityB;

  });

  setData(sorted); // Or however you're updating the ticket list
};

//TO RESET DATA
const [originalData, setOriginalData] = useState([]);


const handleReset = () => {
  setData(originalData);
};


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex  mb-8">
        <h1 className="text-4xl font-aoMono text-black font-bold">
          DASHBOARD
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
          {/* <button
            onClick={handleDeleteAll}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-spaceGrotesk transition-colors"
          >
            Delete All Tickets
          </button> */}
          <label className="bg-green-600 hover:scale-105 text-white px-4 py-2 rounded-lg font-spaceGrotesk cursor-pointer">
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </label>
          <div className="relative group">
          <button
            onClick={() => setExportData(!exportData)}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2.5 rounded-lg font-spaceGrotesk transition-colors"
          >
            <ArrowDownTrayIcon height={20} width={20} />
            <span className="absolute z-100 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
             Export CSV
            </span>
          </button>
          </div>
          <div className="relative group">
          <button
            onClick={handleSortActive}
            className="p-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-spaceGrotesk"
          >
            <FunnelIcon height={19} width={19} />
            <span className="absolute z-100 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
              Active filter
            </span>
          </button>
          </div>
          <div className="relative group">
          <button
            onClick={handleReset}
            className="bg-gray-500 p-2.5 text-white rounded-lg font-spaceGrotesk"
            title="Reset to default"
          >
            <ArrowPathRoundedSquareIcon height={20} width={20} />
            <span className="absolute z-100 -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
              Reset table
            </span>
          </button>
          </div>
          {exportData ? <FilteredExport/>:null}
          
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
        <div className="fixed inset-0 font-spaceGrotesk z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white mt-28 rounded-lg p-6 w-full max-w-2xl">
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
              );
            })}

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
              {ticketFields.map((key) => (
                <>
                <th key={key} 
                className="cursor-pointer px-2 py-3 text-center text-sm font-spaceGrotesk font-medium text-gray-500 uppercase tracking-wider"
                onClick={() => handleSort(key)}>
                {getDisplayName(key)}
                    {sortConfig.key === key && (
                        sortConfig.direction === 'asc' ? (
                          <BarsArrowUpIcon className="w-4 h-4 inline ml-1" />
                        ) : (
                          <BarsArrowDownIcon className="w-4 h-4 inline ml-1" />
                        )
                      )}
                </th>
                 </>
                ))}
                <th className="px-2 py-3 text-left text-center text-sm font-spaceGrotesk font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentTickets.map((row, index) => {
                const isCollected = row.status === "Collected Device";

                return (
                  <tr
                    key={index}
                    className={` ${isCollected ? "bg-gray-200" : "hover:bg-gray-50"}`}
                    // onClick={() => handleOpen(row)}
                  >
                    {ticketFields.map((key) => (
                      <td
                        key={key}
                        className="px-2 text-center items-center py-3 whitespace-nowrap text-md font-spaceGrotesk text-gray-900"
                      >
                        {key === "priority" ? (
                          <div
                            className={`w-8 h-8 mx-auto self-align-center rounded-full flex items-center justify-center text-white font-bold ${getPriorityStyle(row[key])}`}
                          >
                            {row[key]}
                          </div>
                        ) : key === "status" ? (
                          <span
                            className={`text-sm font-medium px-2.5 py-0.5 rounded-full ${getStatusStyle(row[key])}`}
                          >
                            {row[key]}
                          </span>
                        ) : (
                          row[key]
                        )}
                      </td>
                    ))}
                    <td className="px-2 py-3 z-50 whitespace-nowrap text-sm flex flex-row font-spaceGrotesk">
                      <button
                        onClick={() => handleOpen(row)}
                        className="bg-[#9C795C] mr-2 hover:scale-105 text-white px-3 py-1 rounded-lg transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() =>
                          row.paid !== "Cash" && row.paid !== "Online"
                            ? handleOpenPayModal(row)
                            : null
                        }
                        className={`px-3 py-1 rounded-lg transition-all ${
                          row.paid === "Cash" || row.paid === "Online"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                        disabled={row.paid === "Cash" || row.paid === "Online"}
                      >
                        Pay
                      </button>
                      <SendSMSButton phone={row.contactNo} name={row.name}  />
                    </td>
                    
                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>

      )}
      <div className="flex justify-center items-center mt-4 gap-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1  bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span className="font-spaceGrotesk text-gray-700">
          Page {currentPage} of {Math.ceil(filteredData.length / ticketsPerPage)}
        </span>

        <button
          onClick={() =>
            setCurrentPage((prev) =>
              prev < Math.ceil(filteredData.length / ticketsPerPage) ? prev + 1 : prev
            )
          }
          disabled={currentPage === Math.ceil(filteredData.length / ticketsPerPage)}
          className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {payModalOpen && selectedTicket && (
            <div className="fixed inset-0 bg-black font-aoMono uppercase bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
                <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
                <div className="flex justify-around">
                  <button
                    onClick={() => handlePayment("Cash")}
                    className="bg-green-500 hover:bg-green-600 uppercase text-white px-4 pt-1.5 rounded-lg"
                  >
                    Pay by Cash
                  </button>
                  <button
                    onClick={() => handlePayment("Online")}
                    className="bg-blue-500 hover:bg-blue-600 uppercase text-white px-4 pt-1.5 rounded-lg"
                  >
                    Pay by Card
                  </button>
                </div>
                <button
                  onClick={() => setPayModalOpen(false)}
                  className="mt-4 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

    </div>
  );
}
