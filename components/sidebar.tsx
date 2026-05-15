"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, MessageSquare, Layers, User, BookOpen, Target } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/pairmentor", icon: MessageSquare, label: "PairMentor" },
  { href: "/weakness-hunter", icon: Target, label: "Weakness Hunter" },
  { href: "/tech-stacks", icon: Layers, label: "Tech Stacks" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-sidebar-background flex flex-col h-screen fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b">
        <BookOpen className="h-6 w-6 text-primary mr-2" />
        <span className="font-bold text-lg text-foreground tracking-tight">MentorForge</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground font-medium shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            pathname === "/profile"
              ? "bg-primary text-primary-foreground font-medium shadow-sm"
              : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <User className="h-5 w-5" />
          <span>Profile</span>
        </Link>
      </div>
    </aside>
  );
}
