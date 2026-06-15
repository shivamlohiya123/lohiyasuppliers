"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User, Package, FileText, Settings, MessageSquare, ShoppingBag, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/account", label: "Overview", icon: User },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/invoices", label: "Proforma Invoices", icon: FileText },
  { href: "/account/profile", label: "Company Profile", icon: Building2 },
  { href: "/products", label: "Shop Products", icon: ShoppingBag },
  { href: "/contact?type=BULK_ORDER", label: "Bulk Quote", icon: MessageSquare },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-white rounded-xl border p-4 h-fit">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/account" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
