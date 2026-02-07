export type RemoteSolve = {
  challenge: string;
  points: number;
  rank: number;
  time?: string;
};

export type RemoteLeaderboardEntry = {
  team: string;
  total_score: number;
  solve_count: number;
  solves: RemoteSolve[];
  rank: number;
};

export type RemoteStandingsResponse = {
  status: string;
  generated_at?: string;
  leaderboard: RemoteLeaderboardEntry[];
};

export type StandingEntry = {
  rank: number;
  team: string;
  accountUrl: string;
  score: number;
  solved: number;
  streak: number;
  lastSubmission: string | null;
  scoreTimeline: { timestamp: string; score: number }[];
  solves: RemoteSolve[];
  signatureSolve: RemoteSolve | null;
};

export type StandingsPayload = {
  updatedAt: string;
  summary: {
    liveParticipants: number;
    submissions: number;
    solveRate: number;
  };
  spotlight: {
    fastestSolveTeam: string;
    highlightMessage: string;
  };
  entries: StandingEntry[];
};

const MAX_VISIBLE_TEAMS = 10;
const SYNTHETIC_SOLVE_GAP_MS = 90_000;

export function normalizeLeaderboardPayload(payload: RemoteStandingsResponse | null | undefined): StandingsPayload {
  if (!payload || payload.status?.toLowerCase() !== "success" || !Array.isArray(payload.leaderboard)) {
    return {
      updatedAt: new Date().toISOString(),
      summary: buildSummaryFromEntries([]),
      spotlight: buildSpotlightFromEntries([]),
      entries: [],
    };
  }

  const entries = payload.leaderboard
    .filter((row) => typeof row.team === "string")
    .map((row) => mapRemoteRowToEntry(row, payload.generated_at))
    .sort((a, b) => a.rank - b.rank || b.score - a.score)
    .slice(0, MAX_VISIBLE_TEAMS)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return {
    updatedAt: payload.generated_at ?? new Date().toISOString(),
    summary: buildSummaryFromEntries(entries),
    spotlight: buildSpotlightFromEntries(entries),
    entries,
  };
}

export function mapRemoteRowToEntry(row: RemoteLeaderboardEntry, generatedAt?: string): StandingEntry {
  const sanitizedSolves = Array.isArray(row.solves)
    ? row.solves
        .filter((solve) => typeof solve.challenge === "string")
        .map((solve) => ({
          challenge: solve.challenge,
          points: Number.isFinite(Number(solve.points)) ? Number(solve.points) : 0,
          rank: Number.isFinite(Number(solve.rank)) ? Number(solve.rank) : 0,
          time: typeof solve.time === "string" ? solve.time : undefined,
        }))
    : [];
  const scoreTimeline = buildTimelineFromSolves(sanitizedSolves, generatedAt);
  const lastPoint = scoreTimeline[scoreTimeline.length - 1];
  const lastSubmission = lastPoint?.timestamp ?? generatedAt ?? null;
  const signatureSolve = sanitizedSolves.reduce<RemoteSolve | null>((best, solve) => {
    if (!best || solve.points > best.points) {
      return solve;
    }
    return best;
  }, null);

  return {
    rank: Number.isFinite(Number(row.rank)) ? Number(row.rank) : 0,
    team: row.team,
    accountUrl: "",
    score: Number.isFinite(Number(row.total_score)) ? Number(row.total_score) : 0,
    solved: Number.isFinite(Number(row.solve_count)) ? Number(row.solve_count) : sanitizedSolves.length,
    streak: sanitizedSolves.length,
    lastSubmission,
    scoreTimeline,
    solves: sanitizedSolves,
    signatureSolve,
  };
}

function buildTimelineFromSolves(solves: RemoteSolve[], generatedAt?: string) {
  if (!solves.length) {
    return [];
  }

  const solvesWithIndex = solves.map((solve, index) => ({ solve, index }));
  solvesWithIndex.sort((a, b) => {
    const timeA = Date.parse(a.solve.time ?? "");
    const timeB = Date.parse(b.solve.time ?? "");
    const aValid = Number.isNaN(timeA) ? 0 : 1;
    const bValid = Number.isNaN(timeB) ? 0 : 1;
    if (aValid && bValid) {
      return timeA - timeB;
    }
    if (aValid) {
      return -1;
    }
    if (bValid) {
      return 1;
    }
    return a.index - b.index;
  });

  const reference = Date.parse(generatedAt ?? new Date().toISOString());
  const fallbackAnchor = Number.isNaN(reference)
    ? Date.now() - SYNTHETIC_SOLVE_GAP_MS * (solvesWithIndex.length - 1)
    : reference - SYNTHETIC_SOLVE_GAP_MS * (solvesWithIndex.length - 1);

  let rollingScore = 0;
  return solvesWithIndex.map(({ solve }, position) => {
    const parsed = Date.parse(solve.time ?? "");
    const timestampMs = Number.isNaN(parsed) ? fallbackAnchor + position * SYNTHETIC_SOLVE_GAP_MS : parsed;
    rollingScore += solve.points ?? 0;
    return { timestamp: new Date(timestampMs).toISOString(), score: rollingScore };
  });
}

export function buildSummaryFromEntries(entries: StandingEntry[]): StandingsPayload["summary"] {
  const totalSolves = entries.reduce((acc, entry) => acc + entry.solved, 0);
  const solveRate = entries.length === 0 ? 0 : Math.min(100, Math.round((totalSolves / (entries.length * 10)) * 100));

  return {
    liveParticipants: entries.length,
    submissions: totalSolves,
    solveRate: Number.isFinite(solveRate) ? solveRate : 0,
  };
}

export function buildSpotlightFromEntries(entries: StandingEntry[]): StandingsPayload["spotlight"] {
  if (entries.length === 0) {
    return {
      fastestSolveTeam: "",
      highlightMessage: "Awaiting live standings...",
    };
  }

  const latestSolve = entries.reduce((latest, entry) => {
    if (!entry.lastSubmission) {
      return latest;
    }

    if (!latest.lastSubmission) {
      return entry;
    }

    return Date.parse(entry.lastSubmission) > Date.parse(latest.lastSubmission) ? entry : latest;
  }, entries[0]);

  return {
    fastestSolveTeam: latestSolve.team,
    highlightMessage: latestSolve.lastSubmission
      ? `Latest solve synced at ${new Date(latestSolve.lastSubmission).toLocaleTimeString()}`
      : "Solves streaming in...",
  };
}

export function summarizeStreaks(entries: StandingEntry[]) {
  return entries.reduce(
    (acc, entry) => {
      if (entry.streak > acc.longest) {
        acc.longest = entry.streak;
        acc.team = entry.team;
      }
      acc.total += entry.streak;
      return acc;
    },
    { longest: 0, total: 0, team: "" }
  );
}
