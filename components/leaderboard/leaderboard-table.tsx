"use client";

import { StandingEntry } from "@/lib/standings";
import clsx from "clsx";
import { ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";

interface LeaderboardTableProps {
  entries: StandingEntry[];
}

type SortKey = "rank" | "score" | "penalty" | "solved";

export default function LeaderboardTable({ entries }: LeaderboardTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    const copy = [...entries];
    copy.sort((a, b) => {
      const first = a[sortKey];
      const second = b[sortKey];
      if (first === second) return 0;
      return direction === "asc" ? (first > second ? 1 : -1) : first > second ? -1 : 1;
    });
    return copy;
  }, [entries, sortKey, direction]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection(key === "rank" ? "asc" : "desc");
    }
  };

  return (
    <div className="relative z-10 mt-8 w-full overflow-hidden rounded-[32px] border border-[#2d2011] bg-black/40 shadow-aurora backdrop-blur-xl" data-gradient-border>
      <div className="max-h-[540px] overflow-y-auto scroll-shadow">
        <table className="min-w-full divide-y divide-white/5 text-base">
          <thead className="sticky top-0 z-10 bg-[#120b05]/95 text-sm uppercase tracking-[0.35em] text-dusk-100/80">
            <tr>
              <th className="px-6 py-4 text-left">
                <button onClick={() => toggleSort("rank")} className="flex items-center gap-2">
                  Rank
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">Team</th>
              <th className="px-6 py-4 text-left">University</th>
              <th className="px-6 py-4 text-left">
                <button onClick={() => toggleSort("score")} className="flex items-center gap-2">
                  Score
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button onClick={() => toggleSort("solved")} className="flex items-center gap-2">
                  Solved
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">
                <button onClick={() => toggleSort("penalty")} className="flex items-center gap-2">
                  Penalty
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-6 py-4 text-left">Last Submission</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sorted.map((entry) => (
              <tr
                key={entry.rank}
                className={clsx(
                  "transition-all hover:bg-white/5",
                  entry.rank <= 3 && "bg-gradient-to-r from-white/5 via-transparent to-transparent"
                )}
              >
                <td className="px-6 py-4 font-semibold text-dusk-50">#{entry.rank}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-[#302010] to-[#0c0704] text-lg font-semibold text-ember"
                    >
                      {entry.team
                        .split(" ")
                        .map((word) => word[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-dusk-50">{entry.team}</p>
                      <p className="text-sm uppercase tracking-[0.35em] text-dusk-100/70">
                        {entry.members.join(" · ")}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-dusk-100">{entry.university}</td>
                <td className="px-6 py-4 font-semibold text-ember">{entry.score}</td>
                <td className="px-6 py-4 text-dusk-50">{entry.solved}</td>
                <td className="px-6 py-4 text-dusk-100">{entry.penalty}</td>
                <td className="px-6 py-4 text-dusk-100/80">{entry.lastSubmission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
