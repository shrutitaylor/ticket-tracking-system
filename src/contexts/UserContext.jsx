import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [firstName, setFirstName] = useState("");

  return (
    <UserContext.Provider value={{ firstName, setFirstName }}>
      {children}
    </UserContext.Provider>
  );
};
