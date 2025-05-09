import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { db } from "./firebaseConfig";
import { getAuth } from "firebase/auth";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, orderBy, limit } from "firebase/firestore";
import { useLoader } from "../contexts/LoaderContext";
import { ArrowDownIcon, ArrowDownTrayIcon, ArrowPathIcon, ArrowPathRoundedSquareIcon, ArrowUpIcon, BarsArrowDownIcon, BarsArrowUpIcon, FunnelIcon } from "@heroicons/react/16/solid";
import FilteredExport from "./exportData";
import { ArrowUturnLeftIcon } from "@heroicons/react/20/solid";
import { Tooltip } from "@mui/material";
import SendSMSButton from "../components/sendSMSButton";
import PrintTicketButton from "../components/printTicketButton";
import DeleteTicketButton from "../components/deleteTicketButton";


export default function Report() {
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

  const ticketFields = [
    
    "priority",
    "status",
    "name",
    "contactNo",
    "device",
    "issues",
    "price",
    "date",
    "paid"

  ];
  
  
  const mapCSVRowToTicket = (row) => {
    const rawDate = row["date"];
    const formattedDate =
      typeof rawDate === "string"
        ? rawDate
        : XLSX.SSF.format("dd/mm/yyyy", rawDate); // handle Excel date numbers
  
    return {
      priority: row["priority"] || "",
      status: row["status"] || "open",
      name: row["name"] || "",
      contactNo: row["contactNo"] || "",
      device: row["device"] || "",
      issues: row["issues"] || "",
      price: row["price"] || "",
      service: row["service"] || "",
      partsUsed: row["partsUsed"] || "",
      paid: row['paid'] ,
      date: formattedDate || new Date().toLocaleDateString("en-GB"),
    };
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



  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "tickets"));
      const tickets = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }));
        // .filter(ticket => 
        //   typeof ticket.paid === "string" &&
        //   (ticket.paid.startsWith("Cash") || ticket.paid.startsWith("Online"))
        // );
    //  console.log(tickets);
      // Sort by date descending (newest first)
      tickets.sort((a, b) => {
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
  
      setData(tickets);
      setOriginalData(tickets);
    } catch (error) {
      console.error("Error loading tickets:", error);
    }
  };
  useEffect(() => {
      fetchData();
    }, []);
  

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

//weekly filter
const filterThisWeek = () => {
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() - 6); // 7-day range from today
  
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
  
    const filtered = originalData.filter(ticket => {
      const ticketDate = parseDate(ticket.date);
      return ticketDate <= today && ticketDate >= endOfWeek;
    });
//    console.log(filtered);
    setData(filtered);
  };
  
    //monthly filter
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const filterByMonth = (month) => {
    const currentYear = new Date().getFullYear();

    const parseDate = (d) => {
        if (typeof d === "string") {
        const [day, monthStr, year] = d.split("/").map(Number);
        return new Date(year, monthStr - 1, day);
        } else if (d instanceof Date) {
        return d;
        } else if (d?.seconds) {
        return new Date(d.seconds * 1000);
        } else {
        return new Date(0);
        }
    };

    const filtered = originalData.filter(ticket => {
        const ticketDate = parseDate(ticket.date);
        return (
        ticketDate.getMonth() === month &&
        ticketDate.getFullYear() === currentYear
        );
    });

    setData(filtered);
    };



  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex  mb-8">
        <h1 className="text-4xl font-aoMono text-black font-bold">
          REPORT
        </h1>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-4 font-spaceGrotesk ">
          
          <div className="relative group">
          <button
            onClick={filterThisWeek}
            className="bg-yellow-300 text-yellow-900 px-4 py-2 rounded-md hover:bg-yellow-400 transition"
            >
            Weekly
            </button>

          </div>
          <div className="relative group">
          <div className="flex items-center gap-2 mb-4">
                <label htmlFor="month" className="text-md font-medium">Filter by Month:</label>
                <select
                    id="month"
                    value={selectedMonth}
                    onChange={(e) => {
                    const month = parseInt(e.target.value);
                    setSelectedMonth(month);
                    filterByMonth(month);
                    }}
                    className="border px-3 py-2 rounded-md bg-white shadow-sm"
                >
                    {Array.from({ length: 12 }).map((_, index) => (
                    <option key={index} value={index}>
                        {new Date(0, index).toLocaleString("default", { month: "long" })}
                    </option>
                    ))}
                </select>
                </div>
         
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
                
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300">
              {currentTickets.map((row, index) => {
                const isClosed = row.priority === "O";

                return (
                  <tr
                    key={index}
                    className={` ${isClosed ? "bg-gray-200" : "hover:bg-gray-50"}`}
                    // onClick={() => handleOpen(row)}
                  >
                    {ticketFields.map((key) => (
                      <td
                        key={key}
                        className="px-2 text-center items-center py-3 whitespace-nowrap text-md font-spaceGrotesk text-gray-900"
                      >
                        {key === "priority" ? (
                          <div
                            className={`w-8 h-8 mx-auto self-align-center rounded-full flex items-center justify-center text-white font-bold ${getPriorityStyle(row[key])} `}
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


    </div>
  );
}
