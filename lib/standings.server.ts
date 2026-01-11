import { cache } from "react";
import { promises as fs } from "fs";
import path from "path";
import type { StandingsPayload } from "@/lib/standings";

const fallbackPayload: StandingsPayload = {
  updatedAt: new Date().toISOString(),
  summary: {
    liveParticipants: 0,
    universities: 0,
    submissions: 0,
    solveRate: 0,
  },
  spotlight: {
    fastestSolveTeam: "",
    highlightMessage: "Leaderboard data is warming up...",
  },
  entries: [],
};

export const getStandings = cache(async (): Promise<StandingsPayload> => {
  const filePath = path.join(process.cwd(), "data", "standings.json");

  try {
    const file = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(file) as StandingsPayload;
    parsed.entries.sort((a, b) => a.rank - b.rank);
    return parsed;
  } catch (error) {
    console.warn("Unable to read standings.json. Returning fallback payload.", error);
    return fallbackPayload;
  }
});
