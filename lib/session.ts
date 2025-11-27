import { getServerSession } from "next-auth/next";
import { authOptions } from "@/src/app/api/auth/[...nextauth]/route";

export const getSession = async () => {
  return await getServerSession(authOptions);
};