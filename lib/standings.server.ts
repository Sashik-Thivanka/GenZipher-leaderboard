import { cache } from "react";
import { promises as fs } from "fs";
import path from "path";
import type { BackendStandingsResponse, StandingsPayload } from "@/lib/standings";
import { normalizeBackendPayload } from "@/lib/standings";

const fallbackPayload: StandingsPayload = {
  updatedAt: new Date().toISOString(),
  summary: {
    liveParticipants: 0,
    submissions: 0,
    solveRate: 0,
  },
  spotlight: {
    fastestSolveTeam: "",
    highlightMessage: "Leaderboard data is warming up...",
  },
  entries: [],
};

async function readFallbackFromDisk(): Promise<StandingsPayload> {
  const filePath = path.join(process.cwd(), "data", "standings.json");

  try {
    const file = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(file) as StandingsPayload;
    parsed.entries.sort((a, b) => a.rank - b.rank);
    parsed.entries = parsed.entries.slice(0, 10);
    return parsed;
  } catch (error) {
    console.warn("Unable to read standings.json. Returning fallback payload.", error);
    return fallbackPayload;
  }
}

async function fetchRemoteStandings(): Promise<StandingsPayload | null> {
  const endpoint = process.env.STANDINGS_API_URL;
  if (!endpoint) {
    return null;
  }

  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch standings: ${response.status}`);
  }

  const payload = (await response.json()) as BackendStandingsResponse;
  return normalizeBackendPayload(payload);
}

export const getStandings = cache(async (): Promise<StandingsPayload> => {
  try {
    const remote = await fetchRemoteStandings();
    if (remote) {
      return remote;
    }
  } catch (error) {
    console.error("Remote standings fetch failed. Falling back to disk payload.", error);
  }

  return readFallbackFromDisk();
});
