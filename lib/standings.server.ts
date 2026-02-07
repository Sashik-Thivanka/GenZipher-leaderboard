import { cache } from "react";
import { promises as fs } from "fs";
import path from "path";
import type { RemoteStandingsResponse, StandingsPayload } from "@/lib/standings";
import { normalizeLeaderboardPayload } from "@/lib/standings";

const REMOTE_STANDINGS_URL =
  "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLgXKeVi-GyaTvMkzv_ZczYNDYMeEF25Ndab6xuAjOIgiQ3v62ZOqechMNoEOwyZQrSQES9u9DPKZfK5uvRXqWRfTG0pnCjzD6lXJfz6geKQd6eV95kWriRpNGPfp0uOC1Eg9lGOm_H13_5hU1VUiDk5gCbEoGn-eP-_xZ_CK1boYV4-XwAN-fLkXKgpqynZ1aD4PBkg1Kk-bh7IzlZZTdbPBO7qjs6wWGINb-9RU4SZxrn94hF2xsyBcv_WNWmJg-c0QlCG8XGxvYuKT0XMgqV_-I7_nAnT5GG0QPbu&lib=MfOfIzhJX6UV5xcjXXdaFzCkUgUTjP2Dq";

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
    parsed.entries = parsed.entries
      .slice(0, 10)
      .map((entry) => ({
        ...entry,
        solves: entry.solves ?? [],
        signatureSolve: entry.signatureSolve ?? null,
        scoreTimeline: entry.scoreTimeline ?? [],
      }));
    return parsed;
  } catch (error) {
    console.warn("Unable to read standings.json. Returning fallback payload.", error);
    return fallbackPayload;
  }
}

async function fetchRemoteStandings(): Promise<StandingsPayload | null> {
  const endpoint = process.env.STANDINGS_API_URL ?? REMOTE_STANDINGS_URL;
  if (!endpoint) {
    return null;
  }

  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch standings: ${response.status}`);
  }

  const payload = (await response.json()) as RemoteStandingsResponse;
  return normalizeLeaderboardPayload(payload);
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
