import React, { useState } from "react";
import { SimulationTickLog } from "../types";
import { AreaChart, Activity, Sparkles, TrendingUp, HelpCircle } from "lucide-react";

interface HistoricalChartsProps {
  history: SimulationTickLog[];
}

export const HistoricalCharts: React.FC<HistoricalChartsProps> = ({ history }) => {
  const [chartMode, setChartMode] = useState<"ecological" | "societal">("ecological");

  if (history.length < 2) {
    return (
      <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-5 shadow-sm h-full flex flex-col items-center justify-center text-center">
        <Activity className="w-8 h-8 text-[#555] mb-2 animate-pulse" />
        <p className="text-xs font-mono text-[#888]">WAITING FOR SIMULATOR PATHS</p>
        <p className="text-[10px] text-[#555] mt-1 max-w-xs leading-relaxed font-sans">
          Historical predictive trends will begin plotting dynamically as you advance ticks in the simulator.
        </p>
      </div>
    );
  }

  // Dimension helpers for custom SVG charts
  const width = 500;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Render Line path helper
  const generatePath = (
    values: number[],
    minVal: number,
    maxVal: number
  ) => {
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;
    return values
      .map((val, idx) => {
        const x = paddingLeft + (idx / (values.length - 1)) * chartWidth;
        const y = paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" L ");
  };

  // Render Area path helper for shadow glow fills
  const generateAreaPath = (
    values: number[],
    minVal: number,
    maxVal: number
  ) => {
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;
    const points = values.map((val, idx) => {
      const x = paddingLeft + (idx / (values.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const firstX = paddingLeft;
    const lastX = paddingLeft + chartWidth;
    const bottomY = paddingTop + chartHeight;

    return `M ${firstX},${bottomY} L ${points.join(" L ")} L ${lastX},${bottomY} Z`;
  };

  // Extract variables
  const years = history.map((h) => h.year);
  const startYear = years[0];
  const endYear = years[years.length - 1];

  let datasets: { label: string; stroke: string; fill: string; values: number[] }[] = [];
  let yAxisMax = 100;
  let yAxisMin = 0;
  let yAxisLabel = "% Scale";

  if (chartMode === "ecological") {
    // Plots Natural Capital (%), Social Stability (%), and Tech index (scaled)
    const resourceVals = history.map((h) => h.state.resources);
    const socialVals = history.map((h) => h.state.social);
    const techVals = history.map((h) => Math.min(100, h.state.tech * 4)); // scaled for graph readability

    datasets = [
      { label: "Natural Capital (Resource Reserve %)", stroke: "#10b981", fill: "rgba(16,185,129,0.03)", values: resourceVals },
      { label: "Social Stability (%)", stroke: "#ec4899", fill: "rgba(236,72,153,0.03)", values: socialVals },
      { label: "Tech Index (Scaled x4)", stroke: "#22d3ee", fill: "rgba(34,211,238,0.03)", values: techVals },
    ];
    yAxisMax = 100;
    yAxisMin = 0;
    yAxisLabel = "% Status";
  } else {
    // Plots GDP ($T) and Global Temperature Warming (°C)
    const gdpVals = history.map((h) => h.state.gdp);
    const co2Vals = history.map((h) => h.state.co2); // e.g. 1.25°C, 2.0°C

    datasets = [
      { label: "Global GDP ($T USD)", stroke: "#f59e0b", fill: "rgba(245,158,11,0.02)", values: gdpVals },
      { label: "Temp Deviation (°C Rise)", stroke: "#ef4444", fill: "rgba(239,68,68,0.02)", values: co2Vals.map(c => c * 50) }, // scaled for 0-150 range representation
    ];
    yAxisMax = Math.max(160, ...gdpVals, ...co2Vals.map(c => c * 50));
    yAxisMin = 0;
    yAxisLabel = "GDP ($T) / Temp Rise (Scaled)";
  }

  // Draw Grid lines
  const gridTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-5 shadow-sm relative overflow-hidden flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-[#1A1A1A] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#10B981]">
              <AreaChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans font-medium text-white text-xs tracking-wider uppercase">
                Predictive System Trajectories
              </h3>
              <p className="text-[10px] text-[#555] font-mono tracking-widest">
                LONG-TERM COGNITIVE FEEDBACKS
              </p>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex bg-[#050505] border border-[#1A1A1A] rounded p-0.5 ml-auto">
            <button
              onClick={() => setChartMode("ecological")}
              className={`text-[9px] font-mono uppercase px-2.5 py-1 rounded transition-all cursor-pointer ${
                chartMode === "ecological"
                  ? "bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]"
                  : "text-[#555] border border-transparent hover:text-[#888]"
              }`}
            >
              System Vitals
            </button>
            <button
              onClick={() => setChartMode("societal")}
              className={`text-[9px] font-mono uppercase px-2.5 py-1 rounded transition-all cursor-pointer ${
                chartMode === "societal"
                  ? "bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]"
                  : "text-[#555] border border-transparent hover:text-[#888]"
              }`}
            >
              GDP vs Carbon Temp
            </button>
          </div>
        </div>

        {/* Vector SVG Graph Plotting */}
        <div className="bg-[#050505] border border-[#1A1A1A] rounded p-2.5 relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
            {/* Grid Lines */}
            {gridTicks.map((tickRatio, idx) => {
              const y = paddingTop + chartHeight - tickRatio * chartHeight;
              const valueLabel = yAxisMin + tickRatio * (yAxisMax - yAxisMin);

              return (
                <g key={idx}>
                  {/* Horiz Grid Line */}
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke="rgba(26,26,26,0.6)"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  {/* Left Label */}
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    fill="#555"
                    className="text-[8px] font-mono"
                  >
                    {chartMode === "societal" && idx === 1 ? "0.5°C" : chartMode === "societal" && idx === 3 ? "1.5°C" : valueLabel.toFixed(0)}
                    {chartMode === "ecological" && "%"}
                  </text>
                </g>
              );
            })}

            {/* Time Marker Ticks */}
            {years.map((yr, idx) => {
              // Plot first, mid, and last years to prevent overlapping text
              if (idx === 0 || idx === years.length - 1 || (years.length > 5 && idx === Math.floor(years.length / 2))) {
                const x = paddingLeft + (idx / (years.length - 1)) * chartWidth;
                return (
                  <g key={idx}>
                    {/* Vert line */}
                    <line
                      x1={x}
                      y1={paddingTop}
                      x2={x}
                      y2={paddingTop + chartHeight}
                      stroke="rgba(26,26,26,0.3)"
                      strokeWidth="1"
                    />
                    {/* Bottom Label */}
                    <text
                      x={x}
                      y={paddingTop + chartHeight + 14}
                      textAnchor="middle"
                      fill="#555"
                      className="text-[8px] font-mono font-medium"
                    >
                      Yr {yr}
                    </text>
                  </g>
                );
              }
              return null;
            })}

            {/* Area and Line plots */}
            {datasets.map((dataset, idx) => {
              const pathStr = generatePath(dataset.values, yAxisMin, yAxisMax);
              const areaPathStr = generateAreaPath(dataset.values, yAxisMin, yAxisMax);

              return (
                <g key={idx}>
                  {/* Filled Area Gradient */}
                  <path
                    d={areaPathStr}
                    fill={dataset.fill}
                    className="transition-all duration-300"
                  />
                  {/* Solid Line */}
                  <path
                    d={`M ${pathStr}`}
                    fill="none"
                    stroke={dataset.stroke}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                  {/* Node dots for last point */}
                  {dataset.values.length > 0 && (
                    <circle
                      cx={paddingLeft + chartWidth}
                      cy={paddingTop + chartHeight - ((dataset.values[dataset.values.length - 1] - yAxisMin) / (yAxisMax - yAxisMin)) * chartHeight}
                      r="3.5"
                      fill={dataset.stroke}
                      stroke="#050505"
                      strokeWidth="1.5"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legends */}
      <div className="mt-4 border-t border-[#1A1A1A] pt-3.5 flex flex-wrap gap-4 items-center justify-center">
        {datasets.map((ds, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: ds.stroke }} />
            <span className="text-[10px] font-sans text-[#999] tracking-tight leading-none">
              {ds.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
