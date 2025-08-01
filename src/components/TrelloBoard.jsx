import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "react-beautiful-dnd";
import { updateTicketStatus } from "../utility/updateTicket";
import { InformationCircleIcon } from "@heroicons/react/16/solid";

const TrelloBoard = (props) => {
 
  // Group tickets by status initially onClick={() => handleOpen(row)}
  const groupByStatus = (tickets) => {
    const grouped = {};
    tickets.forEach((ticket) => {
      if (!grouped[ticket.status]) grouped[ticket.status] = [];
      grouped[ticket.status].push(ticket);
    });
    return grouped;
  };
  
  const [columns, setColumns] = useState(groupByStatus(props.paginatedTickets));
//   const statusOrder = ["To Do", "In Progress", "Review", "Done"];
  const statusOrder = [
    "EMERGENCY",
    "Return with update",
    "Waiting for Customer",
  "Waiting for Parts",
  "Waiting for Device",
    "Sent to Mike",
    "Pending Payment",
  "Send Invoice",];

    const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    if (sourceCol === destCol && source.index === destination.index) return;

    const sourceItems = Array.from(columns[sourceCol] || []);
    const destItems = Array.from(columns[destCol] || []);

    const [movedItem] = sourceItems.splice(source.index, 1);
    const confirmed = window.confirm(`Do you want to move "${movedItem.name}" to "${destCol}"?`);
    if (!confirmed) return;
    try {
        // 🔄 Update status in Firestore
        await updateTicketStatus(movedItem.id, destCol);
        movedItem.status = destCol;
        destItems.splice(destination.index, 0, movedItem);

        setColumns((prev) => ({
        ...prev,
        [sourceCol]: sourceItems,
        [destCol]: destItems,
        }));
    } catch (error) {
        alert("Failed to update status in backend.");
        console.error(error);
    }
}


  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex font-mono grid md:grid-cols-4 md:grid-rows-2 grid-cols-2 gap-4 justify-center mx-auto p-4">
        {statusOrder.map((status) => (
          <Droppable droppableId={status} key={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-shrink-0 relative h-44 md:h-80 overflow-auto rounded-lg shadow p-3 transition-all duration-300 ${
                  snapshot.isDraggingOver ? "bg-lime-400" : "bg-stone-100"
                }
                ${status==="EMERGENCY" ? "bg-gradient-to-r from-rose-400 to-red-400 text-stone-100":"bg-stone-200 text-stone-700"}
                `}
                 
              >
                <h2 className=" font-bold text-sm md:text-lg mb-3">{status}</h2>
                <div className="flex flex-col gap-3 min-h-[50px]">
                  {(columns[status] || []).map((ticket, index) => (
                    <Draggable key={ticket.id} draggableId={ticket.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-stone-100 rounded p-3 text-stone-800 shadow-sm border-l-4
                             ${
                            ticket.priority === "H"
                              ? "border-rose-400"
                              : ticket.priority === "M"
                              ? "border-amber-400"
                              : "border-lime-300"
                          } transition-all duration-200 ${
                            snapshot.isDragging ? "scale-105 bg-opacity-80" : ""
                          }`}
                        >
                          <p className="font-semibold text-xs md:text-sm flex flex-row">{ticket.name} <InformationCircleIcon onClick={() => props.onDataSend(ticket)} className="cursor-pointer h-3 w-3 text-stone-400 mt-1 ml-0.5 sm:ml-2"/> </p>
                          <p className="text-xs text-stone-600 tracking-tighter">Device: {ticket.device}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
    
  );
};

export default TrelloBoard;