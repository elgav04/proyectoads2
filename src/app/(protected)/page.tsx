import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login"); 
  }

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "90vh",
        textAlign: "center",
        padding: "0 1rem", 
      }}
    >
      <h1
        style={{
          fontSize: "clamp(2rem, 8vw, 3.5rem)", 
          marginBottom: "0.5rem",
          wordWrap: "break-word",
        }}
      >
        Bienvenido {session.user?.name}
      </h1>
      <p
        style={{
          fontSize: "clamp(1rem, 4vw, 1.25rem)", 
        }}
      >
        Rol: {session.user?.role}
      </p>
    </main>
  );
}