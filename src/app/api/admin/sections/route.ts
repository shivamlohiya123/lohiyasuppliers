import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;
  const sections = await prisma.pageSection.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json(sections);
}

export async function POST(req: Request) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;
  const data = await req.json();
  const section = await prisma.pageSection.create({ data });
  return NextResponse.json(section);
}
