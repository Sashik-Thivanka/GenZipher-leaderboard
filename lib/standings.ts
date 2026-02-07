export type BackendSolve = {
  challenge_id: number;
  account_id: number;
  team_id: number;
  user_id: number;
  value: number;
  date: string;
};

export type BackendTeam = {
  id: number;
  account_url: string;
  name: string;
  score: number;
  bracket_id: number | null;
  bracket_name: string | null;
  solves: BackendSolve[];
};

export type BackendStandingsResponse = {
  success: boolean;
  data: Record<string, BackendTeam>;
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

export function normalizeBackendPayload(payload: BackendStandingsResponse): StandingsPayload {
  if (!payload?.success || !payload.data) {
    return {
      updatedAt: new Date().toISOString(),
      summary: buildSummaryFromEntries([]),
      spotlight: buildSpotlightFromEntries([]),
      entries: [],
    };
  }

  const entries = Object.values(payload.data)
    .map(mapBackendTeamToEntry)
    .sort((a, b) => {
      if (b.score === a.score) {
        return (b.lastSubmission ?? "").localeCompare(a.lastSubmission ?? "");
      }
      return b.score - a.score;
    })
    .slice(0, MAX_VISIBLE_TEAMS)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return {
    updatedAt: new Date().toISOString(),
    summary: buildSummaryFromEntries(entries),
    spotlight: buildSpotlightFromEntries(entries),
    entries,
  };
}

export function mapBackendTeamToEntry(team: BackendTeam): StandingEntry {
  const sortedSolves = [...team.solves].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const solved = team.solves.length;
  const chronologicalSolves = [...team.solves].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  const scoreTimeline = chronologicalSolves.reduce<{ timestamp: string; score: number }[]>(
    (acc, solve) => {
      const nextScore = (acc[acc.length - 1]?.score ?? 0) + solve.value;
      acc.push({ timestamp: solve.date, score: nextScore });
      return acc;
    },
    []
  );

  return {
    rank: 0,
    team: team.name,
    accountUrl: team.account_url,
    score: team.score,
    solved,
    streak: solved,
    lastSubmission: sortedSolves[0]?.date ?? null,
    scoreTimeline,
  };
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
