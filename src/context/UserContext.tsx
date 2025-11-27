"use client";

import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface User {
  id: string;
  name: string;
  role: string;
}

interface UserContextProps {
  currentUser: User | null;
  loading: boolean;
}

const UserContext = createContext<UserContextProps>({
  currentUser: null,
  loading: true,
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setCurrentUser({
        id: session.user.id as string,
        name: session.user.name as string,
        role: session.user.role as string,
      });
    } else {
      setCurrentUser(null);
    }
  }, [session, status]);

  return (
    <UserContext.Provider value={{ currentUser, loading: status === "loading" }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
