import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Lohiya Suppliers database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const customerPassword = await bcrypt.hash("customer123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@lohiyasuppliers.com" },
    update: {},
    create: {
      email: "admin@lohiyasuppliers.com",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
      phone: "+91 98765 43210",
      company: "Lohiya Suppliers",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {
      companyId: "KW-2019-4521",
      address: "Plot 42, MIDC Industrial Area",
      city: "Nagpur",
      state: "Maharashtra",
      country: "India",
      pincode: "440016",
      profileComplete: true,
    },
    create: {
      email: "customer@example.com",
      name: "Rajesh Kumar",
      password: customerPassword,
      role: "CUSTOMER",
      phone: "+91 91234 56789",
      company: "Kumar Woodworks Pvt Ltd",
      companyId: "KW-2019-4521",
      address: "Plot 42, MIDC Industrial Area",
      city: "Nagpur",
      state: "Maharashtra",
      country: "India",
      pincode: "440016",
      gstNumber: "27AABCU9603R1ZM",
      profileComplete: true,
    },
  });

  const categories = [
    {
      name: "Metal Application Products",
      slug: "metal-application-products",
      description: "High-performance abrasives and tools for metalwork. Achieve strong, precise results in every cut, grind, and finish.",
      industry: "METAL",
      icon: "⚙️",
      sortOrder: 1,
    },
    {
      name: "Wood Application Products",
      slug: "wood-application-products",
      description: "High-quality abrasives and tools for woodworking. Excellent results in shaping, sanding, and polishing.",
      industry: "WOOD",
      icon: "🪵",
      sortOrder: 2,
    },
    {
      name: "Book Repair Services",
      slug: "book-repair-services",
      description: "Expert repair services for bookbinding equipment including bandsaws. Keep your tools sharp and production seamless.",
      industry: "SERVICES",
      icon: "🔧",
      sortOrder: 3,
    },
    {
      name: "Cutting Wheels",
      slug: "cutting-wheels",
      description: "Precision cutting wheels designed for durability and superior results across industries.",
      industry: "METAL",
      icon: "💿",
      sortOrder: 4,
    },
    {
      name: "Grinding Wheels",
      slug: "grinding-wheels",
      description: "Superior grinding wheels for metal and wood applications.",
      industry: "METAL",
      icon: "⭕",
      sortOrder: 5,
    },
    {
      name: "Flap Discs",
      slug: "flap-discs",
      description: "Versatile flap discs for finishing, deburring, and surface preparation.",
      industry: "METAL",
      icon: "🔄",
      sortOrder: 6,
    },
  ];

  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    createdCategories[cat.slug] = created.id;
  }

  const products = [
    {
      name: "OWJ Grinder Disc",
      slug: "owj-grinder-disc",
      description: "Premium OWJ Grinder Disc engineered for precision cutting and grinding. Ideal for metal fabrication, welding prep, and general industrial grinding. Features reinforced fiberglass mesh for safety and extended life.",
      shortDesc: "Precision cutting & grinding disc for industrial use",
      sku: "LS-MET-001",
      price: 21,
      comparePrice: 25,
      costPrice: 12,
      stock: 500,
      categorySlug: "metal-application-products",
      isFeatured: true,
      specifications: JSON.stringify({
        diameter: "4 inch (100mm)",
        thickness: "3mm",
        arbor: "16mm",
        maxRPM: "13300",
        material: "Aluminum Oxide",
        application: "Metal grinding, deburring",
      }),
      tags: JSON.stringify(["grinder", "metal", "abrasive", "featured"]),
    },
    {
      name: "Premium Flap Disc 80 Grit",
      slug: "premium-flap-disc-80-grit",
      description: "High-performance flap disc with 80 grit aluminum oxide abrasive. Perfect for blending welds, deburring, and surface finishing on stainless steel and mild steel.",
      shortDesc: "80 grit flap disc for metal finishing",
      sku: "LS-FD-002",
      price: 145,
      comparePrice: 180,
      costPrice: 85,
      stock: 300,
      categorySlug: "flap-discs",
      isFeatured: true,
      specifications: JSON.stringify({
        diameter: "4 inch",
        grit: "80",
        type: "Type 27",
        material: "Zirconia Alumina",
      }),
      tags: JSON.stringify(["flap-disc", "finishing", "metal"]),
    },
    {
      name: "Industrial Cutting Wheel 14 inch",
      slug: "industrial-cutting-wheel-14",
      description: "Heavy-duty 14-inch cutting wheel for industrial metal cutting applications. Reinforced design for safe, fast cuts through steel, iron, and non-ferrous metals.",
      shortDesc: "14\" heavy-duty metal cutting wheel",
      sku: "LS-CW-003",
      price: 320,
      comparePrice: 380,
      costPrice: 195,
      stock: 150,
      categorySlug: "cutting-wheels",
      isFeatured: true,
      specifications: JSON.stringify({
        diameter: "14 inch (355mm)",
        thickness: "2.5mm",
        arbor: "25.4mm",
        maxRPM: "4400",
      }),
      tags: JSON.stringify(["cutting-wheel", "industrial", "metal"]),
    },
    {
      name: "Wood Sanding Belt 100 Grit",
      slug: "wood-sanding-belt-100-grit",
      description: "Premium aluminum oxide sanding belt for woodworking. Provides consistent finish on hardwood, softwood, and plywood surfaces.",
      shortDesc: "100 grit sanding belt for wood applications",
      sku: "LS-WD-004",
      price: 89,
      comparePrice: 110,
      costPrice: 52,
      stock: 400,
      categorySlug: "wood-application-products",
      isFeatured: false,
      specifications: JSON.stringify({
        width: "4 inch",
        length: "36 inch",
        grit: "100",
        backing: "Cloth",
      }),
      tags: JSON.stringify(["sanding", "wood", "belt"]),
    },
    {
      name: "Diamond Grinding Wheel",
      slug: "diamond-grinding-wheel",
      description: "Professional diamond grinding wheel for precision sharpening and grinding of carbide tools and hard materials.",
      shortDesc: "Diamond wheel for carbide tool grinding",
      sku: "LS-GW-005",
      price: 1250,
      comparePrice: 1500,
      costPrice: 780,
      stock: 75,
      categorySlug: "grinding-wheels",
      isFeatured: true,
      specifications: JSON.stringify({
        diameter: "6 inch",
        grit: "120",
        bond: "Resin",
        application: "Carbide, ceramics",
      }),
      tags: JSON.stringify(["diamond", "grinding", "precision"]),
    },
    {
      name: "Wood Polishing Disc Set",
      slug: "wood-polishing-disc-set",
      description: "Complete set of polishing discs for wood finishing. Includes coarse to fine grit discs for a mirror-smooth finish on furniture and cabinetry.",
      shortDesc: "5-piece wood polishing disc set",
      sku: "LS-WD-006",
      price: 450,
      comparePrice: 550,
      costPrice: 275,
      stock: 200,
      categorySlug: "wood-application-products",
      isFeatured: false,
      specifications: JSON.stringify({
        pieces: "5",
        grits: "60, 80, 120, 180, 240",
        diameter: "5 inch",
      }),
      tags: JSON.stringify(["polishing", "wood", "set"]),
    },
    {
      name: "Bandsaw Blade Repair Service",
      slug: "bandsaw-blade-repair-service",
      description: "Professional bandsaw blade repair and sharpening service for bookbinding and woodworking equipment. Expert technicians with 20+ years experience.",
      shortDesc: "Expert bandsaw repair & sharpening",
      sku: "LS-SRV-007",
      price: 850,
      comparePrice: null,
      costPrice: 400,
      stock: 999,
      categorySlug: "book-repair-services",
      isFeatured: false,
      specifications: JSON.stringify({
        serviceType: "Repair & Sharpening",
        turnaround: "3-5 business days",
        warranty: "30 days",
      }),
      tags: JSON.stringify(["repair", "bandsaw", "service"]),
    },
    {
      name: "Stainless Steel Cutting Disc",
      slug: "stainless-steel-cutting-disc",
      description: "Specialized cutting disc formulated for stainless steel and INOX applications. Reduced burr formation and extended wheel life.",
      shortDesc: "INOX-rated stainless steel cutting disc",
      sku: "LS-CW-008",
      price: 35,
      comparePrice: 42,
      costPrice: 18,
      stock: 600,
      categorySlug: "cutting-wheels",
      isFeatured: false,
      specifications: JSON.stringify({
        diameter: "4 inch",
        thickness: "1mm",
        type: "INOX",
        maxRPM: "15300",
      }),
      tags: JSON.stringify(["stainless", "cutting", "inox"]),
    },
    {
      name: "Depressed Center Grinding Wheel 4 inch",
      slug: "depressed-center-grinding-wheel-4",
      description: "Type 27 depressed center grinding wheel for aggressive stock removal on steel and cast iron. Reinforced for safety at high RPM.",
      shortDesc: "4\" Type 27 grinding wheel for metal",
      sku: "LS-GW-009",
      price: 48,
      comparePrice: 58,
      costPrice: 28,
      stock: 350,
      categorySlug: "grinding-wheels",
      isFeatured: false,
      specifications: JSON.stringify({ diameter: "4 inch", type: "Type 27", grit: "24", maxRPM: "13300" }),
      tags: JSON.stringify(["grinding", "metal", "type-27"]),
    },
    {
      name: "Zirconia Flap Disc 120 Grit",
      slug: "zirconia-flap-disc-120-grit",
      description: "Premium zirconia flap disc for stainless steel and high-alloy metals. Long life and consistent finish on weld seams.",
      shortDesc: "120 grit zirconia flap disc",
      sku: "LS-FD-010",
      price: 165,
      comparePrice: 195,
      costPrice: 95,
      stock: 220,
      categorySlug: "flap-discs",
      isFeatured: true,
      specifications: JSON.stringify({ diameter: "4 inch", grit: "120", material: "Zirconia" }),
      tags: JSON.stringify(["flap-disc", "zirconia", "stainless"]),
    },
    {
      name: "Wood Sanding Disc 80 Grit Hook & Loop",
      slug: "wood-sanding-disc-80-grit",
      description: "Hook and loop sanding disc for random orbital sanders. Ideal for wood surface preparation before finishing.",
      shortDesc: "80 grit hook & loop sanding disc",
      sku: "LS-WD-011",
      price: 55,
      comparePrice: 68,
      costPrice: 32,
      stock: 480,
      categorySlug: "wood-application-products",
      isFeatured: false,
      specifications: JSON.stringify({ diameter: "5 inch", grit: "80", attachment: "Hook & Loop" }),
      tags: JSON.stringify(["sanding", "wood", "disc"]),
    },
    {
      name: "Cutting Wheel 7 inch Metal",
      slug: "cutting-wheel-7-inch-metal",
      description: "7-inch reinforced cutting wheel for medium-duty metal cutting. Compatible with standard angle grinders.",
      shortDesc: "7\" metal cutting wheel",
      sku: "LS-CW-012",
      price: 78,
      comparePrice: 95,
      costPrice: 45,
      stock: 280,
      categorySlug: "cutting-wheels",
      isFeatured: false,
      specifications: JSON.stringify({ diameter: "7 inch", thickness: "1.6mm", arbor: "22.23mm" }),
      tags: JSON.stringify(["cutting-wheel", "7-inch", "metal"]),
    },
    {
      name: "Bookbinding Bandsaw Maintenance Package",
      slug: "bookbinding-bandsaw-maintenance",
      description: "Complete bandsaw maintenance package for bookbinding units. Includes blade sharpening, tension adjustment check, and wheel alignment inspection.",
      shortDesc: "Full bandsaw maintenance for bookbinding",
      sku: "LS-SRV-013",
      price: 1500,
      comparePrice: null,
      costPrice: 750,
      stock: 999,
      categorySlug: "book-repair-services",
      isFeatured: true,
      specifications: JSON.stringify({ serviceType: "Full Maintenance", turnaround: "5-7 days", includes: "Sharpening, alignment, inspection" }),
      tags: JSON.stringify(["repair", "bandsaw", "bookbinding", "service"]),
    },
    {
      name: "Wire Brush Cup Wheel 3 inch",
      slug: "wire-brush-cup-wheel-3",
      description: "Crimped wire cup brush for rust removal, paint stripping, and surface cleaning on metal and wood.",
      shortDesc: "3\" wire cup brush for surface prep",
      sku: "LS-MET-014",
      price: 95,
      comparePrice: 115,
      costPrice: 55,
      stock: 190,
      categorySlug: "metal-application-products",
      isFeatured: false,
      specifications: JSON.stringify({ diameter: "3 inch", wireType: "Crimped", arbor: "M10" }),
      tags: JSON.stringify(["wire-brush", "cleaning", "metal"]),
    },
  ];

  for (const product of products) {
    const { categorySlug, ...data } = product;
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...data, categoryId: createdCategories[categorySlug] },
      create: { ...data, categoryId: createdCategories[categorySlug] },
    });
  }

  await prisma.banner.deleteMany();
  for (const banner of [
    {
      title: "Precision Cutting & Grinding Solutions",
      subtitle: "Quality abrasives for every industry — metal, wood, and beyond",
      position: "HERO",
      sortOrder: 1,
      link: "/products",
    },
    {
      title: "Wooden Industry Solutions",
      subtitle: "High-quality abrasives for shaping, sanding, and polishing",
      position: "INDUSTRY",
      sortOrder: 1,
      link: "/categories/wood-application-products",
    },
    {
      title: "Metal Industry Power Tools",
      subtitle: "Strong, precise results in every cut, grind, and finish",
      position: "INDUSTRY",
      sortOrder: 2,
      link: "/categories/metal-application-products",
    },
  ]) {
    await prisma.banner.create({ data: banner });
  }

  for (const coupon of [
      {
        code: "WELCOME10",
        description: "10% off on first order",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrder: 500,
        maxUses: 100,
      },
      {
        code: "BULK500",
        description: "₹500 off on orders above ₹5000",
        discountType: "FIXED",
        discountValue: 500,
        minOrder: 5000,
        maxUses: 50,
      },
  ]) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    });
  }

  const settings = [
    { key: "site_name", value: "Lohiya Suppliers" },
    { key: "site_tagline", value: "Supplying top-grade abrasives to meet the demands of the wooden and metal industries" },
    { key: "contact_email", value: "info@lohiyasuppliers.com" },
    { key: "contact_phone", value: "+91 98765 43210" },
    { key: "contact_address", value: "Industrial Area, Phase II, India" },
    { key: "gst_number", value: "27AABCL1234A1Z5" },
    { key: "shipping_flat_rate", value: "99" },
    { key: "free_shipping_threshold", value: "2000" },
    { key: "tax_rate", value: "18" },
    { key: "currency", value: "INR" },
    { key: "currency_symbol", value: "₹" },
    { key: "business_hours", value: "Mon-Sat: 9AM - 6PM" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  await prisma.order.upsert({
    where: { orderNumber: "LS-2026-0001" },
    update: {},
    create: {
      orderNumber: "LS-2026-0001",
      userId: customer.id,
      status: "DELIVERED",
      paymentStatus: "PAID",
      paymentMethod: "UPI",
      subtotal: 166,
      tax: 29.88,
      shipping: 0,
      total: 195.88,
      shippingAddress: JSON.stringify({
        fullName: "Rajesh Kumar",
        phone: "+91 91234 56789",
        address: "45 Industrial Estate, Andheri East",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400069",
      }),
      items: {
        create: [
          {
            productId: (await prisma.product.findUnique({ where: { slug: "owj-grinder-disc" } }))!.id,
            quantity: 2,
            price: 21,
            total: 42,
          },
          {
            productId: (await prisma.product.findUnique({ where: { slug: "premium-flap-disc-80-grit" } }))!.id,
            quantity: 1,
            price: 145,
            total: 145,
          },
        ],
      },
    },
  });

  await prisma.inquiry.deleteMany();
  await prisma.inquiry.createMany({
    data: [
      {
        name: "Amit Sharma",
        email: "amit@steelworks.in",
        phone: "+91 99887 76655",
        company: "Sharma Steel Works",
        subject: "Bulk Order Inquiry - Cutting Wheels",
        message: "We need 500 units of 14-inch cutting wheels monthly. Please share bulk pricing.",
        type: "BULK_ORDER",
        status: "NEW",
      },
      {
        name: "Priya Mehta",
        email: "priya@woodcraft.com",
        phone: "+91 98765 12345",
        company: "Mehta Woodcraft",
        subject: "Bandsaw Repair Service",
        message: "Need bandsaw blade repair for our bookbinding unit. 3 blades need sharpening.",
        type: "REPAIR",
        status: "IN_PROGRESS",
      },
      {
        name: "Vikram Patel",
        email: "vikram@furnitureworks.com",
        phone: "+91 98123 45678",
        company: "Patel Furniture Works",
        subject: "Wood Sanding Products Quote",
        message: "Looking for bulk supply of sanding belts and polishing discs for our furniture manufacturing unit.",
        type: "QUOTE",
        status: "NEW",
      },
      {
        name: "Sunita Rao",
        email: "sunita@printbind.in",
        phone: "+91 97654 32109",
        company: "Rao Print & Bind",
        subject: "Book Repair - Urgent",
        message: "Our bandsaw blade broke mid-production. Need emergency repair service.",
        type: "REPAIR",
        status: "NEW",
      },
    ],
  });

  const owjProduct = await prisma.product.findUnique({ where: { slug: "owj-grinder-disc" } });
  if (owjProduct) {
    await prisma.review.deleteMany({ where: { productId: owjProduct.id } });
    await prisma.review.createMany({
      data: [
        { productId: owjProduct.id, userId: customer.id, rating: 5, comment: "Excellent quality grinder disc. Long lasting for our metal workshop.", isApproved: true },
        { productId: owjProduct.id, userId: customer.id, rating: 4, comment: "Good value at ₹21. Fast delivery.", isApproved: true },
      ],
    });
  }

  await prisma.subscriber.deleteMany();
  await prisma.subscriber.createMany({
    data: [
      { email: "amit@steelworks.in" },
      { email: "vikram@furnitureworks.com" },
    ],
  });

  const pageSections = [
    {
      key: "why_choose_us",
      title: "Why Choose Lohiya Suppliers",
      subtitle: "Trusted by industries across India for premium abrasives and B2B service",
      sortOrder: 1,
      content: JSON.stringify([
        { title: "Premium Quality", text: "Top-grade abrasives sourced for metal and wood industries with strict quality control." },
        { title: "B2B Pricing", text: "Competitive bulk pricing for manufacturers, workshops, and industrial buyers." },
        { title: "Wide Range", text: "Cutting wheels, grinding discs, flap discs, sanding products, and repair services." },
        { title: "Expert Support", text: "Dedicated team for bulk orders, technical queries, and repair service coordination." },
        { title: "Fast Delivery", text: "Reliable shipping across India with worldwide delivery for bulk orders." },
        { title: "GST Invoicing", text: "Full GST-compliant invoicing for registered business accounts." },
      ]),
    },
    {
      key: "testimonials",
      title: "What Our Clients Say",
      subtitle: "Trusted by metal and wood industry professionals",
      sortOrder: 2,
      content: JSON.stringify([
        { author: "Rajesh Kumar", company: "Kumar Woodworks Pvt Ltd", text: "OWJ Grinder Discs are excellent quality. We've been ordering bulk supplies for over a year." },
        { author: "Amit Sharma", company: "Sharma Steel Works", text: "Best cutting wheels at competitive B2B prices. Fast delivery and reliable GST invoicing." },
        { author: "Priya Mehta", company: "Mehta Woodcraft", text: "Their bandsaw repair service saved our production line. Highly professional and quick turnaround." },
      ]),
    },
    {
      key: "faq",
      title: "Frequently Asked Questions",
      subtitle: "Common questions about ordering, shipping, and our products",
      sortOrder: 3,
      content: JSON.stringify([
        { question: "Do you offer bulk/B2B pricing?", answer: "Yes! We offer competitive bulk pricing for registered B2B accounts. Contact us with your requirements for a custom quote." },
        { question: "What payment methods do you accept?", answer: "We accept UPI, bank transfer, COD (for approved accounts), and credit/debit cards." },
        { question: "Do you provide GST invoices?", answer: "Yes, all orders include GST-compliant invoices. Register with your GST number for B2B accounts." },
        { question: "What is your shipping policy?", answer: "Free shipping on orders above ₹2,000. Standard shipping ₹99. Worldwide shipping available for bulk orders." },
        { question: "Do you offer repair services?", answer: "Yes, we specialize in bandsaw blade repair and sharpening for bookbinding and woodworking equipment." },
      ]),
    },
  ];

  for (const section of pageSections) {
    await prisma.pageSection.upsert({
      where: { key: section.key },
      update: section,
      create: section,
    });
  }

  await prisma.activityLog.deleteMany();
  await prisma.activityLog.createMany({
    data: [
      { action: "CREATED", entity: "Product", details: "Initial product catalog seeded" },
      { action: "UPDATED", entity: "Setting", details: "Store settings configured" },
      { action: "CREATED", entity: "Order", details: "Sample orders imported" },
      { action: "APPROVED", entity: "Review", details: "Customer reviews seeded" },
    ],
  });

  console.log("✅ Seed completed!");
  console.log("   Admin: admin@lohiyasuppliers.com / admin123");
  console.log("   Customer: customer@example.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
