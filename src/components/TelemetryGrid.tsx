import React from "react";
import { SystemState } from "../types";
import { Coins, Leaf, Thermometer, Zap, ShieldAlert, Users } from "lucide-react";

interface TelemetryGridProps {
  currentState: SystemState;
  previousState: SystemState | null;
  history: SystemState[];
}

export const TelemetryGrid: React.FC<TelemetryGridProps> = ({
  currentState,
  previousState,
  history,
}) => {
  // Helpers to calculate percentage change
  const getPctChange = (current: number, previous: number | undefined, isAbsDiff = false) => {
    if (previous === undefined || previous === 0) return { text: "0.0%", isPositive: true, isZero: true };
    const diff = current - previous;
    if (isAbsDiff) {
      const sign = diff >= 0 ? "+" : "";
      return {
        text: `${sign}${diff.toFixed(2)}°C`,
        isPositive: diff < 0, // Temp rise drop is positive
        isZero: diff === 0,
      };
    }
    const pct = (diff / previous) * 100;
    const sign = pct >= 0 ? "+" : "";
    return {
      text: `${sign}${pct.toFixed(1)}%`,
      isPositive: pct >= 0,
      isZero: pct === 0,
    };
  };

  const trends = {
    gdp: getPctChange(currentState.gdp, previousState?.gdp),
    resources: getPctChange(currentState.resources, previousState?.resources),
    co2: getPctChange(currentState.co2, previousState?.co2, true),
    tech: getPctChange(currentState.tech, previousState?.tech),
    social: getPctChange(currentState.social, previousState?.social),
  };

  // Helper to render mini custom sparkline path
  const renderSparkline = (dataKey: keyof SystemState, stroke: string) => {
    if (history.length < 2) return null;
    const values = history.map((h) => h[dataKey] as number);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min === 0 ? 1 : max - min;

    const width = 80;
    const height = 24;
    const points = values.map((val, idx) => {
      const x = (idx / (values.length - 1)) * width;
      // Invert Y since SVG y=0 is top
      const y = height - ((val - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    });

    return (
      <svg width={width} height={height} className="overflow-visible opacity-85">
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          points={points.join(" ")}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Glow Shadow under sparkline */}
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth="4"
          points={points.join(" ")}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-15 blur-[2px]"
        />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* GDP Card */}
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-4 relative overflow-hidden shadow-sm">
        <div className="flex items-start justify-between">
          <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#f59e0b]">
            <Coins className="w-4 h-4" />
          </div>
          {renderSparkline("gdp", "#f59e0b")}
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono tracking-[0.15em] text-[#555] uppercase">
            Global Production (GDP)
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-light text-white tracking-tight">
              ${currentState.gdp.toFixed(1)}T
            </span>
            <span
              className={`text-[10px] font-mono font-medium ${
                trends.gdp.isZero
                  ? "text-[#555]"
                  : trends.gdp.isPositive
                  ? "text-[#10B981]"
                  : "text-rose-500"
              }`}
            >
              {trends.gdp.text}
            </span>
          </div>
          <p className="text-[9px] text-[#555] mt-1 italic">
            Economic output & capital capacity
          </p>
        </div>
      </div>

      {/* Natural Capital Card */}
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-4 relative overflow-hidden shadow-sm">
        <div className="flex items-start justify-between">
          <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#10B981]">
            <Leaf className="w-4 h-4" />
          </div>
          {renderSparkline("resources", "#10B981")}
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono tracking-[0.15em] text-[#555] uppercase">
            Natural Capital
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-light text-white tracking-tight">
              {currentState.resources.toFixed(1)}%
            </span>
            <span
              className={`text-[10px] font-mono font-medium ${
                trends.resources.isZero
                  ? "text-[#555]"
                  : trends.resources.isPositive
                  ? "text-[#10B981]"
                  : "text-rose-500"
              }`}
            >
              {trends.resources.text}
            </span>
          </div>
          <p className="text-[9px] text-[#555] mt-1 italic">
            Material assets & bio-reserves
          </p>
        </div>
        {currentState.resources < 45 && (
          <div className="absolute inset-x-0 bottom-0 bg-rose-950/20 border-t border-rose-900/30 py-0.5 px-3 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-500 shrink-0" />
            <span className="text-[8px] font-mono text-rose-500 uppercase tracking-wider animate-pulse">
              Severe Depletion Risk
            </span>
          </div>
        )}
      </div>

      {/* Atmospheric Temp Rise Card */}
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-4 relative overflow-hidden shadow-sm">
        <div className="flex items-start justify-between">
          <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#ef4444]">
            <Thermometer className="w-4 h-4" />
          </div>
          {renderSparkline("co2", "#ef4444")}
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono tracking-[0.15em] text-[#555] uppercase">
            Atmospheric Temp Rise
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-light text-white tracking-tight">
              +{currentState.co2.toFixed(2)}°C
            </span>
            <span
              className={`text-[10px] font-mono font-medium ${
                trends.co2.isZero
                  ? "text-[#555]"
                  : trends.co2.isPositive
                  ? "text-[#10B981]"
                  : "text-rose-500"
              }`}
            >
              {trends.co2.text}
            </span>
          </div>
          <p className="text-[9px] text-[#555] mt-1 italic">
            Degrees over pre-industrial
          </p>
        </div>
        {currentState.co2 > 1.5 && (
          <div className="absolute inset-x-0 bottom-0 bg-red-950/20 border-t border-red-900/30 py-0.5 px-3 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-red-500 shrink-0" />
            <span className="text-[8px] font-mono text-red-500 uppercase tracking-wider animate-pulse">
              Paris Threshold Exceeded
            </span>
          </div>
        )}
      </div>

      {/* Tech Index Card */}
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-4 relative overflow-hidden shadow-sm">
        <div className="flex items-start justify-between">
          <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#22d3ee]">
            <Zap className="w-4 h-4" />
          </div>
          {renderSparkline("tech", "#22d3ee")}
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono tracking-[0.15em] text-[#555] uppercase">
            Technology Index
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-light text-white tracking-tight">
              {currentState.tech.toFixed(1)}
            </span>
            <span
              className={`text-[10px] font-mono font-medium ${
                trends.tech.isZero
                  ? "text-[#555]"
                  : trends.tech.isPositive
                  ? "text-[#10B981]"
                  : "text-rose-500"
              }`}
            >
              {trends.tech.text}
            </span>
          </div>
          <p className="text-[9px] text-[#555] mt-1 italic">
            Biosphere-saving efficiency
          </p>
        </div>
      </div>

      {/* Social Stability Card */}
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-4 relative overflow-hidden shadow-sm">
        <div className="flex items-start justify-between">
          <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#ec4899]">
            <Users className="w-4 h-4" />
          </div>
          {renderSparkline("social", "#ec4899")}
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono tracking-[0.15em] text-[#555] uppercase">
            Social Stability
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-light text-white tracking-tight">
              {currentState.social.toFixed(1)}%
            </span>
            <span
              className={`text-[10px] font-mono font-medium ${
                trends.social.isZero
                  ? "text-[#555]"
                  : trends.social.isPositive
                  ? "text-[#10B981]"
                  : "text-rose-500"
              }`}
            >
              {trends.social.text}
            </span>
          </div>
          <p className="text-[9px] text-[#555] mt-1 italic">
            Cohesion & institutional health
          </p>
        </div>
        {currentState.social < 50 && (
          <div className="absolute inset-x-0 bottom-0 bg-pink-950/20 border-t border-pink-900/30 py-0.5 px-3 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-pink-500 shrink-0" />
            <span className="text-[8px] font-mono text-pink-500 uppercase tracking-wider animate-pulse">
              Unrest Risk Critical
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
