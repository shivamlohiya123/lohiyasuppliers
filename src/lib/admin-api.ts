import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";

export async function requireAdminApi() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return { authorized: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { authorized: true as const, session };
}
