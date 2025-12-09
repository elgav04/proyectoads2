"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/src/components/sidebar";
import { UserProvider } from "@/src/context/UserContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
        <UserProvider>
            <ProtectedContent>{children}</ProtectedContent>
        </UserProvider>
    </SessionProvider>
  );
}

function ProtectedContent({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  if (status === "loading" || !session) return null;

  return (
    <div className="d-flex">
      <Sidebar />

      <main
        className="main-content p-4 bg-light"
        style={{
          minHeight: "100vh",
          overflowY: "auto",
          overflowX: "auto",
        }}
      >
        {children}
      </main>
    </div>
  );
}
