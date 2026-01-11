import BackgroundMesh from "@/components/layout/background-mesh";
import LeaderboardShell from "@/components/leaderboard/leaderboard-shell";
import StatsBar from "@/components/leaderboard/stats-bar";
import Button from "@/components/ui/button";
import { getStandings } from "@/lib/standings.server";

export default async function Home() {
  const standings = await getStandings();

  return (
    <main className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <BackgroundMesh />
      <section className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-[#b0894d]">GenZipher 2026</p>
        <h1 className="mt-4 font-serifDisplay text-4xl text-dusk-50 sm:text-6xl">
          The Hall of Cipher Champions
        </h1>
        <p className="mt-4 max-w-3xl text-sm text-dusk-100 sm:text-base">
          Track the live momentum of every guild daring to dismantle the oracle. Crafted to echo the
          mythic gravitas of the flagship hackathon, this leaderboard blends ritualistic typography,
          molten gold accents, and cinematic lighting to keep the stakes unmistakably high.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button>Observe live</Button>
          <Button className="bg-[#120a05] text-dusk-50" glowing={false}>
            Export results
          </Button>
        </div>
      </section>

      <StatsBar summary={standings.summary} spotlight={standings.spotlight} />
      <LeaderboardShell entries={standings.entries} updatedAt={standings.updatedAt} />
    </main>
  );
}
