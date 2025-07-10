import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const Accordion = () => {
  const [openIndex, setOpenIndex] = useState(null);
  let index = 1; // Example index, replace with your dynamic data

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full flex max-w-xl mx-auto space-y-2">
      
        <div key={index} className="border w-full rounded-xl overflow-hidden shadow">
          <button
            onClick={() => toggle(index)}
            className="w-full flex justify-between items-center px-4 py-3 bg-gray-100 hover:bg-gray-200 text-left"
          >
            <span className="font-medium">item.title</span>
            <ChevronDownIcon
              className={`w-5 h-5 transition-transform ${
                openIndex === index ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
          <div
            className={`px-4 py-2 text-sm text-gray-700 transition-all duration-300 ease-in-out ${
              openIndex === index ? "max-h-40" : "max-h-0 overflow-hidden"
            }`}
          >
            item.content
          </div>
        </div>
    
    </div>
  );
};

export default Accordion;
