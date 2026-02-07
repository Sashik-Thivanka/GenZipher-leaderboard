"use client";

import { StandingEntry } from "@/lib/standings";
import { useMemo } from "react";

interface ScoreTrendChartProps {
  entries: StandingEntry[];
}

export default function ScoreTrendChart({ entries }: ScoreTrendChartProps) {
  const chartData = useMemo(() => {
    const palette = ["#f87070", "#ffd166", "#9cdbff", "#f7aef8", "#70e4a9", "#c77dff", "#ff7eb9", "#fadb5f", "#72d6c9", "#ff9f68"];

    const prepared = entries
      .map((entry, index) => ({
        entry,
        color: palette[index % palette.length],
        timeline: entry.scoreTimeline ?? [],
      }))
      .filter((item) => item.timeline.length > 0);

    if (!prepared.length) {
      return null;
    }

    const allPoints = prepared.flatMap((item) => item.timeline.map((point) => ({
      timestamp: Date.parse(point.timestamp),
      score: point.score,
    })));

    const minTimestamp = Math.min(...allPoints.map((point) => point.timestamp));
    const maxTimestamp = Math.max(...allPoints.map((point) => point.timestamp));
    const maxScore = Math.max(...allPoints.map((point) => point.score), 1);
    const scoreUpperBound = Math.max(Math.ceil(maxScore / 50) * 50, 50);
    const timeRange = Math.max(maxTimestamp - minTimestamp, 1);

    const series = prepared.map((item) => {
      const normalizedPoints = item.timeline.map((point) => {
        const timeOffset = Date.parse(point.timestamp) - minTimestamp;
        const x = (timeOffset / timeRange) * 100;
        const y = 92 - (point.score / scoreUpperBound) * 80;
        return { x, y, raw: point };
      });

      if (normalizedPoints.length === 1) {
        normalizedPoints.unshift({ x: 0, y: normalizedPoints[0].y, raw: normalizedPoints[0].raw });
      }

      return {
        color: item.color,
        entry: item.entry,
        normalizedPoints,
        path: normalizedPoints.map((point) => `${point.x},${point.y}`).join(" "),
      };
    });

    const scoreTicks = Array.from({ length: 5 }, (_, index) => {
      const value = (scoreUpperBound / 4) * index;
      const y = 92 - (value / scoreUpperBound) * 80;
      return { value, y };
    });

    const timeTicks = Array.from({ length: 4 }, (_, index) => {
      const ratio = index / 3;
      const timestamp = minTimestamp + ratio * timeRange;
      return { label: new Date(timestamp), x: ratio * 100 };
    });

    return {
      series,
      scoreTicks,
      timeTicks,
      scoreUpperBound,
    };
  }, [entries]);

  if (!chartData) {
    return (
      <section
        className="relative z-10 mt-8 rounded-[32px] border border-[#2d2011] bg-black/40 p-6 text-sm text-dusk-100 shadow-aurora backdrop-blur-xl"
        data-gradient-border
      >
        <p className="text-xs uppercase tracking-[0.35em] text-[#b0894d]">Trend outlook</p>
        <p className="mt-2 font-serifDisplay text-2xl text-dusk-50">Awaiting live data</p>
        <p className="mt-3 text-dusk-100/80">The moment standings populate, the progress lines for each guild will render here.</p>
      </section>
    );
  }

  return (
    <section
      className="relative z-10 mt-8 overflow-hidden rounded-[36px] border border-[#2d2011] bg-black/40 p-6 text-sm text-dusk-100 shadow-aurora backdrop-blur-xl sm:p-8 lg:p-10"
      data-gradient-border
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-[#b0894d]">Progression field</p>
          <p className="mt-1 font-serifDisplay text-3xl text-dusk-50 sm:text-4xl">Hackathon score delta</p>
        </div>
        <p className="max-w-2xl text-base text-dusk-100/80">
          Every team broadcasts its cumulative score across the event timeline, mirroring the multi-line telemetry style you see in CTFd.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[5fr,1.2fr] xl:grid-cols-[6fr,1.2fr]">
        <div className="relative isolate overflow-hidden rounded-[32px] border border-white/5 bg-gradient-to-b from-white/10 via-transparent to-transparent p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-7">
          <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 20% 20%, rgba(255,214,153,0.12), transparent 55%)" }} />
          <svg viewBox="0 0 100 100" className="h-[24rem] w-full md:h-[28rem] lg:h-[32rem]" role="img" aria-label="Score progression lines by team">
            {chartData.scoreTicks.map((tick) => (
              <g key={tick.value}>
                <line x1={0} y1={tick.y} x2={100} y2={tick.y} stroke="rgba(255,255,255,0.09)" strokeWidth={0.35} />
                <text x={2} y={tick.y - 1} className="fill-white/45 text-[3px]" alignmentBaseline="middle">
                  {tick.value.toLocaleString()}
                </text>
              </g>
            ))}

            {chartData.timeTicks.map((tick) => (
              <g key={tick.x}>
                <line x1={tick.x} y1={12} x2={tick.x} y2={92} stroke="rgba(255,255,255,0.05)" strokeWidth={0.35} />
                <text x={tick.x} y={96} textAnchor="middle" className="fill-white/55 text-[3px]">
                  {tick.label.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </text>
              </g>
            ))}

            {chartData.series.map((track) => (
              <g key={track.entry.team}>
                <polyline
                  points={track.path}
                  fill="none"
                  stroke={track.color}
                  strokeWidth={1.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_6px_16px_rgba(0,0,0,0.55)]"
                />
                {track.normalizedPoints.map((point, index) => (
                  <circle key={`${track.entry.team}-${index}`} cx={point.x} cy={point.y} r={1.5} fill="#0a0603" stroke={track.color} strokeWidth={0.45} />
                ))}
              </g>
            ))}
          </svg>
        </div>

        <div className="rounded-[28px] border border-white/5 bg-[#0c0704]/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
          <p className="text-xs uppercase tracking-[0.35em] text-[#f4d3a4]/80">Legend</p>
          <ul className="mt-4 space-y-3">
            {chartData.series.map((track) => (
              <li key={track.entry.team} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: track.color }} />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-dusk-100/70">#{track.entry.rank}</p>
                    <p className="text-base font-semibold text-dusk-50">{track.entry.team}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-dusk-100/60">Score</p>
                  <p className="text-lg font-semibold text-ember">{track.entry.score.toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-dusk-100/70">
            Each point equals a registered solve from the API feed, so rapid bursts and stalls remain obvious when you compare guilds side-by-side.
          </p>
        </div>
      </div>
    </section>
  );
}
