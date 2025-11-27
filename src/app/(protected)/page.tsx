import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login"); 
  }

  return (
    <main
      style={{display: "flex",flexDirection: "column",justifyContent: "center",alignItems: "center",height: "90vh",textAlign: "center"}}>
      <h1 style={{ fontSize: "3.5rem", marginBottom: "0.5rem" }}>
        Bienvenido {session.user?.name}
      </h1>
      <p style={{ fontSize: "1.25rem" }}>Rol: {session.user?.role}</p>
    </main>
  );
}