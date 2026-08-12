"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
import { globalSearch, type SearchResult } from "./search-api";

const groups = [
  { key: "students", label: "Students" },
  { key: "courses", label: "Courses" },
  { key: "batches", label: "Batches" },
] as const;

type SearchGroupKey = (typeof groups)[number]["key"];

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query.trim(), 250);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const search = useQuery({
    queryKey: ["global-search", debounced],
    queryFn: () => globalSearch(debounced),
    enabled: debounced.length >= 2,
    staleTime: 60_000,
  });

  const flattened = useMemo(() => {
    if (!search.data) return [];
    return groups.flatMap((group) => search.data[group.key].map((item) => ({ ...item, group: group.key, groupLabel: group.label })));
  }, [search.data]);

  const hasResults = flattened.length > 0;
  const showEmpty = debounced.length >= 2 && !search.isLoading && !hasResults;

  function choose(item: SearchResult) {
    setOpen(false);
    setQuery("");
    router.push(item.href);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }

    if (!open || !hasResults) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => Math.min(current + 1, flattened.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => Math.max(current - 1, 0));
    }

    if (event.key === "Enter") {
      event.preventDefault();
      choose(flattened[activeIndex]);
    }
  }

  return (
    <div ref={boxRef} className="relative hidden w-[min(32rem,42vw)] md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        className="h-10 bg-slate-50 pl-9"
        placeholder="Search students, courses, batches"
        value={query}
        onChange={(event) => { setQuery(event.target.value); setOpen(true); setActiveIndex(0); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        aria-label="Global search"
      />
      {open && query.trim().length > 0 ? (
        <div className="absolute left-0 right-0 top-12 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {query.trim().length < 2 ? <div className="p-4 text-sm text-slate-500">Type at least 2 characters.</div> : null}
          {search.isLoading ? <div className="flex items-center gap-2 p-4 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Searching...</div> : null}
          {showEmpty ? <div className="p-4 text-sm text-slate-500">No results found.</div> : null}
          {hasResults ? <SearchResults data={search.data!} activeHref={flattened[activeIndex]?.href} onChoose={choose} /> : null}
        </div>
      ) : null}
    </div>
  );
}

function SearchResults({ data, activeHref, onChoose }: { data: Record<SearchGroupKey, SearchResult[]>; activeHref?: string; onChoose: (item: SearchResult) => void }) {
  return (
    <div className="max-h-[28rem] overflow-y-auto p-2">
      {groups.map((group) => data[group.key].length ? (
        <div key={group.key} className="py-2">
          <p className="px-2 pb-2 text-xs font-semibold uppercase text-slate-400">{group.label}</p>
          <div className="space-y-1">
            {data[group.key].map((item) => (
              <button
                key={`${group.key}-${item.id}`}
                className={cn("w-full rounded-lg px-3 py-2 text-left transition hover:bg-slate-100", activeHref === item.href && "bg-slate-100")}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onChoose(item)}
              >
                <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null)}
    </div>
  );
}
