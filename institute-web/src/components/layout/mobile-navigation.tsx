import { BookOpen, Home, Receipt, Settings, Users } from "lucide-react";

const items = [
  { label: "Home", icon: Home },
  { label: "Students", icon: Users },
  { label: "Courses", icon: BookOpen },
  { label: "Fees", icon: Receipt },
  { label: "More", icon: Settings },
];

export function MobileNavigation() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-5 border-t border-slate-200 bg-white lg:hidden">
      {items.map((item) => (
        <button key={item.label} className="flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-slate-500 first:text-slate-950">
          <item.icon className="h-5 w-5" />
          {item.label}
        </button>
      ))}
    </nav>
  );
}
