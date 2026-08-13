import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertBell } from "@/features/alerts/alert-bell";
import { GlobalSearch } from "@/features/search/global-search";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">Institute Suite</p>
          <p className="hidden text-xs text-slate-500 sm:block">Ready for today&apos;s institute work.</p>
        </div>
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <GlobalSearch />
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
        <AlertBell />
        <UserMenu />
      </div>
    </header>
  );
}
