"use client";

import { Search } from "lucide-react";
import { useState, useEffect, type RefObject } from "react";

export function SearchInput({
  inputRef,
  onSubmit,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  onSubmit: (query: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [shortcutHint, setShortcutHint] = useState<"Ctrl K" | "\u2318 K">("Ctrl K");

  useEffect(() => {
    const platform = navigator.platform ?? navigator.userAgent ?? "";
    if (/Mac|iPhone|iPad|iPod/i.test(platform)) {
      setShortcutHint("\u2318 K");
    }
  }, []);

  return (
    <form
      className="w-full max-w-xl"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = query.trim();
        if (trimmed) onSubmit(trimmed);
      }}
      role="search"
    >
      <div className="group relative transition-all duration-200 hover:shadow-[0_0_18px_rgba(0,220,229,0.05)]">
        <Search
          aria-hidden="true"
          className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-500 group-focus-within:text-[#00DCE5] ${isFocused ? "text-primary-fixed" : "text-on-surface-variant/40"}`}
          size={15}
        />
        <input
          aria-label="Search transactions and categories"
          className={`h-10 w-full rounded-xl border border-white/[0.07] bg-white/[0.035] pl-10 pr-16 text-sm font-medium text-on-surface shadow-inner shadow-black/10 backdrop-blur-md transition-all duration-200 placeholder:text-on-surface-variant/45 hover:border-[#00DCE5]/25 hover:bg-white/[0.05] focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none ${
            isFocused
              ? "border-[#00DCE5]/40 bg-white/[0.06] ring-2 ring-[#00DCE5]/15"
              : ""
          }`}
          onBlur={() => setIsFocused(false)}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search transactions..."
          ref={inputRef}
          type="search"
          value={query}
        />
        <kbd
          aria-hidden="true"
          className={`pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border px-1.5 py-0.5 font-manrope text-[10px] font-medium transition-colors duration-200 sm:flex ${
            isFocused
              ? "border-[#00DCE5]/30 bg-[#00DCE5]/10 text-[#00DCE5]"
              : "border-white/[0.08] bg-black/10 text-on-surface-variant/55"
          }`}
        >
          {shortcutHint}
        </kbd>
      </div>
    </form>
  );
}
