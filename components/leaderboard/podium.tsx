"use client";

import { StandingEntry } from "@/lib/standings";
import { motion } from "framer-motion";
import Image from "next/image";
import clsx from "clsx";

interface PodiumProps {
  entries: StandingEntry[];
}

const tiers = [
  {
    rank: 1,
    pedestal: "h-[320px]",
    gradient: "from-[#f8e1b0] via-[#c58b3b] to-[#6b3b12]",
    trophy: "/assets/awards/gold.png",
  },
  {
    rank: 2,
    pedestal: "h-[260px]",
    gradient: "from-[#e4d8c6] via-[#a58d79] to-[#615750]",
    trophy: "/assets/awards/silver.png",
  },
  {
    rank: 3,
    pedestal: "h-[220px]",
    gradient: "from-[#d8b796] via-[#8d6034] to-[#41230f]",
    trophy: "/assets/awards/bronze.png",
  },
];

export default function Podium({ entries }: PodiumProps) {
  const podium = tiers
    .map((tier) => ({ tier, entry: entries.find((item) => item.rank === tier.rank) }))
    .filter((item) => item.entry);

  return (
    <section className="relative z-10 mt-16 w-full rounded-[40px] border border-[#2d2011] bg-gradient-to-b from-[#160d06] via-[#0c0704] to-[#080502] p-10 shadow-aurora backdrop-blur-2xl" data-gradient-border>
      <div className="grid gap-6 md:grid-cols-3">
        {podium.map(({ tier, entry }) => (
          <motion.div
            key={tier.rank}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: tier.rank * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={clsx(
              "relative flex flex-col items-center justify-end rounded-[36px] border border-white/5 bg-white/5 px-6 pt-8 text-center",
              tier.rank === 1 && "md:-translate-y-6"
            )}
          >
            <p className="text-xs uppercase tracking-[0.45em] text-[#b0894d]">Rank {entry!.rank}</p>
            <h3 className="mt-2 font-serifDisplay text-2xl text-dusk-50">{entry!.team}</h3>
            <p className="text-sm text-dusk-100">{entry!.university}</p>

            <div className="relative mt-4 flex h-48 w-full items-center justify-center">
              <Image
                src={tier.trophy}
                alt={`${entry!.team} trophy`}
                fill
                sizes="(min-width: 1024px) 20vw, 60vw"
                className="object-contain"
                priority={tier.rank === 1}
              />
            </div>

            <div className={clsx("mt-6 w-full rounded-3xl bg-gradient-to-b p-4", tier.gradient)}>
              <p className="text-sm uppercase tracking-[0.35em] text-coal/80">Score</p>
              <p className="text-4xl font-serifDisplay text-coal">{entry!.score}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-coal/80">
                <span>Penalty {entry!.penalty}</span>
                <span>Solves {entry!.solved}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
