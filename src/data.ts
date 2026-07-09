import { CrisisEvent, NodePosition, NodeConnection } from "./types";

export const INITIAL_STATE = {
  year: 1, // Match Day or Simulation Tick
  crowdFlow: 85.0, // Crowd Safety & Flow Index (0-100%)
  transitFlow: 82.0, // Transit & Logistics Efficiency (0-100%)
  carbonEmission: 1.28, // Carbon Emissions per Match (tons of CO2e)
  smartGrid: 15.0, // Smart Stadium IoT & AI Technology Index (0-100+)
  staffReadiness: 78.0, // Volunteer & Staff Readiness (0-100%)
};

export const INITIAL_POLICIES = {
  greenPower: 15,
  smartRouting: 20,
  transitDispatch: 40,
  staffSupport: 10,
};

export const CRISIS_PRESETS: CrisisEvent[] = [
  {
    id: "storm_evacuation",
    title: "Retractable Roof Flash Storm",
    severity: 8,
    description: "A sudden, severe cloudburst hits the stadium before kickoff. Active roof closing requires rapid pedestrian routing to covered concourses while managing storm-water runoff systems.",
    category: "ecological",
  },
  {
    id: "transit_crisis",
    title: "Subway Signal Line Interruption",
    severity: 7,
    description: "The primary light-rail line stops operating due to a power grid failure, stranding 15,000 incoming spectators. Immediate shuttle dispatching and parking-lot lane shifts are required.",
    category: "transit",
  },
  {
    id: "access_bottleneck",
    title: "Elevator Bank Accessibility Bottleneck",
    severity: 6,
    description: "Long queues form at Section 102 elevators during a high-profile para-sports tournament. Accessible routing and tactile guidance pathways need manual volunteer support.",
    category: "operational",
  },
  {
    id: "smart_cameras_online",
    title: "AI Crowd-Flow Analytics Calibration",
    severity: 5,
    description: "Engineers launch advanced real-time computer vision models that predict queue bottlenecks 15 minutes before they occur. Smart gates dynamically split high-traffic sections.",
    category: "operational",
  },
  {
    id: "vip_medical_emergency",
    title: "Concourse Congestion Medical Incident",
    severity: 9,
    description: "A cardiac emergency occurs in the Upper Deck concourse. Due to extreme pedestrian crowd density, first-responder routes are blocked. Emergency crowd rerouting is critical.",
    category: "safety",
  },
  {
    id: "grid_failure",
    title: "Solar Grid Intermittent Outage",
    severity: 8,
    description: "A cloud bank reduces the stadium's solar panel production by 40%. The system must dynamically switch load to internal backup batteries and limit unnecessary neon signage.",
    category: "safety",
  },
  {
    id: "concourse_surge",
    title: "Sovereign Derby Gate-Crush Hazard",
    severity: 7,
    description: "A sudden influx of ticketless fans creates a severe density surge at Gate 4. Security personnel must deploy dynamic barrier gates and activate audio-visual warnings.",
    category: "safety",
  }
];

export const CAUSAL_NODES: NodePosition[] = [
  {
    id: "crowdFlow",
    label: "Crowd Safety",
    x: 140,
    y: 80,
    color: "#fbbf24", // amber-400
    description: "Pedestrian flow and security rate. High values represent fluent movement and safe stadium gates. Low values indicate dangerous crushes.",
    value: "85.0%",
  },
  {
    id: "transitFlow",
    label: "Transit Logistics",
    x: 440,
    y: 80,
    color: "#10b981", // emerald-500
    description: "Shuttle and public transport efficiency. High transit efficiency unloads stadium bottlenecks instantly and reduces vehicle carbon footprints.",
    value: "82.0%",
  },
  {
    id: "carbonEmission",
    label: "Carbon Footprint",
    x: 440,
    y: 280,
    color: "#ef4444", // red-500
    description: "Active carbon emissions from diesel generator backup, food waste, and fossil-fueled fan transport. High emissions violate FIFA Green Goals.",
    value: "1.28t",
  },
  {
    id: "smartGrid",
    label: "AI Technology",
    x: 140,
    y: 280,
    color: "#22d3ee", // cyan-400
    description: "Smart stadium index. Powers computer-vision cameras, real-time ticket scanning, multilingual translations, and dynamic shuttle routing.",
    value: "15.0",
  },
  {
    id: "staffReadiness",
    label: "Volunteer Readiness",
    x: 290,
    y: 180,
    color: "#ec4899", // pink-500
    description: "Volunteer morale and staff availability. Key for guiding disabled fans, resolving ticket errors, and assisting crowd flow.",
    value: "78.0%",
  },
];

export const CAUSAL_CONNECTIONS: NodeConnection[] = [
  { from: "crowdFlow", to: "transitFlow", type: "negative", label: "Gate Backpressure" },
  { from: "crowdFlow", to: "carbonEmission", type: "negative", label: "Concession Waste" },
  { from: "transitFlow", to: "crowdFlow", type: "positive", label: "Smooth Arrival" },
  { from: "smartGrid", to: "crowdFlow", type: "positive", label: "Queue Prediction" },
  { from: "smartGrid", to: "transitFlow", type: "positive", label: "Dynamic Shuttle Loops" },
  { from: "smartGrid", to: "carbonEmission", type: "positive", label: "Solar Storage Optimization" },
  { from: "carbonEmission", to: "transitFlow", type: "negative", label: "Grid Friction" },
  { from: "carbonEmission", to: "staffReadiness", type: "negative", label: "Heat / Smog Discomfort" },
  { from: "transitFlow", to: "staffReadiness", type: "positive", label: "Easy Staff Commutes" },
  { from: "staffReadiness", to: "crowdFlow", type: "positive", label: "Active Gate Direction" },
  { from: "crowdFlow", to: "smartGrid", type: "positive", label: "Live Telemetry Datastream" },
];
