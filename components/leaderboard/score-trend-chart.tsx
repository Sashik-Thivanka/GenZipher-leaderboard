"use client";

import { StandingEntry } from "@/lib/standings";
import { useMemo, useState } from "react";

interface ScoreTrendChartProps {
  entries: StandingEntry[];
}

export default function ScoreTrendChart({ entries }: ScoreTrendChartProps) {
  const [hoveredTrack, setHoveredTrack] = useState<{ team: string; color: string } | null>(null);
  const VIEWBOX_WIDTH = 160;
  const VIEWBOX_HEIGHT = 90;
  const CHART_LEFT = 6;
  const CHART_RIGHT = VIEWBOX_WIDTH - 4;
  const CHART_TOP = 10;
  const CHART_BOTTOM = VIEWBOX_HEIGHT - 8;
  const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP;
  const CHART_WIDTH = CHART_RIGHT - CHART_LEFT;

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
        const x = CHART_LEFT + (timeOffset / timeRange) * CHART_WIDTH;
        const y = CHART_BOTTOM - (point.score / scoreUpperBound) * CHART_HEIGHT;
        return { x, y, raw: point };
      });

      if (normalizedPoints.length === 1) {
        normalizedPoints.unshift({ x: CHART_LEFT, y: normalizedPoints[0].y, raw: normalizedPoints[0].raw });
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
      const y = CHART_BOTTOM - (value / scoreUpperBound) * CHART_HEIGHT;
      return { value, y };
    });

    const timeTicks = Array.from({ length: 4 }, (_, index) => {
      const ratio = index / 3;
      const timestamp = minTimestamp + ratio * timeRange;
      return { label: new Date(timestamp), x: CHART_LEFT + ratio * CHART_WIDTH };
    });

    return {
      series,
      scoreTicks,
      timeTicks,
      scoreUpperBound,
      frame: { left: CHART_LEFT, right: CHART_RIGHT, top: CHART_TOP, bottom: CHART_BOTTOM },
    };
  }, [entries, CHART_LEFT, CHART_RIGHT, CHART_TOP, CHART_BOTTOM, CHART_HEIGHT, CHART_WIDTH]);

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

      <div className="mt-10">
        <div className="relative isolate overflow-hidden rounded-[32px] border border-white/5 bg-gradient-to-b from-white/10 via-transparent to-transparent p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] sm:p-7">
          <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: "radial-gradient(circle at 20% 20%, rgba(255,214,153,0.12), transparent 55%)" }} />
          <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/60">
            {hoveredTrack ? (
              <>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: hoveredTrack.color }} />
                <span className="text-sm font-semibold normal-case tracking-normal text-dusk-50">{hoveredTrack.team}</span>
              </>
            ) : (
              <span>Hover trace</span>
            )}
          </div>
          <svg
              viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
              className="w-full aspect-video"
            role="img"
            aria-label="Score progression lines by team"
            onMouseLeave={() => setHoveredTrack(null)}
          >
            {chartData.scoreTicks.map((tick) => (
              <g key={tick.value}>
                  <line x1={chartData.frame.left} y1={tick.y} x2={chartData.frame.right} y2={tick.y} stroke="rgba(255,255,255,0.09)" strokeWidth={0.35} />
                  <text x={chartData.frame.left - 2} y={tick.y - 1} className="fill-white/45 text-[3px]" alignmentBaseline="middle">
                  {tick.value.toLocaleString()}
                </text>
              </g>
            ))}

            {chartData.timeTicks.map((tick) => (
              <g key={tick.x}>
                  <line x1={tick.x} y1={chartData.frame.top} x2={tick.x} y2={chartData.frame.bottom} stroke="rgba(255,255,255,0.05)" strokeWidth={0.35} />
                  <text x={tick.x} y={chartData.frame.bottom + 4} textAnchor="middle" className="fill-white/55 text-[3px]">
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
                  strokeWidth={0.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-[0_5px_12px_rgba(0,0,0,0.45)]"
                  tabIndex={0}
                  onMouseEnter={() => setHoveredTrack({ team: track.entry.team, color: track.color })}
                  onFocus={() => setHoveredTrack({ team: track.entry.team, color: track.color })}
                  onMouseLeave={() => setHoveredTrack(null)}
                  onBlur={() => setHoveredTrack(null)}
                />
                {track.normalizedPoints.map((point, index) => (
                  <circle
                    key={`${track.entry.team}-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r={1.35}
                    fill="#0a0603"
                    stroke={track.color}
                    strokeWidth={0.4}
                    onMouseEnter={() => setHoveredTrack({ team: track.entry.team, color: track.color })}
                    onFocus={() => setHoveredTrack({ team: track.entry.team, color: track.color })}
                    onMouseLeave={() => setHoveredTrack(null)}
                    onBlur={() => setHoveredTrack(null)}
                  />
                ))}
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div className="mt-8 rounded-[26px] border border-white/5 bg-black/30 p-4 text-xs uppercase tracking-[0.25em] text-white/70">
        <p>Legend</p>
        <ul className="mt-4 flex flex-wrap gap-3 text-left text-[0.75rem] tracking-normal text-white/80">
          {chartData.series.map((track) => (
            <li key={track.entry.team} className="flex min-w-[12rem] items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: track.color }} />
              <div className="flex flex-col leading-tight">
                <span className="text-[0.65rem] uppercase tracking-[0.35em] text-white/50">#{track.entry.rank}</span>
                <span className="text-base font-semibold text-dusk-50">{track.entry.team}</span>
              </div>
              <span className="ml-auto text-sm font-semibold text-ember">{track.entry.score.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
