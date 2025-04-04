// Navbar.js
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../pages/firebaseConfig";
import logo from "../assets/images/iolabs-logo.webp";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login"); // Redirect to login page
  };

  return (
    <nav className="sticky bg-white top-0 z-10 shadow-lg font-spaceGrotesk max-w-screen ">
      <div className="flex flex-wrap items-center justify-between mx-5  p-4">
        <a href="#" className="flex items-center space-x-2 rtl:space-x-reverse">
          <img src={logo} className="h-14" alt="Logo" />
        </a>
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4  md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white ">
            {user ? (
               <>
               <li className="text-gray-900 font-bold pt-2">
                 {user.displayName || user.email} {/* Show name or email */}
               </li>
               <li className="pt-2">
                 <a href="/" className="text-gray-900 hover:bg-black hover:text-white rounded-lg px-4 py-2 ">dashboard</a>
               </li>
               <li className="pt-2">
                 <a href="/transactions" className="text-gray-900 hover:bg-black hover:text-white rounded-lg px-4 py-2 ">transactions</a>
               </li>
              
               <li className="pt-2">
               {user.email === "iolabs.au.ops@gmail.com" &&
                 <a href="/users" className="text-gray-900  hover:bg-black hover:text-white rounded-lg px-4 py-2 ">users</a>
               }
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
