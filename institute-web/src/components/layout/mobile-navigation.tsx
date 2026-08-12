import { BookOpen, Home, Receipt, Settings, Users } from "lucide-react";
import Link from "next/link";

const items = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Students", icon: Users, href: "/students" },
  { label: "Courses", icon: BookOpen, href: "/courses" },
  { label: "Fees", icon: Receipt, href: "/fees" },
  { label: "More", icon: Settings, href: "/settings/institute-profile" },
];

export function MobileNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t border-slate-200 bg-white lg:hidden">
      {items.map((item) => (
        <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-500 first:text-slate-950">
          <item.icon className="h-5 w-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
