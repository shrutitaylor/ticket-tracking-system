import { useState, useEffect } from "react";


const Tooltip = ({content}) => {
    return(<>
    <button data-tooltip-target="tooltip-animation" type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Animated tooltip</button>

        <div id="tooltip-animation" role="tooltip" className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-xs opacity-0 tooltip dark:bg-gray-700">
            T{content}
            <div className="tooltip-arrow" data-popper-arrow></div>
        </div>
    </>);
};

export default Tooltip;