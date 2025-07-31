import { DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import PrintTicketButton from "./printTicketButton";
import SendSMSButton from "./sendSMSButton";

export default function ViewModal ({updateTicketFields,newTicket , isUpdateMode , user,handleDuplicate,handleOpenPayModal, handleSubmit, handleClose, handleChange}){
    const [payModalOpen, setPayModalOpen] = useState(false);
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
    const [isVisible, setIsVisible] = useState(true);
    return(
      <>
      <div className="fixed inset-0 w-screen font-spaceGrotesk z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white sm:mt-28 max-w-[90vw] rounded-lg p-2 sm:p-6 sm:w-full sm:max-w-2xl">
         
              {isVisible && (
                <>
            <h2 className="text-lg flex flex-row justify-between sm:text-2xl font-spaceGrotesk mb-4">
              {isUpdateMode ? "Update Ticket" : "Create Ticket"}
              <button
                onClick={handleClose}
                className="text-sm px-2 text-gray-600 hover:text-red-800 hover hover:bg-red-200 font-spaceGrotesk"
              >
                X
              </button>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3  gap-4">
            {updateTicketFields.map((key) => {
              const value = newTicket[key];
              return (
                <div key={key} className="col-span-1">
                  <label className="block text-xs sm:text-sm font-spaceGrotesk mb-1">{getDisplayName(key)}</label>
                  {key === "priority" ? (
                    <div className="flex gap-2 sm:gap-4">
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
                          <div className={`sm:w-8 sm:h-8 h-6 w-6 rounded-full flex items-center justify-center text-white font-bold ${
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
                      className="w-full text-xs sm:text-sm  px-3 py-1 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-spaceGrotesk"
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
                        className="w-full text-xs sm:text-sm  px-3 py-1 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-spaceGrotesk"
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
                      className={`w-full text-xs sm:text-sm  px-3 py-1 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-spaceGrotesk ${
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
                      className={`w-full text-xs sm:text-sm  px-3 py-1 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-spaceGrotesk ${
                        (key === "date" || key === "ticketNo") ? "bg-gray-100" : ""
                      }`}
                    />
                  )}
                </div>
                
              );
              
            })}

            </div>
           
            <div className="flex justify-end gap-4 mt-6">
              <div className="flex flex-row" >
                <SendSMSButton phone={newTicket.contactNo} name={newTicket.name} device={newTicket.device} />
                <button
                        onClick={() =>
                          newTicket.paid && (newTicket.paid.startsWith("Cash") || newTicket.paid.startsWith("Online"))
                            ? null : handleOpenPayModal(newTicket)
                            
                        }
                        className={`px-3 py-1 h-8 sm:h-10 rounded-lg transition-all mx-2 ${
                          newTicket.paid && (newTicket.paid.startsWith("Cash") || newTicket.paid.startsWith("Online"))
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600 text-white"
                        }`}
                        disabled={
                          newTicket.paid && (newTicket.paid.startsWith("Cash") || newTicket.paid.startsWith("Online"))
                        }
                      >
                        Pay
                      </button>
              <button
                onClick={handleDuplicate}
                className=  "px-1 pb-1 sm:pb-2 sm:p-2  mr-1 rounded-lg bg-amber-300 text-amber-100 hover:bg-amber-600 hover:text-amber-300 font-spaceGrotesk"
              ><DocumentDuplicateIcon className="h-4 w-4 sm:w-6 sm:h-6 inline" />
              </button>
              {/* <PrintTicketButton ticket={newTicket} onBeforePrint={() => setIsVisible(false)}  />*/}
              </div> 
              <button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white h-8 sm:h-10  px-4 sm:py-2 rounded-lg font-spaceGrotesk"
              >
                {isUpdateMode ? "Update" : "Submit"}
              </button>
            </div>
          
            </> )}
          </div>
          
        </div>
      </>
    );
}