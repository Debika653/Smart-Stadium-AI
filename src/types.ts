/**
 * Smart Stadium AI Digital Twin Types and Interfaces
 */

export interface SystemState {
  year: number; // Matches the "Match Day" or simulated scenario step
  crowdFlow: number; // Crowd Safety & Comfort Index (0-100%)
  transitFlow: number; // Transit & Shuttle Logistics (0-100%)
  carbonEmission: number; // Carbon Emissions per Match (e.g. 1.28 tons)
  smartGrid: number; // Smart Stadium Technology score (0-100+)
  staffReadiness: number; // Volunteer & Staff Readiness (0-100%)
}

export interface PolicyState {
  greenPower: number; // Green Energy & Solar Grid Allocation (0-100%)
  smartRouting: number; // AI Crowd Routing & IoT Tech Subsidy (0-100%)
  transitDispatch: number; // Transit Shuttles & Dispatching Rate (0-100%)
  staffSupport: number; // Volunteer Incentives & Support Allocation (0-100%)
}

export interface AgentDecision {
  id: "stadium_ops" | "eco_sustainability" | "safety_security" | "fan_experience";
  name: string;
  statement: string;
  internalReasoning: string;
  tokenAllocation: number;
  policyVote: string;
}

export interface SimulationTickLog {
  year: number;
  state: SystemState;
  policies: PolicyState;
  activeCrisis: CrisisEvent | null;
  agentDecisions: AgentDecision[] | null;
  decreeTitle?: string;
  decreeText?: string;
}

export interface CrisisEvent {
  id: string;
  title: string;
  severity: number; // 1-10
  description: string;
  category: "ecological" | "transit" | "safety" | "operational";
}

export interface SystemModifiers {
  crowdFlowModifier: number;
  transitFlowModifier: number;
  carbonEmissionModifier: number;
  smartGridModifier: number;
  staffReadinessModifier: number;
}

export interface NodePosition {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  description: string;
  value: string;
}

export interface NodeConnection {
  from: string;
  to: string;
  type: "positive" | "negative";
  label: string;
}
