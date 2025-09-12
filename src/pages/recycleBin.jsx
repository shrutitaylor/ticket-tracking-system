import { useEffect, useState } from "react";
import { TrashIcon } from "@heroicons/react/20/solid";

export default function DeletedTicketsTable() {
  const [tickets, setTickets] = useState([]);

  const fetchDeletedTickets = async () => {
    try {
      const response = await fetch("/.netlify/functions/getDeletedTickets");
      const data = await response.json();
      setTickets(data);
    } catch (err) {
      console.error("Error fetching deleted tickets:", err);
    }
  };

  const handleDelete = async (ticketId) => {
    if (!window.confirm("Delete permanently?")) return;

    try {
      await fetch("/.netlify/functions/deleteDeletedTicket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      setTickets(prev => prev.filter(t => t.id !== ticketId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async (ticketId) => {
    try {
      await fetch("/.netlify/functions/restoreTicket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      setTickets(prev => prev.filter(t => t.id !== ticketId));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDeletedTickets();
  }, []);

  return (
    <div className="mt-10 mx-6 sm:mx-44 flex flex-col  justify-center overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4 text-black font-spaceGrotesk">Recycle Bin</h2>
      <table className="sm:min-w-full font-aoMono uppercase bg-white shadow-lg rounded-lg">
        <thead>
          <tr className="bg-stone-300 text-xs sm:text-sm">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Device</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="text-xs sm:text-sm divide-y divide-gray-200">
          {tickets.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                No deleted tickets found
              </td>
            </tr>
          ) : (
            tickets.map(ticket => (
              <tr key={ticket.id}>
                <td className="px-4 py-2">{ticket.date}</td>
                <td className="px-4 py-2">{ticket.name}</td>
                <td className="px-4 py-2">{ticket.device}</td>
                <td className="px-4 py-2 font-aoMono  flex flex-row space-x-2">
                  <button
                    onClick={() => handleRestore(ticket.id)}
                    className="px-3 py-1 pt-2 bg-green-600 uppercase text-xs text-white rounded-md hover:bg-green-700"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handleDelete(ticket.id)}
                    className="px-1 py-1  bg-red-600 uppercase text-xs text-white rounded-md hover:bg-red-700"
                  >
                    <TrashIcon height={20} width={20} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
