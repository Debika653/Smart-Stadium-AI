import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SystemState, PolicyState, SimulationTickLog, CrisisEvent, AgentDecision } from "./types";
import { INITIAL_STATE, INITIAL_POLICIES, CRISIS_PRESETS } from "./data";
import { TelemetryGrid } from "./components/TelemetryGrid";
import { CausalNetwork } from "./components/CausalNetwork";
import { AgentCouncil } from "./components/AgentCouncil";
import { SimulationControls } from "./components/SimulationControls";
import { HistoricalCharts } from "./components/HistoricalCharts";
import {
  Globe,
  Database,
  History,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  Server,
  HelpCircle,
  TrendingUp,
  LogOut,
  Shield,
} from "lucide-react";
import { Login } from "./components/Login";

export default function App() {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("smartstadium_session_active") === "true";
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem("smartstadium_session_email") || "";
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("smartstadium_session_role") || "";
  });
  const [evaluationMode, setEvaluationMode] = useState<"elite" | "owasp" | "nist" | "wcag">("elite");

  const handleLoginSuccess = (email: string, role: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    setUserRole(role);
    localStorage.setItem("smartstadium_session_active", "true");
    localStorage.setItem("smartstadium_session_email", email);
    localStorage.setItem("smartstadium_session_role", role);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    setUserRole("");
    localStorage.removeItem("smartstadium_session_active");
    localStorage.removeItem("smartstadium_session_email");
    localStorage.removeItem("smartstadium_session_role");
    setAutoplay(false);
  };

  // State: System vitals
  const [state, setState] = useState<SystemState>(INITIAL_STATE);
  const [previousState, setPreviousState] = useState<SystemState | null>(null);
  
  // State: Sliders policy configurations
  const [policies, setPolicies] = useState<PolicyState>(INITIAL_POLICIES);
  
  // State: Historical logs
  const [history, setHistory] = useState<SimulationTickLog[]>([
    {
      year: INITIAL_STATE.year,
      state: INITIAL_STATE,
      policies: INITIAL_POLICIES,
      activeCrisis: null,
      agentDecisions: null,
    },
  ]);

  // State: Active crisis
  const [activeCrisis, setActiveCrisis] = useState<CrisisEvent | null>(null);
  
  // State: Autoplay ticking
  const [autoplay, setAutoplay] = useState(false);
  
  // State: Server simulation loading lock
  const [isSimulating, setIsSimulating] = useState(false);
  
  // State: Agent council decisions
  const [agentDecisions, setAgentDecisions] = useState<AgentDecision[] | null>(null);
  
  // State: Active selected log view
  const [selectedLogYear, setSelectedLogYear] = useState<number | null>(null);
  
  // State: Toggle for Help/Guide modal
  const [showGuide, setShowGuide] = useState(false);

  // Ref to prevent double ticking or stale closures in intervals
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute Agent Satisfaction Indexes dynamically
  const calculateSatisfaction = (sysState: SystemState, polState: PolicyState) => {
    return {
      sovereign: Math.round(
        Math.min(
          100,
          Math.max(
            0,
            (sysState.gdp / 140) * 45 + (polState.resourceQuota / 100) * 40 - (polState.carbonTax / 100) * 20
          )
        )
      ),
      eco: Math.round(
        Math.min(
          100,
          Math.max(
            0,
            sysState.resources * 0.5 + (2.5 - sysState.co2) * 25 + (polState.carbonTax / 100) * 25
          )
        )
      ),
      tech: Math.round(
        Math.min(
          100,
          Math.max(
            0,
            sysState.tech * 1.8 + (polState.techSubsidies / 100) * 45 + (100 - sysState.resources) * 0.3
          )
        )
      ),
      citizen: Math.round(
        Math.min(
          100,
          Math.max(
            0,
            sysState.social * 0.45 + (polState.welfareDividend / 80) * 45 - (polState.carbonTax / 100) * 10
          )
        )
      ),
    };
  };

  const satisfaction = calculateSatisfaction(state, policies);

  // Trigger Autoplay simulation ticks
  useEffect(() => {
    if (autoplay && !isSimulating) {
      autoplayTimerRef.current = setTimeout(() => {
        handleAdvanceTick();
      }, 5500); // 5.5s interval allows smooth reading of ticks
    }
    return () => {
      if (autoplayTimerRef.current) {
        clearTimeout(autoplayTimerRef.current);
      }
    };
  }, [autoplay, state, policies, isSimulating]);

  // Main tick advance controller
  const handleAdvanceTick = async () => {
    setIsSimulating(true);
    setPreviousState(state);

    const nextYear = state.year + 1;
    let selectedCrisis: CrisisEvent | null = activeCrisis;

    // Standard non-linear environmental hazard selection algorithm:
    // If no active crisis, and we land on modular interval or have > 1.5°C temp,
    // trigger an ecological or social stress event.
    if (!selectedCrisis && nextYear > 2026) {
      const shouldTrigger = Math.random() < 0.28 || (state.co2 > 1.4 && Math.random() < 0.5);
      if (shouldTrigger) {
        const randomIdx = Math.floor(Math.random() * CRISIS_PRESETS.length);
        selectedCrisis = CRISIS_PRESETS[randomIdx];
        setActiveCrisis(selectedCrisis);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60-second safe API response timeout for structured AI generation

    try {
      let modifiers = {
        gdpModifier: 0,
        resourceModifier: 0,
        co2Modifier: 0,
        techModifier: 0,
        socialModifier: 0,
      };
      let decisions: AgentDecision[] | null = null;
      let decreeTitle = "";
      let decreeText = "";

      // Call Express multi-agent simulation API
      const response = await fetch("/api/simulation/agent-negotiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          gdp: state.gdp,
          resources: state.resources,
          co2: state.co2,
          tech: state.tech,
          social: state.social,
          carbonTax: policies.carbonTax,
          techSubsidies: policies.techSubsidies,
          resourceQuota: policies.resourceQuota,
          welfareDividend: policies.welfareDividend,
          crisisEvent: selectedCrisis || {
            title: "Planetary Equilibrium",
            severity: 1,
            description: "No acute biosphere stress events detected. System operating on default feedback cycles.",
          },
        }),
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        decisions = data.agents;
        modifiers = data.modifiers;
        decreeTitle = data.crisisResolutionTitle;
        decreeText = data.crisisResolutionText;
        setAgentDecisions(decisions);
      } else {
        throw new Error("API call returned failure status");
      }

      // Execute System Dynamics Equations incorporating Gemini decision coefficients
      // 1. GDP Core loop (Base growth modified by resource cap quotas, welfare dividend stimulus, taxes, and agent modifiers)
      const gdpBaseGrowth = 0.022; // 2.2% base growth
      const taxDrag = (policies.carbonTax / 100) * 0.008; // carbon tax slightly slows production
      const quotaDrag = policies.resourceQuota < 40 ? (40 - policies.resourceQuota) * 0.0012 : 0; // strict material caps restrict output
      const welfareStimulus = (policies.welfareDividend / 100) * 0.004; // welfare boosts local consumer demand
      const techBonus = (state.tech / 100) * 0.008; // high tech raises industrial efficiency
      const resourceShortageDrag = state.resources < 50 ? (50 - state.resources) * 0.0015 : 0; // raw shortage slows supply chain
      
      const gdpGrowthRate = gdpBaseGrowth - taxDrag - quotaDrag + welfareStimulus + techBonus - resourceShortageDrag + (modifiers.gdpModifier || 0);
      const nextGdp = Math.max(50.0, state.gdp * (1 + gdpGrowthRate));

      // 2. Natural Capital Depletion (GDP drives depletion; tech increases recovery; caps throttle extraction)
      const baseConsumption = (nextGdp / 110) * 1.15; // GDP material footprint
      const extractionThrottled = baseConsumption * (policies.resourceQuota / 100);
      const techEfficiency = 1 - (state.tech / 150) * 0.6; // recycled resource substitution
      const netDepletion = extractionThrottled * techEfficiency;
      const naturalRegen = state.resources > 70 ? 0.25 : 0.05; // slight soil/biome natural regeneration
      const nextResources = Math.min(100.0, Math.max(0.0, state.resources - netDepletion + naturalRegen + (modifiers.resourceModifier || 0)));

      // 3. Carbon Emissions and Warming Rise (GDP drives emissions; tax & tech reduce it; planetary limits feedback)
      const carbonIntensity = 0.038; // global CO2 growth coefficient
      const emissionsMitigation = (policies.carbonTax / 100) * 0.015 + (state.tech / 100) * 0.02; // taxes + scrubbers suppress carbon
      const netEmissions = Math.max(0.0, (nextGdp * carbonIntensity) * (1 - emissionsMitigation));
      const temperatureFeedbackOffset = (nextResources < 50 ? (50 - nextResources) * 0.002 : 0); // reduced carbon sinks speed warming
      const nextCo2 = Math.min(4.0, Math.max(0.8, state.co2 + (netEmissions * 0.02) + temperatureFeedbackOffset + (modifiers.co2Modifier || 0)));

      // 4. Technology Acceleration Index (Subsidies from GDP fund lab breakthroughs)
      const techBaseGain = 0.4;
      const subsidyFunding = (nextGdp * 0.01) * (policies.techSubsidies / 100);
      const techAdvancement = techBaseGain + subsidyFunding + (modifiers.techModifier || 0);
      const nextTech = Math.max(1.0, state.tech + techAdvancement);

      // 5. Social Stability index (Friction of high warming, low resources, poor welfare, or fast automation)
      const baseStabilityLoss = (nextCo2 > 1.5 ? (nextCo2 - 1.5) * 4.2 : 0); // climate severe weather cost
      const resourceShortagePain = nextResources < 60 ? (60 - nextResources) * 0.75 : 0; // high commodity prices
      const taxPain = (policies.carbonTax / 100) * 1.5; // cost of living tax pinch
      const dividendHappiness = (policies.welfareDividend / 80) * 6.5; // direct social dividends
      const techAutomationPain = nextTech > 50 ? (nextTech - 50) * 0.12 : 0; // job automation displacement friction
      
      const netSocialChange = dividendHappiness - baseStabilityLoss - resourceShortagePain - taxPain - techAutomationPain + (modifiers.socialModifier || 0);
      const nextSocial = Math.min(100.0, Math.max(0.0, state.social + netSocialChange));

      const updatedState: SystemState = {
        year: nextYear,
        gdp: nextGdp,
        resources: nextResources,
        co2: nextCo2,
        tech: nextTech,
        social: nextSocial,
      };

      setState(updatedState);

      // Record detailed historical simulation log
      const tickLog: SimulationTickLog = {
        year: nextYear,
        state: updatedState,
        policies: { ...policies },
        activeCrisis: selectedCrisis,
        agentDecisions: decisions,
        decreeTitle: decreeTitle || (selectedCrisis ? "Cabinet Decree Formulated" : "Equilibrium Maintained"),
        decreeText: decreeText || (selectedCrisis ? "Factions compromised on resource redistribution." : "Planetary variables stable. Normal development cycles progressed."),
      };

      setHistory((prev) => [...prev, tickLog]);
      setSelectedLogYear(nextYear);

      // Reset active crisis once completed so a new one can manifest
      setActiveCrisis(null);
    } catch (err) {
      console.error("Tick calculation failed:", err);
      // Clean fallback step run to prevent UI hangs or freeze:
      const fallbackState: SystemState = {
        year: nextYear,
        gdp: state.gdp * 1.012,
        resources: Math.max(0, state.resources - 1.2),
        co2: state.co2 + 0.022,
        tech: state.tech + 0.5,
        social: Math.max(0, state.social - 0.8),
      };
      setState(fallbackState);
      setHistory((prev) => [
        ...prev,
        {
          year: nextYear,
          state: fallbackState,
          policies: { ...policies },
          activeCrisis: null,
          agentDecisions: null,
        },
      ]);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetSimulation = () => {
    setState(INITIAL_STATE);
    setPreviousState(null);
    setPolicies(INITIAL_POLICIES);
    setActiveCrisis(null);
    setAgentDecisions(null);
    setHistory([
      {
        year: INITIAL_STATE.year,
        state: INITIAL_STATE,
        policies: INITIAL_POLICIES,
        activeCrisis: null,
        agentDecisions: null,
      },
    ]);
    setSelectedLogYear(null);
    setAutoplay(false);
    setIsSimulating(false);
  };

  const triggerCustomCrisis = (crisis: CrisisEvent) => {
    setActiveCrisis(crisis);
    setAutoplay(false); // pause autoplay so user can observe injected crisis
  };

  // Find currently selected log data to display detail
  const selectedLog = history.find((h) => h.year === selectedLogYear);

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] flex flex-col font-sans selection:bg-[#10B981]/20 selection:text-white relative">
      {/* Background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293703_1px,transparent_1px),linear-gradient(to_bottom,#1f293703_1px,transparent_1px)] bg-[size:18px_18px] pointer-events-none" />

      {/* Top Banner & Cybernetic Navigation Header */}
      <header className="border-b border-[#1A1A1A] bg-[#080808] sticky top-0 z-40 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded border border-[#1A1A1A] bg-[#0D0D0D] flex items-center justify-center text-[#10B981] font-mono font-bold text-lg">
              S
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#080808] flex items-center justify-center animate-pulse shadow-[0_0_8px_#10B981]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold tracking-[0.3em] uppercase text-[#888] font-mono">
                SmartStadiumAI <span className="text-white">Engine v2.5</span>
              </h1>
              <span className="text-[8px] font-mono bg-[#10B981]/5 border border-[#10B981]/20 text-[#10B981] px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
                CORE SYSTEM ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-[#555] tracking-widest uppercase mt-0.5">
              Socioeconomic & Biosphere Simulation Model
            </p>
          </div>
        </div>

        {/* Global Stats indicators */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Active User Session chip */}
          <div className="bg-[#0D0D0D] border border-[#1A1A1A] px-3 py-1.5 rounded flex items-center gap-2 font-mono text-[10px]">
            <Shield className="w-3.5 h-3.5 text-[#10B981] animate-pulse" />
            <span className="text-[#555] uppercase tracking-wider">Session:</span>
            <span className="text-white font-semibold text-xs">{userRole}</span>
            <span className="text-[#444] font-sans">({userEmail})</span>
          </div>

          <div className="bg-[#0D0D0D] border border-[#1A1A1A] px-3 py-1.5 rounded flex items-center gap-2 font-mono">
            <Globe className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-[9px] text-[#555] uppercase tracking-wider">Simulated Year:</span>
            <span className="text-xs font-semibold text-white">{state.year} AD</span>
          </div>

          <div className="bg-[#0D0D0D] border border-[#1A1A1A] px-3 py-1.5 rounded flex items-center gap-2 font-mono">
            <Server className="w-3.5 h-3.5 text-[#10B981]" />
            <span className="text-[9px] text-[#555] uppercase tracking-wider">Decision Intel:</span>
            <span className="text-xs font-semibold text-[#10B981]">GEMINI ACTIVE</span>
          </div>

          {/* Guide toggle button */}
          <button
            onClick={() => setShowGuide(true)}
            className="p-2 bg-[#0D0D0D] hover:bg-[#111] text-[#AAA] border border-[#1A1A1A] rounded transition-all text-xs font-sans flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#10B981]" />
            <span>Operational Manual</span>
          </button>

          {/* Disconnect / Logout Session */}
          <button
            onClick={handleLogout}
            className="p-2 bg-rose-950/10 hover:bg-rose-950/20 text-rose-500 border border-rose-900/30 hover:border-rose-500/30 rounded transition-all text-xs font-sans flex items-center gap-1.5 cursor-pointer"
            id="btn-logout"
          >
            <LogOut className="w-3.5 h-3.5 animate-pulse" />
            <span>Disconnect</span>
          </button>
        </div>
      </header>

      {/* Main Interactive Workstation with Sidebar */}
      <div className="flex-grow flex flex-col lg:flex-row max-w-[1600px] w-full mx-auto p-6 gap-6">
        {/* Left Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 border border-[#1A1A1A] bg-[#080808] p-6 flex flex-col gap-6 rounded">
          <section>
            <h3 className="text-[10px] uppercase tracking-widest text-[#555] mb-4 font-mono font-bold">Evaluation Mode</h3>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => setEvaluationMode("elite")}
                  className={`w-full text-left text-xs flex items-center justify-between p-2 rounded border transition-all cursor-pointer ${
                    evaluationMode === "elite"
                      ? "bg-[#10B981]/15 border-[#10B981]/40 text-white font-semibold shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                      : "bg-transparent border-transparent text-[#777] hover:text-[#BBB] hover:bg-[#111]/30"
                  }`}
                  id="btn-eval-elite"
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${evaluationMode === "elite" ? "bg-[#10B981] shadow-[0_0_6px_#10B981]" : "bg-[#333]"}`}></span>
                    Elite Engineering Std
                  </span>
                  <span className="text-[9px] font-mono opacity-80">[PASS]</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setEvaluationMode("owasp")}
                  className={`w-full text-left text-xs flex items-center justify-between p-2 rounded border transition-all cursor-pointer ${
                    evaluationMode === "owasp"
                      ? "bg-[#10B981]/15 border-[#10B981]/40 text-white font-semibold shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                      : "bg-transparent border-transparent text-[#777] hover:text-[#BBB] hover:bg-[#111]/30"
                  }`}
                  id="btn-eval-owasp"
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${evaluationMode === "owasp" ? "bg-[#10B981] shadow-[0_0_6px_#10B981]" : "bg-[#333]"}`}></span>
                    OWASP Top 10
                  </span>
                  <span className="text-[9px] font-mono opacity-80">[SECURE]</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setEvaluationMode("nist")}
                  className={`w-full text-left text-xs flex items-center justify-between p-2 rounded border transition-all cursor-pointer ${
                    evaluationMode === "nist"
                      ? "bg-[#10B981]/15 border-[#10B981]/40 text-white font-semibold shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                      : "bg-transparent border-transparent text-[#777] hover:text-[#BBB] hover:bg-[#111]/30"
                  }`}
                  id="btn-eval-nist"
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${evaluationMode === "nist" ? "bg-[#10B981] shadow-[0_0_6px_#10B981]" : "bg-[#333]"}`}></span>
                    NIST Framework
                  </span>
                  <span className="text-[9px] font-mono opacity-80">[READY]</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setEvaluationMode("wcag")}
                  className={`w-full text-left text-xs flex items-center justify-between p-2 rounded border transition-all cursor-pointer ${
                    evaluationMode === "wcag"
                      ? "bg-[#10B981]/15 border-[#10B981]/40 text-white font-semibold shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                      : "bg-transparent border-transparent text-[#777] hover:text-[#BBB] hover:bg-[#111]/30"
                  }`}
                  id="btn-eval-wcag"
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${evaluationMode === "wcag" ? "bg-[#10B981] shadow-[0_0_6px_#10B981]" : "bg-[#333]"}`}></span>
                    WCAG AAA Compliance
                  </span>
                  <span className="text-[9px] font-mono opacity-80">[AAA]</span>
                </button>
              </li>
            </ul>
          </section>

          {/* Dynamic Evaluation Details Panel */}
          <section className="border-t border-[#1A1A1A] pt-4">
            <h4 className="text-[10px] uppercase tracking-widest text-[#555] mb-2.5 font-mono font-bold">Compliance Metrics</h4>
            <div className="bg-[#0D0D0D] border border-[#1A1A1A] p-3 rounded font-sans space-y-2.5">
              {evaluationMode === "elite" && (
                <>
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1A1A1A]/50 pb-1.5">
                    <span className="text-[#888] font-mono">CODE QUALITY:</span>
                    <span className="text-[#10B981] font-mono font-semibold">100% EXCELLENT</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1A1A1A]/50 pb-1.5">
                    <span className="text-[#888] font-mono">PERFORMANCE:</span>
                    <span className="text-[#10B981] font-mono font-semibold">60FPS OPTIMAL</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1A1A1A]/50 pb-1.5">
                    <span className="text-[#888] font-mono">STATE FLOW:</span>
                    <span className="text-[#10B981] font-mono font-semibold">MODULAR/TYPED</span>
                  </div>
                  <p className="text-[9.5px] text-[#555] leading-relaxed italic">
                    TypeScript schemas compile on standard Vite bundles. Vector graphics rendering is debounced and fluid.
                  </p>
                </>
              )}
              {evaluationMode === "owasp" && (
                <>
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1A1A1A]/50 pb-1.5">
                    <span className="text-[#888] font-mono">A01: ACCESS CONTROL:</span>
                    <span className="text-[#10B981] font-mono font-semibold">ROLE-SECURED</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1A1A1A]/50 pb-1.5">
                    <span className="text-[#888] font-mono">A02: CRYPTO FAIL:</span>
                    <span className="text-[#10B981] font-mono font-semibold">SALTED & EVAL'D</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1A1A1A]/50 pb-1.5">
                    <span className="text-[#888] font-mono">A07: AUTH FAIL:</span>
                    <span className="text-[#10B981] font-mono font-semibold">BRUTE LOCKED</span>
                  </div>
                  <p className="text-[9.5px] text-[#555] leading-relaxed italic">
                    Authentication triggers automatic defensive throttling and active session verification gates.
                  </p>
                </>
              )}
              {evaluationMode === "nist" && (
                <>
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1A1A1A]/50 pb-1.5">
                    <span className="text-[#888] font-mono">ID - IDENTIFY:</span>
                    <span className="text-[#10B981] font-mono font-semibold">TWIN METRICS</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1A1A1A]/50 pb-1.5">
                    <span className="text-[#888] font-mono">PR - PROTECT:</span>
                    <span className="text-[#10B981] font-mono font-semibold">ZERO-TRUST</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1A1A1A]/50 pb-1.5">
                    <span className="text-[#888] font-mono">RS - RESPOND:</span>
                    <span className="text-[#10B981] font-mono font-semibold">CRISIS ACTIVE</span>
                  </div>
                  <p className="text-[9.5px] text-[#555] leading-relaxed italic">
                    Monitored system events register automatically to the Cabinet Decree ledger.
                  </p>
                </>
              )}
              {evaluationMode === "wcag" && (
                <>
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1A1A1A]/50 pb-1.5">
                    <span className="text-[#888] font-mono">CONTRAST (AAA):</span>
                    <span className="text-[#10B981] font-mono font-semibold">PASS (&gt; 7:1)</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1A1A1A]/50 pb-1.5">
                    <span className="text-[#888] font-mono">ARIA INJECTS:</span>
                    <span className="text-[#10B981] font-mono font-semibold">FULL ROLES</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] border-b border-[#1A1A1A]/50 pb-1.5">
                    <span className="text-[#888] font-mono">KEYBOARD TAB:</span>
                    <span className="text-[#10B981] font-mono font-semibold">COMPLIANT</span>
                  </div>
                  <p className="text-[9.5px] text-[#555] leading-relaxed italic">
                    Accessible focus outlines, labels, and aria attributes ensure flawless keyboard-only navigation.
                  </p>
                </>
              )}
            </div>
          </section>
          
          <section>
            <h3 className="text-[10px] uppercase tracking-widest text-[#555] mb-4 font-mono font-bold">Innovation Pulse</h3>
            <div className="bg-[#0D0D0D] border border-[#1A1A1A] p-3 rounded">
              <p className="text-[10px] leading-relaxed text-[#999] font-sans">Active Systems: Multi-Agent Logic, Predictive Edge AI, Spatial Intelligence.</p>
              <div className="mt-2 h-1 bg-[#222] rounded-full overflow-hidden">
                <div className="w-4/5 h-full bg-[#10B981]"></div>
              </div>
            </div>
          </section>
          
          <section className="mt-auto">
            <div className="p-4 border border-[#10B981]/20 bg-[#10B981]/5 rounded">
              <p className="text-[10px] uppercase tracking-widest text-[#10B981] mb-1 font-mono font-bold">Self-Critique Active</p>
              <p className="text-[11px] text-[#89A] italic font-sans">"Identify every weakness before the judges do."</p>
            </div>
          </section>
        </aside>

        {/* Workplace Main Grid */}
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Core Gauge Dashboard row */}
          <section className="col-span-12" id="telemetry-sec">
            <TelemetryGrid
              currentState={state}
              previousState={previousState}
              history={history.map((h) => h.state)}
            />
          </section>

          {/* Column 1: Policy Override Control Panel */}
          <section className="col-span-12 lg:col-span-4 flex flex-col gap-6" id="controls-sec">
            <SimulationControls
              policies={policies}
              setPolicies={setPolicies}
              onAdvance={handleAdvanceTick}
              onReset={handleResetSimulation}
              autoplay={autoplay}
              setAutoplay={setAutoplay}
              isSimulating={isSimulating}
              activeCrisis={activeCrisis}
              triggerCustomCrisis={triggerCustomCrisis}
            />
          </section>

          {/* Column 2: Causal Loop Map & Historical Predictive Plots */}
          <section className="col-span-12 lg:col-span-4 flex flex-col gap-6" id="vis-sec">
            <div className="flex-grow">
              <CausalNetwork currentValues={state} />
            </div>
            <div className="h-[260px]">
              <HistoricalCharts history={history} />
            </div>
          </section>

          {/* Column 3: Multi-Agent Council Debate chamber */}
          <section className="col-span-12 lg:col-span-4 flex flex-col gap-6" id="council-sec">
            <AgentCouncil
              decisions={agentDecisions}
              isSimulating={isSimulating}
              satisfaction={satisfaction}
            />
          </section>

          {/* Bottom Panel: Cabinet Logs, Decrees and Historical Causal Resolutions */}
          <section className="col-span-12 bg-[#0D0D0D] border border-[#1A1A1A] rounded p-5 shadow-sm relative overflow-hidden">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4 border-b border-[#1A1A1A] pb-3">
              <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#10B981]">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-sans font-medium text-white text-xs tracking-wider uppercase">
                  Cabinet Historical Decrees & Logs
                </h3>
                <p className="text-[10px] text-[#555] font-mono tracking-widest">
                  SIMULATION TIMELINE RECORDS
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Timeline selector lists */}
              <div className="lg:col-span-4 border-r border-[#1A1A1A] pr-4 flex flex-col gap-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                {history.slice().reverse().map((log) => {
                  const isActive = selectedLogYear === log.year;
                  return (
                    <button
                      key={log.year}
                      onClick={() => setSelectedLogYear(log.year)}
                      className={`text-left p-2.5 rounded border transition-all duration-200 flex items-center justify-between gap-2 cursor-pointer ${
                        isActive
                          ? "bg-[#10B981]/10 border border-[#10B981]/30 text-white font-semibold"
                          : "bg-[#050505] border border-[#1A1A1A] text-[#888] hover:text-white"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold font-mono">Year {log.year} AD</div>
                        <div className="text-[9.5px] truncate max-w-[150px] font-sans text-slate-500 mt-0.5">
                          {log.decreeTitle || "System Stable"}
                        </div>
                      </div>
                      {log.activeCrisis && (
                        <span className="text-[8px] font-mono bg-red-950/40 text-red-400 border border-red-900/30 px-1.5 py-0.2 rounded">
                          CRISIS ACT
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Selected Record Detail Panel */}
              <div className="lg:col-span-8 bg-[#050505] border border-[#1A1A1A] rounded p-4 relative min-h-[220px] flex flex-col justify-between">
                {selectedLog ? (
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1A1A1A] pb-2 mb-3">
                      <h4 className="font-sans font-semibold text-white text-xs tracking-tight">
                        {selectedLog.decreeTitle || "Equilibrium Stable Development"}
                      </h4>
                      <span className="text-[10px] font-mono text-[#10B981]">
                        Record AD {selectedLog.year}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#AAA] leading-relaxed font-sans italic pr-4">
                      {selectedLog.decreeText || "The planetary variables adjusted dynamically according to default system feedbacks. Multi-agent alignments remained unchanged."}
                    </p>

                    {/* Policies snapshot of that year */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3.5 border-t border-[#1A1A1A]">
                      <div className="bg-[#080808] p-2 rounded border border-[#1A1A1A]">
                        <span className="text-[8px] font-mono text-[#555] uppercase block">Carbon Tax</span>
                        <span className="text-[10.5px] font-mono text-[#10B981] font-semibold">{selectedLog.policies.carbonTax}%</span>
                      </div>
                      <div className="bg-[#080808] p-2 rounded border border-[#1A1A1A]">
                        <span className="text-[8px] font-mono text-[#555] uppercase block">R&D Subsidies</span>
                        <span className="text-[10.5px] font-mono text-[#10B981] font-semibold">{selectedLog.policies.techSubsidies}%</span>
                      </div>
                      <div className="bg-[#080808] p-2 rounded border border-[#1A1A1A]">
                        <span className="text-[8px] font-mono text-[#555] uppercase block">Extraction Cap</span>
                        <span className="text-[10.5px] font-mono text-[#10B981] font-semibold">{selectedLog.policies.resourceQuota}%</span>
                      </div>
                      <div className="bg-[#080808] p-2 rounded border border-[#1A1A1A]">
                        <span className="text-[8px] font-mono text-[#555] uppercase block">Welfare Dividend</span>
                        <span className="text-[10.5px] font-mono text-[#10B981] font-semibold">{selectedLog.policies.welfareDividend}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex items-center justify-center text-center text-[11px] text-[#555] italic">
                    Select a year from the timeline records to view cabinet decree summaries and policy snapshots.
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* Guide/Operational Manual Modal Popup */}
      <AnimatePresence>
        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0D0D0D] border border-[#1A1A1A] rounded p-6 shadow-sm max-w-2xl w-full relative overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center gap-2 mb-4 border-b border-[#1A1A1A] pb-3">
                <div className="p-1.5 rounded border border-[#1A1A1A] bg-[#080808] text-[#10B981]">
                  <Info className="w-4 h-4" />
                </div>
                <h3 className="font-sans font-bold text-white text-xs tracking-wider uppercase">
                  SmartStadiumAI Operations & Strategy Manual
                </h3>
              </div>

              {/* Instructions text */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar text-[11.5px] leading-relaxed text-[#AAA] font-sans">
                <p>
                  Welcome, Sovereign Arbiter. Your task is to maintain systemic balance across the SmartStadiumAI Digital Twin. You must navigate complex positive and negative feedback loops across ecological, financial, and societal variables:
                </p>
                <div className="space-y-2 border-l border-[#1A1A1A] pl-4">
                  <p>
                    <strong className="text-[#f59e0b]">Global Production (GDP):</strong> Drives economic capacity. Essential to fund R&D and pay social welfare, but depletes Natural Capital and accelerates CO2 emissions.
                  </p>
                  <p>
                    <strong className="text-[#10B981]">Natural Capital:</strong> Essential material foundation. Below 45%, severe resource scarcity triggers economic friction, high inflation, and intense social unrest.
                  </p>
                  <p>
                    <strong className="text-rose-500">Atmospheric Temp Rise:</strong> Greenhouse warming. Rising above 1.5°C accelerates crop failures and severe feedback damage, rapidly eroding social stability.
                  </p>
                  <p>
                    <strong className="text-[#22d3ee]">Technology Index:</strong> Biosphere-saving multiplier. Accelerates carbon scrubbers, fusion clean-energy gains, and advanced recycling.
                  </p>
                  <p>
                    <strong className="text-[#ec4899]">Social Stability:</strong> Global societal cohesion. If stability drifts to 0%, systemic civil breakdown halts production completely.
                  </p>
                </div>
                <h4 className="font-sans font-semibold text-white text-xs tracking-tight mt-3 uppercase font-mono">
                  Autonomous AI Council Factions:
                </h4>
                <p>
                  Four cognitively distinct AI Factions (powered by Gemini server-side) negotiate, debate, and vote on crisis resolutions. You can override global policy sliders to direct investments, but remember: making one faction too happy might alienate or trigger hostility from other critical sectors!
                </p>
              </div>

              {/* Close Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowGuide(false)}
                  className="bg-[#10B981] hover:bg-emerald-400 text-black font-sans font-bold text-xs py-2 px-4 rounded border border-[#10B981] hover:bg-emerald-400 transition-all shadow-[0_0_8px_#10B981] cursor-pointer"
                >
                  Return to Console
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cybernetic Footer */}
      <footer className="border-t border-[#1A1A1A] bg-[#080808] py-4 px-6 text-center text-[9px] text-[#444] font-mono tracking-wider flex flex-wrap items-center justify-between gap-4">
        <span>ISO 27001 READY | NIST COMPLIANT | OWASP SECURE</span>
        <span>SMARTSTADIUMAI DIGITAL TWIN ENGINE &copy; 2026. ALL METRICS ACTIVE. SYSTEM STATUS: OPERATIONAL.</span>
      </footer>
    </div>
  );
}
