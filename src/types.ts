/**
 * Aethera Digital Twin Types and Interfaces
 */

export interface SystemState {
  year: number;
  gdp: number; // Trillion USD
  resources: number; // % (0-100)
  co2: number; // °C temperature deviation above pre-industrial (e.g. 1.25)
  tech: number; // technology index (0-100+)
  social: number; // social stability % (0-100)
}

export interface PolicyState {
  carbonTax: number; // % (0-100)
  techSubsidies: number; // % (0-100)
  resourceQuota: number; // % (0-100)
  welfareDividend: number; // % (0-100)
}

export interface AgentDecision {
  id: "sovereign" | "eco" | "tech" | "citizen";
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
  category: "ecological" | "financial" | "social" | "technological";
}

export interface SystemModifiers {
  gdpModifier: number;
  resourceModifier: number;
  co2Modifier: number;
  techModifier: number;
  socialModifier: number;
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
