import React, { useState } from "react";
import { SimulationTickLog } from "../types";
import { AreaChart, Activity } from "lucide-react";

interface HistoricalChartsProps {
  history: SimulationTickLog[];
}

export const HistoricalCharts: React.FC<HistoricalChartsProps> = ({ history }) => {
  const [chartMode, setChartMode] = useState<"vitals" | "sustainability">("vitals");

  if (history.length < 2) {
    return (
      <div id="historical-charts-panel" className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-5 shadow-sm h-full flex flex-col items-center justify-center text-center">
        <Activity className="w-8 h-8 text-[#555] mb-2 animate-pulse" />
        <p className="text-xs font-mono text-[#888]">WAITING FOR SIMULATION RUNS</p>
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

  let datasets: { label: string; stroke: string; fill: string; values: number[] }[] = [];
  let yAxisMax = 100;
  let yAxisMin = 0;

  if (chartMode === "vitals") {
    // Plots Crowd Safety (%), Transit Logistics (%), and Volunteer Readiness (%)
    const crowdVals = history.map((h) => h.state.crowdFlow);
    const transitVals = history.map((h) => h.state.transitFlow);
    const staffVals = history.map((h) => h.state.staffReadiness);

    datasets = [
      { label: "Crowd Safety & Flow (%)", stroke: "#fbbf24", fill: "rgba(251,191,36,0.02)", values: crowdVals },
      { label: "Transit Logistics (%)", stroke: "#10b981", fill: "rgba(16,185,129,0.02)", values: transitVals },
      { label: "Volunteer Readiness (%)", stroke: "#ec4899", fill: "rgba(236,72,153,0.02)", values: staffVals },
    ];
    yAxisMax = 100;
    yAxisMin = 0;
  } else {
    // Plots Carbon Footprint and AI Smart Grid index
    const carbonVals = history.map((h) => h.state.carbonEmission);
    const gridVals = history.map((h) => h.state.smartGrid);

    datasets = [
      { label: "Carbon Footprint (tons CO2e scaled x50)", stroke: "#ef4444", fill: "rgba(239,68,68,0.02)", values: carbonVals.map(c => c * 50) },
      { label: "AI Smart Grid Capacity Index", stroke: "#22d3ee", fill: "rgba(34,211,238,0.02)", values: gridVals },
    ];
    yAxisMax = Math.max(120, ...carbonVals.map(c => c * 50), ...gridVals);
    yAxisMin = 0;
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
                LONG-TERM LOGISTICS COGNITIONS
              </p>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex bg-[#050505] border border-[#1A1A1A] rounded p-0.5 ml-auto">
            <button
              id="btn-chart-vitals"
              type="button"
              onClick={() => setChartMode("vitals")}
              className={`text-[9px] font-mono uppercase px-2.5 py-1 rounded transition-all cursor-pointer ${
                chartMode === "vitals"
                  ? "bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]"
                  : "text-[#555] border border-transparent hover:text-[#888]"
              }`}
            >
              Operations Vitals
            </button>
            <button
              id="btn-chart-sustainability"
              type="button"
              onClick={() => setChartMode("sustainability")}
              className={`text-[9px] font-mono uppercase px-2.5 py-1 rounded transition-all cursor-pointer ${
                chartMode === "sustainability"
                  ? "bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]"
                  : "text-[#555] border border-transparent hover:text-[#888]"
              }`}
            >
              Sustainability & AI Grid
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
                    {chartMode === "sustainability" && idx === 1 ? "12.5" : valueLabel.toFixed(0)}
                    {chartMode === "vitals" && "%"}
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
                      Step {yr}
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
