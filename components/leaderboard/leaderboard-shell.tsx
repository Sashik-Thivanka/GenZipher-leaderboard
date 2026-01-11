"use client";

import { useMemo, useState, useTransition } from "react";
import FilterControls, { ViewMode } from "./filter-controls";
import Podium from "./podium";
import LeaderboardTable from "./leaderboard-table";
import { StandingEntry } from "@/lib/standings";
import { buildUniversityMatrix, summarizeStreaks } from "@/lib/standings";
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
  const [activeUniversity, setActiveUniversity] = useState("all");
  const [isPending, startTransition] = useTransition();

  const universities = useMemo(
    () => Array.from(new Set(clientEntries.map((entry) => entry.university))).sort(),
    [clientEntries]
  );

  const filtered = useMemo(() => {
    return clientEntries.filter((entry) => {
      const matchesUniversity =
        activeUniversity === "all" || entry.university === activeUniversity;
      const matchesSearch =
        searchTerm.trim().length === 0 ||
        entry.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.members.some((member) => member.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesUniversity && matchesSearch;
    });
  }, [clientEntries, activeUniversity, searchTerm]);

  const displayEntries = useMemo(() => {
    if (viewMode === "overall") {
      return filtered;
    }

    if (viewMode === "streaks") {
      return [...filtered]
        .sort((a, b) => b.streak - a.streak || a.rank - b.rank)
        .map((entry, index) => ({ ...entry, rank: index + 1 }));
    }

    const matrix = buildUniversityMatrix(
      activeUniversity === "all"
        ? filtered
        : filtered.filter((entry) => entry.university === activeUniversity)
    );

    const grouped = Object.entries(matrix).map(([university, stats]) => {
      const score = Math.round(stats.cumulativeScore / stats.teams);
      return {
        rank: 0,
        team: university,
        university: "Guild composite",
        members: [`${stats.teams} teams`],
        score,
        penalty: stats.teams * 5,
        solved: Math.max(1, Math.round(score / 130)),
        streak: stats.teams,
        lastSubmission: "Averaged",
      } satisfies StandingEntry;
    });

    return grouped
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [filtered, viewMode, activeUniversity]);

  const streakSummary = useMemo(() => summarizeStreaks(clientEntries), [clientEntries]);

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        const response = await fetch("/api/standings", { cache: "no-store" });
        const payload = await response.json();
        setClientEntries(payload.entries as StandingEntry[]);
        setLastSyncedAt(payload.updatedAt ?? new Date().toISOString());
      } catch (error) {
        console.error("Failed to refresh standings", error);
      }
    });
  };

  return (
    <div className="relative z-10 mx-auto w-full max-w-[120rem]">
      <FilterControls
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeUniversity={activeUniversity}
        setActiveUniversity={setActiveUniversity}
        universityOptions={universities}
      />

      <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-[#2d2011] bg-black/40 p-6 text-sm text-dusk-100 shadow-aurora backdrop-blur-xl lg:flex-row" data-gradient-border>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.35em] text-[#b0894d]">Data pulse</p>
          <p className="mt-2 text-lg font-serifDisplay text-dusk-50">Last synced</p>
          <p className="text-sm">{new Date(lastSyncedAt).toLocaleString()}</p>
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
          <p className="text-xs uppercase tracking-[0.35em] text-dusk-100/70">Pulls latest JSON</p>
        </div>
      </div>

      <Podium entries={displayEntries.slice(0, 3)} />
      <LeaderboardTable entries={displayEntries} />
    </div>
  );
}
