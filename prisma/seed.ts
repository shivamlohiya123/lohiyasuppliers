import { PrismaClient, Role, CategoryType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEFAULT_PLATFORM_SETTINGS, PRODUCT_LEVEL_VARIATION_ID } from "../src/lib/constants";
import { rupeesToPaise } from "../src/lib/money";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding B2B abrasives platform...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const clientPassword = await bcrypt.hash("client123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@lohiyasuppliers.com" },
    update: { role: Role.ADMIN, isActive: true },
    create: {
      email: "admin@lohiyasuppliers.com",
      name: "Platform Admin",
      password: adminPassword,
      role: Role.ADMIN,
      phone: "+91 98765 43210",
    },
  });

  const clientA = await prisma.user.upsert({
    where: { email: "client@example.com" },
    update: { role: Role.CLIENT, isActive: true },
    create: {
      email: "client@example.com",
      name: "Rajesh Kumar",
      password: clientPassword,
      role: Role.CLIENT,
      phone: "+91 91234 56789",
      clientProfile: {
        create: {
          company: "Kumar Woodworks Pvt Ltd",
          gstin: "27AABCU9603R1ZM",
          billingState: "Maharashtra",
          address: "Plot 42, MIDC Industrial Area",
          city: "Nagpur",
          pincode: "440016",
        },
      },
    },
  });

  const clientB = await prisma.user.upsert({
    where: { email: "metalworks@example.com" },
    update: { role: Role.CLIENT, isActive: true },
    create: {
      email: "metalworks@example.com",
      name: "Amit Sharma",
      password: clientPassword,
      role: Role.CLIENT,
      phone: "+91 99887 76655",
      clientProfile: {
        create: {
          company: "Sharma Metal Industries",
          gstin: "09AAECS1234F1Z5",
          billingState: "Uttar Pradesh",
          address: "Sector 12, Industrial Estate",
          city: "Ghaziabad",
          pincode: "201001",
        },
      },
    },
  });

  // Ensure client profiles exist for upserted users
  for (const user of [clientA, clientB]) {
    await prisma.clientProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        company: user.email === "client@example.com" ? "Kumar Woodworks Pvt Ltd" : "Sharma Metal Industries",
        billingState: user.email === "client@example.com" ? "Maharashtra" : "Uttar Pradesh",
      },
    });
  }

  for (const [key, value] of Object.entries(DEFAULT_PLATFORM_SETTINGS)) {
    await prisma.platformSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // Sample catalog (Module 2 preview — BLEED with sizes)
  const abrasives = await prisma.category.upsert({
    where: { slug: "abrasives" },
    update: {},
    create: {
      name: "Abrasives",
      slug: "abrasives",
      type: CategoryType.PRODUCT,
      description: "Cutting and grinding wheels",
      sortOrder: 1,
    },
  });

  const repair = await prisma.category.upsert({
    where: { slug: "book-repair" },
    update: {},
    create: {
      name: "Book Repair Services",
      slug: "book-repair",
      type: CategoryType.SERVICE,
      description: "Expert bookbinding equipment repair",
      sortOrder: 2,
    },
  });

  const bleed = await prisma.product.upsert({
    where: { slug: "bleed-cutting-wheel" },
    update: {},
    create: {
      name: "BLEED Cutting Wheel",
      slug: "bleed-cutting-wheel",
      description: "Premium bleed cutting wheel for wood and metal applications.",
      hsnCode: "6804",
      gstRateBps: 1800,
      defaultPricePaise: rupeesToPaise(450),
      images: "[]",
      categoryId: abrasives.id,
    },
  });

  const sizes = ["4 inch", "5 inch", "7 inch"];
  for (const size of sizes) {
    const sku = `BLEED-${size.replace(/\s/g, "").toUpperCase()}`;
    await prisma.productVariation.upsert({
      where: { sku },
      update: {},
      create: {
        productId: bleed.id,
        sku,
        attributes: { size },
        defaultPricePaise: rupeesToPaise(450 + sizes.indexOf(size) * 50),
      },
    });
  }

  await prisma.product.upsert({
    where: { slug: "book-spine-repair" },
    update: {},
    create: {
      name: "Book Spine Repair",
      slug: "book-spine-repair",
      description: "Professional book spine repair service.",
      hsnCode: "9987",
      gstRateBps: 1800,
      defaultPricePaise: rupeesToPaise(2500),
      images: "[]",
      categoryId: repair.id,
    },
  });

  // Per-client price override example (client A gets custom BLEED 5" price)
  const variation5 = await prisma.productVariation.findFirst({
    where: { sku: "BLEED-5INCH" },
  });
  if (variation5) {
    await prisma.clientPriceOverride.upsert({
      where: {
        clientId_productId_variationId: {
          clientId: clientA.id,
          productId: bleed.id,
          variationId: variation5.id,
        },
      },
      update: { pricePaise: rupeesToPaise(399) },
      create: {
        clientId: clientA.id,
        productId: bleed.id,
        variationId: variation5.id,
        pricePaise: rupeesToPaise(399),
      },
    });
  }

  await prisma.clientPriceOverride.upsert({
    where: {
      clientId_productId_variationId: {
        clientId: clientA.id,
        productId: bleed.id,
        variationId: PRODUCT_LEVEL_VARIATION_ID,
      },
    },
    update: { pricePaise: rupeesToPaise(420) },
    create: {
      clientId: clientA.id,
      productId: bleed.id,
      variationId: PRODUCT_LEVEL_VARIATION_ID,
      pricePaise: rupeesToPaise(420),
    },
  });

  console.log("✅ Seed completed!");
  console.log(`   Admin:  admin@lohiyasuppliers.com / admin123`);
  console.log(`   Client: client@example.com / client123`);
  console.log(`   Client: metalworks@example.com / client123`);
  console.log(`   Categories: ${abrasives.name}, ${repair.name}`);
  console.log(`   Sample product: BLEED with ${sizes.length} size variations`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
