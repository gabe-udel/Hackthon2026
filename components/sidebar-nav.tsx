"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard" },
  { href: "/inventory", label: "My Pantry" },
  { href: "/recipes", label: "AI Recipes" },
  { href: "/sustainability", label: "Sustainability", icon: <Leaf className="w-4 h-4 text-green-500" /> },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1 flex-1">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`p-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${
              isActive
                ? "bg-green-100 text-green-800 font-semibold"
                : "text-slate-700 hover:bg-green-50"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
