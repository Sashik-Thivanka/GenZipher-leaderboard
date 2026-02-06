"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import FilterControls, { ViewMode } from "./filter-controls";
import Podium from "./podium";
import LeaderboardTable from "./leaderboard-table";
import { StandingEntry } from "@/lib/standings";
import { summarizeStreaks } from "@/lib/standings";
import Button from "@/components/ui/button";

interface LeaderboardShellProps {
  entries: StandingEntry[];
  updatedAt: string;
}

export default function LeaderboardShell({ entries, updatedAt }: LeaderboardShellProps) {
  const [clientEntries, setClientEntries] = useState(entries);
  const [lastSyncedAt, setLastSyncedAt] = useState(updatedAt);
  const [viewMode, setViewMode] = useState<ViewMode>("overall");
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();
  const autoRefreshTimer = useRef<NodeJS.Timeout | null>(null);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return clientEntries.filter((entry) => {
      if (term.length === 0) {
        return true;
      }
      return entry.team.toLowerCase().includes(term);
    });
  }, [clientEntries, searchTerm]);

  const displayEntries = useMemo(() => {
    if (viewMode === "overall") {
      return filtered;
    }

    if (viewMode === "streaks") {
      return [...filtered]
        .sort((a, b) => b.streak - a.streak || a.rank - b.rank)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
    }

    return filtered;
  }, [filtered, viewMode]);

  const streakSummary = useMemo(() => summarizeStreaks(clientEntries), [clientEntries]);

  const lastSyncedDisplay = useMemo(() => {
    const parsed = new Date(lastSyncedAt);
    if (Number.isNaN(parsed.getTime())) {
      return "--";
    }
    const time = parsed.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    return `${time} | ${date}`;
  }, [lastSyncedAt]);

  const fetchStandings = async () => {
    const response = await fetch("/api/standings", { cache: "no-store" });
    const payload = await response.json();
    const nextEntries = (payload.entries as StandingEntry[]).slice(0, 10);
    setClientEntries(nextEntries);
    setLastSyncedAt(payload.updatedAt ?? new Date().toISOString());
  };

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        await fetchStandings();
      } catch (error) {
        console.error("Failed to refresh standings", error);
      }
    });
  };

  useEffect(() => {
    autoRefreshTimer.current = setInterval(() => {
      fetchStandings().catch((error) => console.error("Auto-refresh failed", error));
    }, 10000);

    return () => {
      if (autoRefreshTimer.current) {
        clearInterval(autoRefreshTimer.current);
      }
    };
  }, []);

  return (
    <div className="relative z-10 mx-auto w-full max-w-[120rem]">
      <FilterControls
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-[#2d2011] bg-black/40 p-6 text-sm text-dusk-100 shadow-aurora backdrop-blur-xl lg:flex-row" data-gradient-border>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.35em] text-[#b0894d]">Data pulse</p>
          <p className="mt-2 text-lg font-serifDisplay text-dusk-50">Last synced</p>
          <p className="text-sm">{lastSyncedDisplay}</p>
        </div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.35em] text-[#b0894d]">Longest streak</p>
          <p className="mt-2 text-lg font-serifDisplay text-dusk-50">{streakSummary.team || "TBD"}</p>
          <p className="text-sm">{streakSummary.longest} consecutive solves</p>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Button className="w-full justify-center" glowing={false} onClick={handleRefresh} disabled={isPending}>
            {isPending ? "Refreshing..." : "Refresh feed"}
          </Button>
        </div>
      </div>

      <Podium entries={displayEntries.slice(0, 3)} />
      <LeaderboardTable entries={displayEntries} />
    </div>
  );
}
