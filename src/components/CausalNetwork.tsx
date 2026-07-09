import React, { useState } from "react";
import { CAUSAL_NODES, CAUSAL_CONNECTIONS } from "../data";
import { NodePosition, NodeConnection } from "../types";
import { Info, HelpCircle } from "lucide-react";

interface CausalNetworkProps {
  currentValues: {
    gdp: number;
    resources: number;
    co2: number;
    tech: number;
    social: number;
  };
}

export const CausalNetwork: React.FC<CausalNetworkProps> = ({ currentValues }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const formatNodeValue = (id: string) => {
    switch (id) {
      case "gdp":
        return `$${currentValues.gdp.toFixed(1)}T`;
      case "resources":
        return `${currentValues.resources.toFixed(1)}%`;
      case "co2":
        return `+${currentValues.co2.toFixed(2)}°C`;
      case "tech":
        return `${currentValues.tech.toFixed(1)}`;
      case "social":
        return `${currentValues.social.toFixed(1)}%`;
      default:
        return "";
    }
  };

  const getActiveNodeData = (): NodePosition | undefined => {
    if (!selectedNode) return undefined;
    const node = CAUSAL_NODES.find((n) => n.id === selectedNode);
    if (!node) return undefined;
    return {
      ...node,
      value: formatNodeValue(node.id),
    };
  };

  const activeNode = getActiveNodeData();

  // Find connections related to selected node
  const activeConnections = selectedNode
    ? CAUSAL_CONNECTIONS.filter((c) => c.from === selectedNode || c.to === selectedNode)
    : [];

  return (
    <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-5 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-[#1A1A1A] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#10B981]">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-sans font-medium text-white text-xs tracking-wider uppercase">
              Causal Feedback Loop
            </h3>
            <p className="text-[10px] text-[#555] font-mono tracking-widest">
              DIGITAL TWIN BIOSPHERE TOPOLOGY
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSelectedNode(null)}
          className="text-[9px] text-[#10B981] font-mono bg-[#10B981]/5 border border-[#10B981]/20 hover:bg-[#10B981]/15 hover:border-[#10B981]/40 px-2.5 py-0.5 rounded uppercase tracking-wider transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#10B981]/50"
          title="Reset Map Selection"
        >
          {selectedNode ? "Reset Selection" : "Interactive Map"}
        </button>
      </div>

      {/* Node Graph Container */}
      <div className="relative flex-grow flex items-center justify-center min-h-[300px] bg-[#050505] border border-[#1A1A1A] rounded p-2 overflow-visible">
        <svg
          viewBox="0 0 580 360"
          className="w-full h-auto max-h-[320px] select-none overflow-visible"
        >
          {/* SVG Definitions */}
          <defs>
            {/* Standard Arrows */}
            <marker
              id="arrow-positive"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#10b981" />
            </marker>
            <marker
              id="arrow-negative"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#ef4444" />
            </marker>
            {/* Highlights */}
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="18"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#10b981" />
            </marker>
          </defs>

          {/* Connection Lines */}
          {CAUSAL_CONNECTIONS.map((conn, idx) => {
            const fromNode = CAUSAL_NODES.find((n) => n.id === conn.from)!;
            const toNode = CAUSAL_NODES.find((n) => n.id === conn.to)!;

            // Generate control points for curved paths
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const mx = fromNode.x + dx / 2;
            const my = fromNode.y + dy / 2;

            // Curving offset based on connection
            let qx = mx;
            let qy = my;
            if (conn.from === "gdp" && conn.to === "co2") {
              qx -= 40;
            } else if (conn.from === "co2" && conn.to === "resources") {
              qx += 30;
            } else if (conn.from === "resources" && conn.to === "gdp") {
              qy -= 30;
            } else if (conn.from === "gdp" && conn.to === "resources") {
              qy += 30;
            }

            const pathString = `M ${fromNode.x} ${fromNode.y} Q ${qx} ${qy} ${toNode.x} ${toNode.y}`;

            const isRelated = selectedNode === conn.from || selectedNode === conn.to;
            const isFromActive = selectedNode === conn.from;
            const isToActive = selectedNode === conn.to;

            let strokeColor = conn.type === "positive" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)";
            let strokeWidth = 1.5;
            let dashArray = "none";

            if (selectedNode) {
              if (isRelated) {
                strokeColor = isFromActive ? "rgba(16,185,129,0.95)" : conn.type === "positive" ? "rgba(16,185,129,0.7)" : "rgba(239,68,68,0.7)";
                strokeWidth = 2.5;
                dashArray = "5,5";
              } else {
                strokeColor = "rgba(71,85,105,0.06)";
                strokeWidth = 1;
              }
            }

            return (
              <g key={idx}>
                {/* Visual Path */}
                <path
                  d={pathString}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  markerEnd={selectedNode && isRelated ? "url(#arrow-active)" : conn.type === "positive" ? "url(#arrow-positive)" : "url(#arrow-negative)"}
                  className="transition-all duration-300"
                />
                
                {/* Dynamic animated flow particles running along active paths */}
                {(!selectedNode || isFromActive) && (
                  <path
                    d={pathString}
                    fill="none"
                    stroke={conn.type === "positive" ? "#10b981" : "#ef4444"}
                    strokeWidth={strokeWidth + 0.5}
                    strokeDasharray="8, 40"
                    strokeDashoffset="0"
                    className="animate-[dash_3s_linear_infinite]"
                    style={{
                      opacity: selectedNode ? 0.9 : 0.4,
                    }}
                  />
                )}
              </g>
            );
          })}

          {/* Node Circles */}
          {CAUSAL_NODES.map((node) => {
            const isSelected = selectedNode === node.id;
            const isRelated =
              selectedNode === null ||
              isSelected ||
              CAUSAL_CONNECTIONS.some(
                (c) =>
                  (c.from === selectedNode && c.to === node.id) ||
                  (c.to === selectedNode && c.from === node.id)
              );

            const opacityClass = isRelated ? "opacity-100" : "opacity-25";
            const scale = isSelected ? 1.15 : 1;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y}) scale(${scale})`}
                onClick={() => setSelectedNode(isSelected ? null : node.id)}
                className={`cursor-pointer select-none transition-all duration-300 ${opacityClass}`}
              >
                {/* Back Outer Aura */}
                <circle
                  r="26"
                  fill="transparent"
                  stroke={node.color}
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  className={`${isSelected ? "animate-[spin_10s_linear_infinite]" : ""}`}
                />

                {/* Main Core Solid */}
                <circle
                  r="20"
                  fill="#050505"
                  stroke={isSelected ? "#10b981" : node.color}
                  strokeWidth={isSelected ? 3 : 2}
                  className="shadow-lg transition-all"
                />

                {/* Inner Glow Center */}
                <circle r="4" fill={node.color} />

                {/* Node Label Text */}
                <text
                  y="36"
                  textAnchor="middle"
                  fill="#e2e8f0"
                  className="text-[10px] font-sans font-medium tracking-tight fill-slate-200 pointer-events-none"
                >
                  {node.label}
                </text>

                {/* Value Text Overlay */}
                <text
                  y="-28"
                  textAnchor="middle"
                  fill={node.color}
                  className="text-[9px] font-mono font-medium tracking-tighter fill-cyan-400 pointer-events-none"
                >
                  {formatNodeValue(node.id)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover/Tap Hint */}
        {!selectedNode && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-[#080808]/90 border border-[#1A1A1A] text-[10px] text-[#888] px-2.5 py-1 rounded font-mono">
            <Info className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Select nodes to analyze systemic feedback</span>
          </div>
        )}
      </div>

      {/* Selected Node Details */}
      <div className="mt-4 min-h-[90px] border-t border-[#1A1A1A] pt-3 flex flex-col justify-center">
        {activeNode ? (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
                style={{ backgroundColor: activeNode.color }}
              />
              <span className="font-sans font-medium text-white text-xs">
                {activeNode.label} Analysis
              </span>
              <span className="text-[9px] font-mono text-[#888] bg-[#080808] px-1.5 py-0.5 rounded border border-[#1A1A1A] ml-auto">
                Current: {activeNode.value}
              </span>
            </div>
            <p className="text-[11px] text-[#AAA] leading-relaxed">
              {activeNode.description}
            </p>

            {/* Direct Feedbacks Summary */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {activeConnections.map((c, idx) => {
                const isFrom = c.from === selectedNode;
                const otherNode = isFrom
                  ? CAUSAL_NODES.find((n) => n.id === c.to)
                  : CAUSAL_NODES.find((n) => n.id === c.from);
                
                return (
                  <span
                    key={idx}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                      c.type === "positive"
                        ? "bg-emerald-950/10 border-emerald-900/20 text-[#10B981]"
                        : "bg-rose-950/10 border-rose-900/20 text-rose-400"
                    }`}
                  >
                    {isFrom ? `→ Influences ${otherNode?.label}` : `← Driven by ${otherNode?.label}`} ({c.type === "positive" ? "+" : "-"})
                  </span>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-[11px] text-[#555] leading-normal italic font-sans">
            Planetary variables interact with complex non-linear feedbacks.
            <br />
            Adjusting a policy creates systemic multipliers across all nodes.
          </div>
        )}
      </div>
    </div>
  );
};
