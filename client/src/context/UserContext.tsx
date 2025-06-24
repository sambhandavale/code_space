import { createContext, useContext, useState } from "react";

const UserContext = createContext<any>(null);

export const UserProvider = ({ children }: any) => {
  const [userRating, setUserRating] = useState<number>(0);

  return (
    <UserContext.Provider value={{ userRating, setUserRating }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
