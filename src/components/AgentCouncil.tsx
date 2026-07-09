import React, { useState } from "react";
import { AgentDecision } from "../types";
import { Eye, EyeOff, HeartHandshake } from "lucide-react";

interface AgentCouncilProps {
  decisions: AgentDecision[] | null;
  isSimulating: boolean;
  satisfaction: {
    stadium_ops: number;
    eco_sustainability: number;
    safety_security: number;
    fan_experience: number;
  };
}

export const AgentCouncil: React.FC<AgentCouncilProps> = ({
  decisions,
  isSimulating,
  satisfaction,
}) => {
  const [showReasoning, setShowReasoning] = useState<Record<string, boolean>>({});

  const toggleReasoning = (id: string) => {
    setShowReasoning((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAllReasoning = () => {
    if (!decisions) return;
    const allShown = decisions.every((d) => showReasoning[d.id]);
    const nextState: Record<string, boolean> = {};
    decisions.forEach((d) => {
      nextState[d.id] = !allShown;
    });
    setShowReasoning(nextState);
  };

  const getAgentTheme = (id: string) => {
    switch (id) {
      case "stadium_ops":
        return {
          border: "border-[#1A1A1A]",
          bg: "bg-[#080808]",
          text: "text-[#f59e0b]",
          badge: "bg-[#f59e0b]/5 border-[#f59e0b]/20 text-[#f59e0b]",
          glow: "shadow-none",
          accentColor: "#f59e0b",
        };
      case "eco_sustainability":
        return {
          border: "border-[#1A1A1A]",
          bg: "bg-[#080808]",
          text: "text-[#10B981]",
          badge: "bg-[#10B981]/5 border-[#10B981]/20 text-[#10B981]",
          glow: "shadow-none",
          accentColor: "#10B981",
        };
      case "fan_experience":
        return {
          border: "border-[#1A1A1A]",
          bg: "bg-[#080808]",
          text: "text-[#22d3ee]",
          badge: "bg-[#22d3ee]/5 border-[#22d3ee]/20 text-[#22d3ee]",
          glow: "shadow-none",
          accentColor: "#22d3ee",
        };
      case "safety_security":
        return {
          border: "border-[#1A1A1A]",
          bg: "bg-[#080808]",
          text: "text-[#ec4899]",
          badge: "bg-[#ec4899]/5 border-[#ec4899]/20 text-[#ec4899]",
          glow: "shadow-none",
          accentColor: "#ec4899",
        };
      default:
        return {
          border: "border-[#1A1A1A]",
          bg: "bg-[#080808]",
          text: "text-[#888]",
          badge: "bg-[#080808] border-[#1A1A1A] text-[#888]",
          glow: "shadow-none",
          accentColor: "#888",
        };
    }
  };

  const getSatisfactionLabel = (score: number) => {
    if (score >= 80) return "Optimal";
    if (score >= 60) return "Cooperative";
    if (score >= 40) return "Strained";
    return "Critical Alert";
  };

  const getSatisfactionColor = (score: number) => {
    if (score >= 80) return "text-[#10B981] bg-[#10B981]/5 border-[#10B981]/20";
    if (score >= 60) return "text-[#22d3ee] bg-[#22d3ee]/5 border-[#22d3ee]/20";
    if (score >= 40) return "text-[#f59e0b] bg-[#f59e0b]/5 border-[#f59e0b]/20";
    return "text-rose-500 bg-rose-950/20 border-rose-900/30 animate-pulse";
  };

  return (
    <div id="agent-council-panel" className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-5 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 border-b border-[#1A1A1A] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#10B981]">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sans font-medium text-white text-xs tracking-wider uppercase">
              Operations Control Council
            </h3>
            <p className="text-[10px] text-[#555] font-mono tracking-widest">
              MULTI-AGENT LOGISTICS ALIGNMENT
            </p>
          </div>
        </div>
        <button
          id="btn-reveal-strategies"
          type="button"
          onClick={toggleAllReasoning}
          disabled={!decisions}
          className="text-[9px] text-[#10B981] font-mono bg-[#10B981]/5 border border-[#10B981]/20 hover:bg-[#10B981]/15 hover:border-[#10B981]/40 disabled:opacity-50 disabled:cursor-not-allowed px-2.5 py-0.5 rounded uppercase tracking-wider transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#10B981]/50"
          title="Toggle All Private Strategies"
        >
          {decisions && decisions.length > 0 && decisions.every((d) => showReasoning[d.id])
            ? "Hide All Strategies"
            : "Reveal All Strategies"}
        </button>
      </div>

      {isSimulating ? (
        <div className="py-16 flex flex-col items-center justify-center text-center">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full border border-[#10B981]/10 animate-ping" />
            <div className="absolute inset-0 rounded-full border border-t-[#10B981] border-[#10B981]/20 animate-spin" />
          </div>
          <p className="text-xs font-mono text-[#10B981] uppercase tracking-widest animate-pulse">
            Gemini Agent Debate in progress...
          </p>
          <p className="text-[10px] text-[#555] max-w-xs mt-2 italic font-sans leading-normal">
            Agents are analyzing the match-day incident, running prediction loops, and negotiating resources.
          </p>
        </div>
      ) : decisions ? (
        <div className="space-y-4">
          {decisions.map((agent) => {
            const theme = getAgentTheme(agent.id);
            const score = satisfaction[agent.id as keyof typeof satisfaction] ?? 70;
            const isShowingReasoning = !!showReasoning[agent.id];

            return (
              <div
                key={agent.id}
                className={`border ${theme.border} ${theme.bg} rounded p-4 shadow-sm transition-all duration-300 relative`}
              >
                {/* Agent Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A1A] pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                    <h4 className="font-sans font-semibold text-white text-xs tracking-tight">
                      {agent.name}
                    </h4>
                    <span className={`text-[8px] font-mono border px-1.5 py-0.2 rounded uppercase ${theme.badge}`}>
                      COUNCIL REPRESENTATIVE
                    </span>
                  </div>

                  {/* Faction Alignment Dials */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono text-[#555] uppercase">
                        Vote Influence:
                      </span>
                      <span className="text-[10px] font-mono text-white bg-[#050505] border border-[#1A1A1A] px-1.5 py-0.2 rounded font-semibold">
                        {agent.tokenAllocation}/10 Tokens
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono text-[#555] uppercase">
                        Efficiency:
                      </span>
                      <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 border rounded ${getSatisfactionColor(score)}`}>
                        {score.toFixed(1)}% ({getSatisfactionLabel(score)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Agent Public Statement Speech Bubble */}
                <div className="bg-[#050505] border border-[#1A1A1A] rounded p-3 relative">
                  <span className="absolute top-1 right-2 text-[8px] font-mono text-[#555] uppercase tracking-wider">
                    DEPUTY TRANSCRIPT
                  </span>
                  <p className="text-[11px] text-[#E0E0E0] leading-relaxed italic font-sans pr-4">
                    &ldquo;{agent.statement}&rdquo;
                  </p>
                  
                  {/* Proposed Vote / Policy Priority */}
                  <div className="mt-2.5 pt-2 border-t border-[#1A1A1A] flex items-center gap-2 text-[10px]">
                    <span className="text-[#555] font-mono text-[9px] uppercase">
                      PROPOSED REMEDIAL ACTION:
                    </span>
                    <span className="font-sans font-medium text-[#10B981] bg-[#10B981]/5 border border-[#10B981]/20 px-2 py-0.5 rounded">
                      {agent.policyVote}
                    </span>
                  </div>
                </div>

                {/* Private Cognitive Reasoning Dropdown Toggle */}
                <div className="mt-2.5">
                  <button
                    onClick={() => toggleReasoning(agent.id)}
                    className="flex items-center gap-1.5 text-[9px] font-mono uppercase text-[#555] hover:text-[#888] transition-colors"
                  >
                    {isShowingReasoning ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-[#10B981]" />
                        <span>Hide Cognitive Strategy</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-[#555]" />
                        <span>Inspect Private Cognitive Strategy</span>
                      </>
                    )}
                  </button>

                  {isShowingReasoning && (
                    <div className="mt-2 p-3 bg-[#050505] border border-[#1A1A1A] text-[10.5px] font-mono text-[#10B981] leading-relaxed rounded border-l-2 border-l-[#10B981]/40 relative">
                      <span className="absolute top-1 right-2 text-[7px] text-[#10B981]/70 font-mono tracking-widest uppercase">
                        GEMINI REALTIME REASONING
                      </span>
                      <p className="whitespace-pre-line">
                        {agent.internalReasoning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-[11px] text-[#555] italic">
          No active operations council logs available.
          <br />
          Click &ldquo;Advance Simulation&rdquo; to trigger agent debate.
        </div>
      )}
    </div>
  );
};
