import { useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebaseConfig";

const parseDateString = (str) => {
  const [day, month, year] = str.split("/");
  return new Date(`${year}-${month}-${day}`);
};

const FilteredExportTickets = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  const exportToCSV = (data) => {
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${val}"`)
        .join(",")
    );
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "filtered-tickets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    if (!startDate || !endDate) return alert("Please select both dates");
    setLoading(true);

    try {
      const snapshot = await getDocs(collection(db, "tickets"));
      const filtered = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((ticket) => {
          if (!ticket.date) return false;
          const ticketDate = parseDateString(ticket.date);
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return ticketDate >= start && ticketDate <= end;
        });

      if (filtered.length === 0) {
        alert("No tickets found in the selected date range.");
      } else {
        exportToCSV(
          filtered.map((t) => ({
            Name: t.name || "",
            Contact: t.contactNo || "",
            Device: t.device || "",
            Issues: t.issues || "",
            Date: t.date || "",
            Price: t.price || "",
            Paid: t.paid || "",
            PartsUsed: t.partsUsed || "",
            Priority: t.priority || "",
            Status: t.status || "",
            Notes: t.notes || "",
            Service: t.service || "",
            TicketNo: t.ticketNo || "",
          }))
        );
      }
    } catch (err) {
      console.error("Error exporting tickets:", err);
      alert("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 fixed top-64 ml-64 left-96 font-spaceGrotesk  z-50 bg-white rounded shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Export Tickets by Date</h2>
      <div className="flex flex-col gap-4">
        <label>
          Start Date:
          <input
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="ml-2 border rounded p-2"
          />
        </label>
        <label>
          End Date:
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="ml-2 border rounded p-2"
          />
        </label>
        <button
          onClick={handleExport}
          disabled={loading}
          className="bg-black text-white p-2 rounded hover:bg-gray-800"
        >
          {loading ? "Exporting..." : "Export CSV"}
        </button>
      </div>
    </div>
  );
};

export default FilteredExportTickets;
