import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../pages/firebaseConfig";
import logo from "../assets/images/iolabs-black.png";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import userImg from "../assets/images/sukuna.jpeg"

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to toggle dropdown visibility
  const navigate = useNavigate();
  const { firstName } = useUser();

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

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev); // Toggle the dropdown visibility
  };

  return (
    <nav className="sticky bg-white top-0 z-10 shadow-lg font-aoMono max-w-screen ">
      <div className="flex flex-wrap items-center justify-between mx-5  p-4">
        <a href="#" className="flex items-center space-x-2 rtl:space-x-reverse">
          <img src={logo} className="h-14" alt="Logo" />
        </a>
        <div className="hidden w-full md:block md:w-auto" id="navbar-default">
          <ul className="font-medium flex flex-col p-4 md:p-0 mt-4  md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white ">
            {user ? (
              <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                <button
                  type="button"
                  className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                  onClick={toggleDropdown} // Handle click to toggle dropdown
                >
                  <span className="sr-only">Open user menu</span>
                  <img
                    className="w-8 h-8 rounded-full"
                    src={userImg}
                    alt="user photo"
                  />
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                  <div className="z-100 absolute w-96 right-10 top-14  my-4 text-base list-none bg-gray-100 divide-y divide-gray-300 rounded-lg shadow-sm ">
                    <div className="px-4 py-3">
                      <span className="block text-md uppercase text-gray-900 dark:text-white">
                        {firstName}
                      </span>
                      <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                        {user.email}
                      </span>
                    </div>
                    <ul className="py-2" aria-labelledby="user-menu-button">
                      <li>
                        <a
                          href="/"
                          className="block px-4 py-2 uppercase text-sm text-gray-700 hover:bg-gray-200 "
                          onClick={toggleDropdown} 
                        >
                          Tickets
                        </a>
                        <a
                          href="/active"
                          className="block px-4 py-2 uppercase text-sm text-gray-700 hover:bg-gray-200 "
                          onClick={toggleDropdown} 
                        >
                          Dashboard
                        </a>
                      </li>
                      {/* <li>
                        <a
                          href="/transactions"
                          className="block px-4 py-2 uppercase  text-sm text-gray-700 hover:bg-gray-200 "
                          onClick={toggleDropdown} 
                        >
                          Transactions
                        </a>
                      </li> */}
                      {user.email === "iolabs.au.ops@gmail.com" && (
                        <>
                        <li>
                          <a
                            href="/users"
                            className="block px-4 py-2 uppercase text-sm text-gray-700 hover:bg-gray-200 "
                            onClick={toggleDropdown} 
                          >
                            Users
                          </a>
                        </li>
                        <li>
                        <a
                          href="/report"
                          className="block px-4 py-2 uppercase text-sm text-gray-700 hover:bg-gray-200 "
                          onClick={toggleDropdown} 
                        >
                          Report
                        </a>
                      </li>
                      </>
                      )}
                      <li>
                        <button
                          onClick={handleLogout}
                          className="block w-full uppercase text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 "
                        >
                          Sign out
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <>
                <li>
                  <a
                    href="/login"
                    className="text-gray-900 hover:border-black hover:border-2 rounded-lg px-4 pt-4 pb-2 uppercase"
                  >
                    Login
                  </a>
                </li>
                <li>
                  <a
                    href="/signup"
                    className="border bg-black text-white rounded-lg px-4 pt-4 pb-2 hover:bg-white hover:text-black transition-all duration-300 border-black border-2 uppercase"
                  >
                    Signup
                  </a>
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
