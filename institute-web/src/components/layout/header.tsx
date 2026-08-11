import { Bell, Menu, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <p className="text-sm font-semibold text-slate-950">Good evening</p>
          <p className="text-xs text-slate-500">Ready for today&apos;s institute work.</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon">
          <UserRound className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
