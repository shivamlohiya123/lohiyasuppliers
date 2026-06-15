import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const inquiry = await prisma.inquiry.create({ data });
    return NextResponse.json(inquiry);
  } catch {
    return NextResponse.json({ error: "Failed to create inquiry" }, { status: 500 });
  }
}
