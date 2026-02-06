"use client";

import clsx from "clsx";
import { Search } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export type ViewMode = "overall" | "streaks";

interface FilterControlsProps {
  viewMode: ViewMode;
  setViewMode: Dispatch<SetStateAction<ViewMode>>;
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

const tabs: { label: string; value: ViewMode; detail: string }[] = [
  { label: "Overall", value: "overall", detail: "Live standings" },
  { label: "Momentum", value: "streaks", detail: "Solve streaks" },
];

export default function FilterControls(props: FilterControlsProps) {
  const {
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
  } = props;

  return (
    <section className="relative z-10 mt-14 flex w-full flex-col gap-5 rounded-3xl border border-[#2d2011] bg-black/40 p-6 shadow-aurora backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between" data-gradient-border>
      <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.35em] text-[#b0894d]">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setViewMode(tab.value)}
            className={clsx(
              "rounded-full px-5 py-3 transition-all",
              viewMode === tab.value
                ? "bg-gradient-to-r from-[#5a3b16] via-[#c1904b] to-[#6d461c] text-coal"
                : "bg-white/5 text-dusk-100/80 hover:bg-white/10"
            )}
          >
            <span className="block font-semibold leading-tight">{tab.label}</span>
            <span className="text-[0.6rem] font-normal normal-case tracking-[0.2em] text-dusk-100/70">
              {tab.detail}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center lg:justify-end">
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dusk-100/70" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search team"
            className="w-full rounded-full border border-[#2d2011] bg-coal/70 py-3 pl-11 pr-4 text-sm text-dusk-50 placeholder:text-dusk-100/60 focus:border-ember/60 focus:outline-none"
          />
        </label>
      </div>
    </section>
  );
}
