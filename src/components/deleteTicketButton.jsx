// components/DeleteTicketButton.jsx
import React from "react";

const DeleteTicketButton = ({ ticketId, onDeleted }) => {
  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this ticket?");
    if (!confirmed) return;

    try {
      const response = await fetch("/.netlify/functions/deleteTicket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Ticket deleted successfully");
        if (onDeleted) onDeleted(ticketId); // callback to update UI
      } else {
        console.error(result);
        alert("Failed to delete ticket");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while deleting the ticket");
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 hover:bg-red-700   ml-1  px-3 text-white rounded-full"
    >
      X
    </button>
  );
};

export default DeleteTicketButton;
