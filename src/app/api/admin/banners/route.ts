import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;
  const data = await req.json();
  const banner = await prisma.banner.create({ data });
  return NextResponse.json(banner);
}
