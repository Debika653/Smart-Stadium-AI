import { describe, it, expect } from "vitest";
import { INITIAL_STATE, INITIAL_POLICIES } from "../data";
import { SystemState, PolicyState } from "../types";

// Helper simulating App.tsx logic for unit testing system equations
function simulateStep(state: SystemState, policies: PolicyState, modifiers: any): SystemState {
  const crowdBaseGain = 0.5;
  const staffBoost = (state.staffReadiness / 100) * 1.5;
  const routingEfficiency = (policies.smartRouting / 100) * 1.8;
  const gridBonus = (state.smartGrid / 100) * 1.2;
  const transitBottleneck = state.transitFlow < 50 ? (50 - state.transitFlow) * 0.15 : 0;
  
  const crowdFlowGain = crowdBaseGain + staffBoost + routingEfficiency + gridBonus - transitBottleneck + (modifiers.crowdFlowModifier || 0);
  const nextCrowdFlow = Math.min(100.0, Math.max(30.0, state.crowdFlow + crowdFlowGain));

  const transitBaseGain = 0.4;
  const dispatchBonus = (policies.transitDispatch / 100) * 2.8;
  const smartGridBonus = (state.smartGrid / 100) * 1.5;
  const gateCrushDelay = state.crowdFlow < 60 ? (60 - state.crowdFlow) * 0.12 : 0;
  
  const transitGain = transitBaseGain + dispatchBonus + smartGridBonus - gateCrushDelay + (modifiers.transitFlowModifier || 0);
  const nextTransitFlow = Math.min(100.0, Math.max(30.0, state.transitFlow + transitGain));

  const baseEmissions = 1.35;
  const solarReduction = (policies.greenPower / 100) * 0.45;
  const routingReduction = (policies.smartRouting / 100) * 0.15;
  const activeTransitLoad = (policies.transitDispatch / 100) * 0.25;
  
  const emissionsCalculation = baseEmissions - solarReduction - routingReduction + activeTransitLoad + (modifiers.carbonEmissionModifier || 0);
  const nextCarbonEmission = Math.min(3.0, Math.max(0.1, emissionsCalculation));

  return {
    year: state.year + 1,
    crowdFlow: nextCrowdFlow,
    transitFlow: nextTransitFlow,
    carbonEmission: nextCarbonEmission,
    smartGrid: state.smartGrid,
    staffReadiness: state.staffReadiness,
  };
}

describe("Smart Stadium AI System Dynamics Tests", () => {
  it("should initialize correct initial states from configuration data", () => {
    expect(INITIAL_STATE.crowdFlow).toBe(85.0);
    expect(INITIAL_STATE.transitFlow).toBe(82.0);
    expect(INITIAL_STATE.carbonEmission).toBe(1.28);
    expect(INITIAL_STATE.smartGrid).toBe(15.0);
    expect(INITIAL_STATE.staffReadiness).toBe(78.0);
  });

  it("should process normal simulation transitions and enforce bounds", () => {
    const nextState = simulateStep(INITIAL_STATE, INITIAL_POLICIES, {
      crowdFlowModifier: 1.0,
      transitFlowModifier: -2.0,
      carbonEmissionModifier: 0.05,
    });

    expect(nextState.year).toBe(2);
    expect(nextState.crowdFlow).toBeGreaterThanOrEqual(30.0);
    expect(nextState.crowdFlow).toBeLessThanOrEqual(100.0);
    expect(nextState.transitFlow).toBeLessThan(100.0);
    expect(nextState.carbonEmission).toBeGreaterThanOrEqual(0.1);
  });

  it("should prevent system stats from exceeding maximum physical boundaries", () => {
    const extremeState: SystemState = {
      year: 10,
      crowdFlow: 99.5,
      transitFlow: 99.8,
      carbonEmission: 0.15,
      smartGrid: 98.0,
      staffReadiness: 99.0,
    };

    const nextState = simulateStep(extremeState, INITIAL_POLICIES, {
      crowdFlowModifier: 10.0,
      transitFlowModifier: 15.0,
      carbonEmissionModifier: -2.0,
    });

    expect(nextState.crowdFlow).toBe(100.0);
    expect(nextState.transitFlow).toBe(100.0);
    expect(nextState.carbonEmission).toBe(0.1); // minimum cap
  });
});
