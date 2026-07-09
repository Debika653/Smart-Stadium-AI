import React from "react";
import { PolicyState, CrisisEvent } from "../types";
import { CRISIS_PRESETS } from "../data";
import { Sliders, Zap, RefreshCw, Play, Pause, AlertTriangle, ChevronRight, HelpCircle } from "lucide-react";

interface SimulationControlsProps {
  policies: PolicyState;
  setPolicies: React.Dispatch<React.SetStateAction<PolicyState>>;
  onAdvance: () => void;
  onReset: () => void;
  autoplay: boolean;
  setAutoplay: React.Dispatch<React.SetStateAction<boolean>>;
  isSimulating: boolean;
  activeCrisis: CrisisEvent | null;
  triggerCustomCrisis: (crisis: CrisisEvent) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  policies,
  setPolicies,
  onAdvance,
  onReset,
  autoplay,
  setAutoplay,
  isSimulating,
  activeCrisis,
  triggerCustomCrisis,
}) => {
  const handleSliderChange = (key: keyof PolicyState, value: number) => {
    setPolicies((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-5 shadow-sm relative overflow-hidden flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-[#1A1A1A] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#10B981]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans font-medium text-white text-xs tracking-wider uppercase">
                Global Policy Dashboard
              </h3>
              <p className="text-[10px] text-[#555] font-mono tracking-widest">
                EXECUTIVE DECISION CONTROLS
              </p>
            </div>
          </div>
          <span className="text-[9px] text-[#10B981] font-mono bg-[#10B981]/5 border border-[#10B981]/20 px-2.5 py-0.5 rounded uppercase tracking-wider">
            State Override
          </span>
        </div>

        {/* Sliders Container */}
        <div className="space-y-4">
          {/* Carbon Tax Slider */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[10px] font-mono tracking-wider uppercase">
              <span className="text-[#888]">Carbon & Emission Tax</span>
              <span className="text-[#10B981] font-semibold">{policies.carbonTax}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={policies.carbonTax}
              onChange={(e) => handleSliderChange("carbonTax", parseInt(e.target.value))}
              disabled={isSimulating}
              className="w-full h-1 bg-[#1A1A1A] rounded appearance-none cursor-pointer accent-[#10B981] focus:outline-none focus:ring-0 disabled:opacity-40"
            />
            <div className="flex justify-between text-[8px] text-[#555] font-mono mt-0.5 uppercase tracking-wider">
              <span>0% (Free Market)</span>
              <span>100% (Prohibitive)</span>
            </div>
          </div>

          {/* Technology Subsidies Slider */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[10px] font-mono tracking-wider uppercase">
              <span className="text-[#888]">Technology R&D Funding</span>
              <span className="text-[#10B981] font-semibold">{policies.techSubsidies}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={policies.techSubsidies}
              onChange={(e) => handleSliderChange("techSubsidies", parseInt(e.target.value))}
              disabled={isSimulating}
              className="w-full h-1 bg-[#1A1A1A] rounded appearance-none cursor-pointer accent-[#10B981] focus:outline-none focus:ring-0 disabled:opacity-40"
            />
            <div className="flex justify-between text-[8px] text-[#555] font-mono mt-0.5 uppercase tracking-wider">
              <span>0% (Zero Subsidies)</span>
              <span>100% (Fully Funded)</span>
            </div>
          </div>

          {/* Material Extraction Resource Quota Slider */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[10px] font-mono tracking-wider uppercase">
              <span className="text-[#888]">Natural Capital Extraction Cap</span>
              <span className="text-[#10B981] font-semibold">{policies.resourceQuota}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={policies.resourceQuota}
              onChange={(e) => handleSliderChange("resourceQuota", parseInt(e.target.value))}
              disabled={isSimulating}
              className="w-full h-1 bg-[#1A1A1A] rounded appearance-none cursor-pointer accent-[#10B981] focus:outline-none focus:ring-0 disabled:opacity-40"
            />
            <div className="flex justify-between text-[8px] text-[#555] font-mono mt-0.5 uppercase tracking-wider">
              <span>10% (Strict Conservation)</span>
              <span>100% (Uncapped Extraction)</span>
            </div>
          </div>

          {/* Welfare Dividend Slider */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[10px] font-mono tracking-wider uppercase">
              <span className="text-[#888]">Human Welfare Dividend (UBI)</span>
              <span className="text-[#10B981] font-semibold">{policies.welfareDividend}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={policies.welfareDividend}
              onChange={(e) => handleSliderChange("welfareDividend", parseInt(e.target.value))}
              disabled={isSimulating}
              className="w-full h-1 bg-[#1A1A1A] rounded appearance-none cursor-pointer accent-[#10B981] focus:outline-none focus:ring-0 disabled:opacity-40"
            />
            <div className="flex justify-between text-[8px] text-[#555] font-mono mt-0.5 uppercase tracking-wider">
              <span>0% (None)</span>
              <span>80% (Maximum Social Security)</span>
            </div>
          </div>
        </div>

        {/* Active Crisis Alert Panel */}
        <div className="mt-5 border-t border-[#1A1A1A] pt-4">
          <h4 className="text-[9px] font-mono tracking-wider text-[#555] uppercase mb-2">
            Active Biosphere Stress Event
          </h4>
          {activeCrisis ? (
            <div className="bg-red-950/10 border border-red-900/20 rounded p-3 relative overflow-hidden">
              <div className="flex items-center gap-1.5 text-red-400 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="font-sans font-semibold text-xs tracking-tight">
                  {activeCrisis.title}
                </span>
                <span className="text-[8px] font-mono bg-red-900/30 text-red-200 border border-red-800/20 px-1 rounded ml-auto uppercase">
                  Severity {activeCrisis.severity}/10
                </span>
              </div>
              <p className="text-[10px] text-[#999] leading-normal font-sans">
                {activeCrisis.description}
              </p>
            </div>
          ) : (
            <div className="bg-[#080808] border border-[#1A1A1A] rounded p-3 text-center">
              <span className="text-[9px] text-[#10B981] font-mono bg-[#10B981]/5 border border-[#10B981]/20 px-2 py-0.5 rounded inline-block mb-1 uppercase tracking-wider">
                Planetary Equilibrium Normal
              </span>
              <p className="text-[10px] text-[#555] leading-normal font-sans">
                Next environmental stress trigger scheduled in future ticks.
              </p>
            </div>
          )}
        </div>

        {/* Custom Crisis Injector Presets */}
        <div className="mt-4">
          <h4 className="text-[9px] font-mono tracking-wider text-[#555] uppercase mb-2">
            Crisis Simulation Sand-Box
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {CRISIS_PRESETS.map((cr) => {
              const isActive = activeCrisis?.id === cr.id;
              return (
                <button
                  key={cr.id}
                  onClick={() => triggerCustomCrisis(cr)}
                  disabled={isSimulating || isActive}
                  className={`text-[9px] font-mono px-2 py-1 rounded border transition-all flex items-center gap-1 ${
                    isActive
                      ? "bg-red-950/20 border-red-500/20 text-red-400"
                      : "bg-[#080808] hover:bg-[#111] border-[#1A1A1A] text-[#888] hover:text-white"
                  }`}
                >
                  <Zap className="w-3 h-3 text-[#10B981]" />
                  <span>{cr.title.split(" ").slice(0, 3).join(" ")}...</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Execution Controls Section */}
      <div className="mt-6 border-t border-[#1A1A1A] pt-4 flex items-center justify-between gap-3">
        {/* Reset */}
        <button
          onClick={onReset}
          disabled={isSimulating}
          className="p-2 bg-[#080808] hover:bg-[#111] text-[#555] hover:text-[#888] border border-[#1A1A1A] rounded transition-all disabled:opacity-40"
          title="Reset Simulation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Autoplay Toggle - Always enabled so users can pause auto-tick instantly */}
        <button
          onClick={() => setAutoplay((prev) => !prev)}
          className={`flex-grow py-2 px-3 border rounded flex items-center justify-center gap-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
            autoplay
              ? "bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981] hover:bg-[#10B981]/15"
              : "bg-[#080808] hover:bg-[#111] border-[#1A1A1A] text-[#888] hover:text-white"
          }`}
        >
          {autoplay ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Auto-Tick</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-[#10B981] fill-[#10B981]/10" />
              <span>Enable Auto-Tick</span>
            </>
          )}
        </button>

        {/* Advance Year Single step button */}
        <button
          onClick={onAdvance}
          disabled={isSimulating}
          className="bg-[#10B981] text-black font-sans font-bold text-xs py-2 px-4 rounded border border-[#10B981] hover:bg-emerald-400 transition-all shadow-[0_0_8px_#10B981] flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed min-w-[125px] justify-center"
        >
          {isSimulating ? (
            <>
              <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin mr-1" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <span>Advance Step</span>
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
