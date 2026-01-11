export type StandingEntry = {
  rank: number;
  team: string;
  university: string;
  avatar?: string;
  members: string[];
  score: number;
  penalty: number;
  solved: number;
  streak: number;
  lastSubmission: string;
  badge?: "mythic" | "legend" | "guardian";
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
