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
  university: string;
  accountUrl: string;
  score: number;
  penalty: number;
  solved: number;
  streak: number;
  lastSubmission: string | null;
};

export type StandingsPayload = {
  updatedAt: string;
  summary: {
    liveParticipants: number;
    universities: number;
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

  return {
    rank: 0,
    team: team.name,
    university: team.bracket_name ?? "Independent",
    accountUrl: team.account_url,
    score: team.score,
    penalty: Math.max(0, solved * 5), // Backend does not expose penalties, so approximate via solve count.
    solved,
    streak: solved,
    lastSubmission: sortedSolves[0]?.date ?? null,
  };
}

export function buildSummaryFromEntries(entries: StandingEntry[]): StandingsPayload["summary"] {
  const totalSolves = entries.reduce((acc, entry) => acc + entry.solved, 0);
  const universities = new Set(entries.map((entry) => entry.university)).size;
  const solveRate = entries.length === 0 ? 0 : Math.min(100, Math.round((totalSolves / (entries.length * 10)) * 100));

  return {
    liveParticipants: entries.length,
    universities,
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

export function buildUniversityMatrix(entries: StandingEntry[]) {
  return entries.reduce<Record<string, { teams: number; cumulativeScore: number }>>(
    (acc, entry) => {
      if (!acc[entry.university]) {
        acc[entry.university] = { teams: 0, cumulativeScore: 0 };
      }

      acc[entry.university].teams += 1;
      acc[entry.university].cumulativeScore += entry.score;
      return acc;
    },
    {}
  );
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
