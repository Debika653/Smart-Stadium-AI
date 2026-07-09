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
        text: `${sign}${diff.toFixed(2)}t`,
        isPositive: diff < 0, // Emission drop is positive
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
    crowdFlow: getPctChange(currentState.crowdFlow, previousState?.crowdFlow),
    transitFlow: getPctChange(currentState.transitFlow, previousState?.transitFlow),
    carbonEmission: getPctChange(currentState.carbonEmission, previousState?.carbonEmission, true),
    smartGrid: getPctChange(currentState.smartGrid, previousState?.smartGrid),
    staffReadiness: getPctChange(currentState.staffReadiness, previousState?.staffReadiness),
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
    <div id="telemetry-grid-section" className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Crowd Safety Card */}
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-4 relative overflow-hidden shadow-sm">
        <div className="flex items-start justify-between">
          <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#f59e0b]">
            <Coins className="w-4 h-4" />
          </div>
          {renderSparkline("crowdFlow", "#f59e0b")}
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono tracking-[0.15em] text-[#555] uppercase">
            Crowd Safety Index
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-light text-white tracking-tight">
              {currentState.crowdFlow.toFixed(1)}%
            </span>
            <span
              className={`text-[10px] font-mono font-medium ${
                trends.crowdFlow.isZero
                  ? "text-[#555]"
                  : trends.crowdFlow.isPositive
                  ? "text-[#10B981]"
                  : "text-rose-500"
              }`}
            >
              {trends.crowdFlow.text}
            </span>
          </div>
          <p className="text-[9px] text-[#555] mt-1 italic">
            Pedestrian comfort & safety throughput
          </p>
        </div>
      </div>

      {/* Transit Logistics Card */}
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-4 relative overflow-hidden shadow-sm">
        <div className="flex items-start justify-between">
          <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#10B981]">
            <Leaf className="w-4 h-4" />
          </div>
          {renderSparkline("transitFlow", "#10B981")}
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono tracking-[0.15em] text-[#555] uppercase">
            Transit Logistics
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-light text-white tracking-tight">
              {currentState.transitFlow.toFixed(1)}%
            </span>
            <span
              className={`text-[10px] font-mono font-medium ${
                trends.transitFlow.isZero
                  ? "text-[#555]"
                  : trends.transitFlow.isPositive
                  ? "text-[#10B981]"
                  : "text-rose-500"
              }`}
            >
              {trends.transitFlow.text}
            </span>
          </div>
          <p className="text-[9px] text-[#555] mt-1 italic">
            Shuttle, train, & traffic fluidity
          </p>
        </div>
        {currentState.transitFlow < 45 && (
          <div className="absolute inset-x-0 bottom-0 bg-rose-950/20 border-t border-rose-900/30 py-0.5 px-3 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-500 shrink-0" />
            <span className="text-[8px] font-mono text-rose-500 uppercase tracking-wider animate-pulse">
              Severe Gridlock Delay
            </span>
          </div>
        )}
      </div>

      {/* Carbon Footprint Card */}
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-4 relative overflow-hidden shadow-sm">
        <div className="flex items-start justify-between">
          <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#ef4444]">
            <Thermometer className="w-4 h-4" />
          </div>
          {renderSparkline("carbonEmission", "#ef4444")}
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono tracking-[0.15em] text-[#555] uppercase">
            Carbon Footprint
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-light text-white tracking-tight">
              {currentState.carbonEmission.toFixed(2)}t
            </span>
            <span
              className={`text-[10px] font-mono font-medium ${
                trends.carbonEmission.isZero
                  ? "text-[#555]"
                  : trends.carbonEmission.isPositive
                  ? "text-[#10B981]" // Drop in carbon emissions is good
                  : "text-rose-500"
              }`}
            >
              {trends.carbonEmission.text}
            </span>
          </div>
          <p className="text-[9px] text-[#555] mt-1 italic">
            Tons CO2e per active match
          </p>
        </div>
        {currentState.carbonEmission > 1.5 && (
          <div className="absolute inset-x-0 bottom-0 bg-red-950/20 border-t border-red-900/30 py-0.5 px-3 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-red-500 shrink-0" />
            <span className="text-[8px] font-mono text-red-500 uppercase tracking-wider animate-pulse">
              Green Target Exceeded
            </span>
          </div>
        )}
      </div>

      {/* Smart Grid AI Card */}
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-4 relative overflow-hidden shadow-sm">
        <div className="flex items-start justify-between">
          <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#22d3ee]">
            <Zap className="w-4 h-4" />
          </div>
          {renderSparkline("smartGrid", "#22d3ee")}
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono tracking-[0.15em] text-[#555] uppercase">
            AI Smart Grid
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-light text-white tracking-tight">
              {currentState.smartGrid.toFixed(1)}
            </span>
            <span
              className={`text-[10px] font-mono font-medium ${
                trends.smartGrid.isZero
                  ? "text-[#555]"
                  : trends.smartGrid.isPositive
                  ? "text-[#10B981]"
                  : "text-rose-500"
              }`}
            >
              {trends.smartGrid.text}
            </span>
          </div>
          <p className="text-[9px] text-[#555] mt-1 italic">
            IoT sensors & computer vision capacity
          </p>
        </div>
      </div>

      {/* Volunteer Readiness Card */}
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-4 relative overflow-hidden shadow-sm">
        <div className="flex items-start justify-between">
          <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#ec4899]">
            <Users className="w-4 h-4" />
          </div>
          {renderSparkline("staffReadiness", "#ec4899")}
        </div>
        <div className="mt-4">
          <p className="text-[10px] font-mono tracking-[0.15em] text-[#555] uppercase">
            Volunteer Readiness
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-light text-white tracking-tight">
              {currentState.staffReadiness.toFixed(1)}%
            </span>
            <span
              className={`text-[10px] font-mono font-medium ${
                trends.staffReadiness.isZero
                  ? "text-[#555]"
                  : trends.staffReadiness.isPositive
                  ? "text-[#10B981]"
                  : "text-rose-500"
              }`}
            >
              {trends.staffReadiness.text}
            </span>
          </div>
          <p className="text-[9px] text-[#555] mt-1 italic">
            Staff morale & translation assistance
          </p>
        </div>
        {currentState.staffReadiness < 50 && (
          <div className="absolute inset-x-0 bottom-0 bg-pink-950/20 border-t border-pink-900/30 py-0.5 px-3 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-pink-500 shrink-0" />
            <span className="text-[8px] font-mono text-pink-500 uppercase tracking-wider animate-pulse">
              Volunteer Exhaustion Alert
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
