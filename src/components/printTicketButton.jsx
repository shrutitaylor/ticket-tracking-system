import React, { useEffect, useRef, useState } from "react";
import logo from "../assets/images/iolabs-black.png";
import qrcodeReview from "../assets/images/google-review-qr.png";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";

const PrintTicketButton = ({ ticket, onBeforePrint }) => {
  const printRef = useRef();
  const [showPreview, setShowPreview] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [currentTicket, setCurrentTicket] = useState({
    date: "2025-05-02",
    name: "John Doe",
    contactNo: "0400000000",
    device: "iPhone 13",
    issue: "Screen cracked",
    price: "$200"
  });

  useEffect(() => {
    setCurrentTicket(ticket);

  }, [ticket]);

  const handleGeneratePDF = async () => {


    const element = printRef.current;
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [300, canvas.height]
    });
    pdf.addImage(imgData, "PNG", 0, 0);

    const pdfBlob = pdf.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(blobUrl);

    pdf.save("ticket"+currentTicket.name+".pdf");
  };

  return (
    <>
      <button
        onClick={() => setShowPreview(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Show Ticket & Generate PDF
      </button>

      {/* Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg w-[340px] relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
            >
              ×
            </button>

            {/* Ticket Preview */}
            <div
              ref={printRef}
              className="bg-white p-2 border rounded"
              style={{ width: "270px", fontFamily: "monospace", fontSize: "12px" }}
            >
              <div className="flex justify-between items-center text-center">
                <img src={logo} alt="Logo" style={{ maxWidth: "35px" }} />
                <div className="text-right flex flex-col">
                  <div><strong>IO LABS</strong></div>
                  <div>iolabs.au</div>
                  <div>Ph: (+61) 466987114</div>
                </div>
              </div>

              <hr className="my-2" />

              <div className="text-xs my-2">
                <strong>Date:</strong> {currentTicket.date}<br />
                <strong>Name:</strong> {currentTicket.name}<br />
                <strong>Contact:</strong> {currentTicket.contactNo}<br />
              </div>

              <hr className="my-2" />

              <div className="text-xs my-2">
                <strong>Device:</strong> {currentTicket.device}<br />
                <strong>Issue:</strong> {currentTicket.issues}<br />
                <strong>Cost:</strong> {currentTicket.price}<br />
              </div>

              <hr className="my-2" />

              <div className="text-center flex flex-col justify-center items-center mt-2">
                <strong>Thank you for choosing IO Labs!</strong>
                Feel free to leave us a feedback.
                <img src={qrcodeReview} alt="qrcode" className="mt-2" style={{ maxWidth: "40px" }} />
                <strong>IO LABS</strong>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-3 mt-4">
              <button
                onClick={handleGeneratePDF}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Download PDF & Generate QR
              </button>

              {pdfUrl && (
                <div className="mt-2 text-center">
                  <h3 className="font-bold text-sm mb-1">Scan QR to Download Ticket</h3>
                  <QRCodeSVG value={pdfUrl} size={128} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PrintTicketButton;
