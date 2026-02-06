import type { StandingsPayload } from "@/lib/standings";

interface StatsBarProps {
  summary: StandingsPayload["summary"];
  spotlight: StandingsPayload["spotlight"];
}

const statConfig = [
  { key: "liveParticipants", label: "Active Warriors" },
  { key: "submissions", label: "Scrolls Submitted" },
  { key: "solveRate", label: "Solve Rate" },
] as const;

export default function StatsBar({ summary, spotlight }: StatsBarProps) {
  return (
    <section className="relative z-10 mx-auto mt-10 w-full max-w-6xl rounded-3xl border border-[#2d2011] bg-black/30 px-6 py-6 shadow-aurora backdrop-blur-2xl sm:px-10 sm:py-8" data-gradient-border>
      <div className="grid gap-6 md:grid-cols-[3fr_2fr]">
        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-3">
          {statConfig.map((stat) => (
            <div key={stat.key} className="rounded-2xl bg-white/5 px-3 py-4 text-dusk-100">
              <p className="text-[0.75rem] uppercase tracking-[0.35em] text-[#b0894d]">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-dusk-50">
                {stat.key === "solveRate"
                  ? `${summary[stat.key]}%`
                  : summary[stat.key].toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#24170b] via-[#1b1209] to-[#100904] p-5 text-left shadow-inner">
          <p className="text-xs uppercase tracking-[0.4em] text-[#b0894d]">Spotlight</p>
          <h3 className="mt-2 text-xl font-serifDisplay text-ember">
            {spotlight.fastestSolveTeam}
          </h3>
          <p className="text-sm text-dusk-200">{spotlight.highlightMessage}</p>
        </div>
      </div>
    </section>
  );
}
