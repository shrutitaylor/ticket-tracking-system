
import { EnvelopeIcon } from '@heroicons/react/24/outline';
import React, { useState, useEffect } from 'react';

// Move this outside the component
const defaultMessages = {
  received: "Hi {{name}},\nwe've received your device. We'll keep you updated as we diagnose the issue.",
  inProgress: "Hi {{name}},\nyour device is currently being repaired. We'll notify you once it's ready for collection.",
  ready: "Hi {{name}}, good news!\nYour device is ready for pickup at our store.",
  delayed: "Hi {{name}},\nyour repair is taking longer than expected. We appreciate your patience and will update you soon.",
  followUp: "Hi {{name}},\njust checking in. Let us know if you have any questions about your recent repair.",
  collected: "Hi {{name}},\nthanks for collecting your device. We hope everything is working perfectly!"
};

const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.toString().replace(/\s+/g, ""); // remove all spaces

  if (cleaned.startsWith("0")) {
    cleaned = "+61" + cleaned.slice(1); // replace leading 0 with +61
  }

  return cleaned;
};

const sendSMS = async (phoneNumber, message) => {
  const res = await fetch("/.netlify/functions/sendSMS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ phoneNumber, message })
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  return data;
};

const SendSMSButton = ({ phone, name, device}) => {
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState("received");
  const [message, setMessage] = useState("");

  // Update message on category or name change
  useEffect(() => {
    if (defaultMessages[category]) {
      setMessage(defaultMessages[category].replace("{{name}}", name));
    }
  }, [category, name]);

  const handleClick = async () => {
    const formattedPhone = formatPhoneNumber(phone);

    try {
      const result = await sendSMS(formattedPhone, message);
      if (result.success) {
        alert('SMS sent successfully!');
      } else {
        alert('Failed to send SMS. Check Cellcast response.');
        console.error(result);
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('An error occurred while sending SMS.');
    }

    setShowModal(false);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-lime-500 hover:text-lime-600 text-white pl-2 py-1 rounded text-sm"
      >
        <EnvelopeIcon className="size-6 text-amber-600 hover:text-amber-900" />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black  bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 min-w-[700px] rounded shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-2">Send SMS</h2>
            <p ><strong>Name:</strong> {name}</p>
            <p><strong>Phone:</strong> {formatPhoneNumber(phone)}</p>

            <label className="block mt-3 text-sm font-medium">Category</label>
            <select
              className="w-full p-2 border rounded text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="received">Received</option>
              <option value="inProgress">In Progress</option>
              <option value="ready">Ready for Pickup</option>
              <option value="delayed">Delayed</option>
              <option value="followUp">Follow Up</option>
              <option value="collected">Collected</option>
            </select>

            <label className="block mt-3 text-sm font-medium">Message</label>
            <textarea
              className="w-full mt-1 p-2 border rounded text-sm"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleClick}
                className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SendSMSButton;
