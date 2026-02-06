import { NextResponse } from "next/server";
import { getStandings } from "@/lib/standings.server";

function toCsvRow(values: (string | number | null)[]) {
  return values
    .map((value) => {
      if (value === null || value === undefined) {
        return "";
      }
      const cell = String(value).replace(/"/g, '""');
      return /[",\n]/.test(cell) ? `"${cell}"` : cell;
    })
    .join(",");
}

export async function GET() {
  const standings = await getStandings();
  const header = ["Rank", "Team", "Score", "Solved", "Last Submission", "Team URL"];
  const rows = standings.entries.map((entry) =>
    toCsvRow([
      entry.rank,
      entry.team,
      entry.score,
      entry.solved,
      entry.lastSubmission,
      entry.accountUrl,
    ])
  );

  const csv = [toCsvRow(header), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=genzipher-leaderboard-top10.csv",
      "Cache-Control": "no-store",
    },
  });
}
