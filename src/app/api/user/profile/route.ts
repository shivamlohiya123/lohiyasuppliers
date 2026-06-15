import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const required = ["company", "companyId", "phone", "address", "city", "state", "country", "pincode", "gstNumber"];

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  for (const field of required) {
    if (!data[field]?.trim()) {
      return NextResponse.json({ error: `${field} is required` }, { status: 400 });
    }
  }

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      company: data.company.trim(),
      companyId: data.companyId.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      city: data.city.trim(),
      state: data.state.trim(),
      country: data.country.trim(),
      pincode: data.pincode.trim(),
      gstNumber: data.gstNumber.trim(),
      profileComplete: true,
    },
  });

  const { password: _, ...safe } = user;
  return NextResponse.json(safe);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as { id: string }).id },
    select: {
      id: true, name: true, email: true, phone: true, company: true, companyId: true,
      address: true, city: true, state: true, country: true, pincode: true,
      gstNumber: true, profileComplete: true, role: true,
    },
  });

  return NextResponse.json(user);
}
