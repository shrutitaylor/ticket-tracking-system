import { useState } from "react";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function SearchModal({ tickets, handleOpen }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState([]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.trim() === "") {
            setSelectedTicket([]); // clear results
            return;
        }

        const found = tickets.filter(ticket =>
            ticket.name?.toLowerCase().includes(value.toLowerCase())
        );

        setSelectedTicket(found);
    };


  // const handleOpen = (ticket) => {
  //   alert(`Open modal for: ${ticket.name}`); // Replace with real modal logic if needed
  // };

  return (
    <div className="w-full font-mono flex flex-col max-w-sm md:max-w-2xl mx-auto">
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search ticket by name..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-lime-300"
      />

      {selectedTicket.length > 0 && (
        <div className="h-96 w-full max-w-[280px] md:max-w-2xl mt-12 rounded-lg bg-stone-500 p-2 absolute z-50 flex flex-col overflow-y-auto">
          {selectedTicket.map((ticket) => (
            <div
              key={ticket.id}
              className="mt-4 bg-stone-200 text-sm min-h-[50px] overflow-hidden font-bold flex flex-col w-full rounded-lg p-2 border-l-4 border-lime-300"
            >
              <span className="flex items-center">
                {ticket.name} - {ticket.date}
                <InformationCircleIcon
                  onClick={() => handleOpen(ticket)}
                  className="cursor-pointer h-4 w-4 text-stone-400 ml-2"
                />
              </span>
              <p className="text-xs font-thin tracking-tighter">
                {ticket.device}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
