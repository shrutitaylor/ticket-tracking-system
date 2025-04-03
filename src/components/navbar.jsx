// Navbar.js
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../pages/firebaseConfig";
import logo from "../assets/images/iolabs-logo.webp";

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="sticky bg-white top-0 z-10 shadow-lg font-spaceGrotesk">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="#" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img src={logo} className="h-8" alt="Logo" />
        </a>
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4  md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white ">
            {user ? (
               <>
               <li className="text-gray-900 font-bold">
                 {user.displayName || user.email} {/* Show name or email */}
               </li>
               <li>
                 <button 
                   onClick={handleLogout} 
                   className="border bg-black text-white rounded-lg px-4 py-2 hover:bg-white hover:text-black transition-all duration-300 hover:border-black hover:border-2">
                   Logout
                 </button>
               </li>
             </>
            ) : (
              <>
                <li>
                  <a href="/login" className="text-gray-900 hover:border-black hover:border-2 rounded-lg px-4 py-2 ">Login</a>
                </li>
                <li>
                  <a href="/signup" className="border bg-black text-white rounded-lg px-4 py-2 hover:bg-white hover:text-black  transition-all duration-300 hover:border-black hover:border-2">Signup</a>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
