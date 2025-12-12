import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connect } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        Usuario: { label: "Usuario", type: "text" },
        Clave: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
      
        let conn;
        try {
          conn = await connect();
        } catch (err) {
          // Error de conexion bd
          throw new Error("server");
        }
      
        const [usuarios] = await conn.query<any[]>(
          "SELECT * FROM usuario_sistema WHERE Usuario = ?",
          [credentials.Usuario]
        );
        await conn.end();
      
        const user = usuarios[0];
      
        if (!user || user.Clave !== credentials.Clave) throw new Error("invalid");
        if (user.Estado !== "Activo") throw new Error("blocked");
      
        return {
          id: user.Id.toString(),
          name: user.Usuario,
          role: user.Rol,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        role: token.role as string,
      };
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
