import { CrisisEvent, NodePosition, NodeConnection } from "./types";

export const INITIAL_STATE = {
  year: 2026,
  gdp: 105.0, // $105 Trillion
  resources: 85.0, // 85% natural capital reserves remaining
  co2: 1.28, // 1.28°C warming above pre-industrial levels
  tech: 15.0, // Base level technology index
  social: 78.0, // 78% global social stability
};

export const INITIAL_POLICIES = {
  carbonTax: 15,
  techSubsidies: 20,
  resourceQuota: 40,
  welfareDividend: 10,
};

export const CRISIS_PRESETS: CrisisEvent[] = [
  {
    id: "methane_plume",
    title: "Siberian Methane Clathrate Eruption",
    severity: 8,
    description: "A sudden, massive release of undersea methane in the East Siberian Arctic Shelf bypasses carbon sinks, triggering a sudden 0.15°C temperature leap and intense regional severe weather events.",
    category: "ecological",
  },
  {
    id: "battery_choke",
    title: "Global Lithium & Cobalt Extraction Bottleneck",
    severity: 7,
    description: "Sovereign mining limits and local labor strikes in main extraction corridors choke off 45% of critical minerals supply, causing green transition supply lines to halt and high energy prices.",
    category: "financial",
  },
  {
    id: "automation_unrest",
    title: "Quantum Cognitive System Automation Wave",
    severity: 6,
    description: "Autonomous agent algorithms automate 30% of white-collar cognitive labor within weeks. Citizen groups protest as income inequality spikes, lowering social stability but accelerating corporate tech gains.",
    category: "social",
  },
  {
    id: "nuclear_fusion_unlock",
    title: "Magnetized Target Fusion Breakthrough",
    severity: 5,
    description: "Researchers announce continuous net energy gain using high-beta magnetized target fusion, promising clean abundance. Capital shifts towards fusion grids, boosting future growth prospects.",
    category: "technological",
  },
  {
    id: "soil_dieback",
    title: "Trans-Continental Topsoil Microbial Collapse",
    severity: 9,
    description: "Widespread soil degradation and extreme heat eliminate beneficial microflora across breadbaskets. Agricultural yields plunge by 22%, causing systemic food inflation and high human distress.",
    category: "ecological",
  },
  {
    id: "grid_solar_flare",
    title: "Carrington-Class Solar Plasma Ejection",
    severity: 8,
    description: "An intense solar super-storm induces major geomagnetically induced currents. Electrical transformers burn, taking out 15% of global cloud computing servers and satellite logistics links.",
    category: "technological",
  },
  {
    id: "hyperinflation",
    title: "Sovereign Debt Sovereign Debt Default",
    severity: 7,
    description: "Cascading climatic costs trigger standard debt defaults in multiple medium-sized economies, causing global credit lines to freeze. Public funding for welfare and climate transitions dries up.",
    category: "financial",
  }
];

export const CAUSAL_NODES: NodePosition[] = [
  {
    id: "gdp",
    label: "Global GDP",
    x: 140,
    y: 80,
    color: "#fbbf24", // amber-400
    description: "Total value of global goods and services. Drives extraction and CO2 output, but provides funding for research and public dividends.",
    value: "105.0T USD",
  },
  {
    id: "resources",
    label: "Natural Capital",
    x: 440,
    y: 80,
    color: "#10b981", // emerald-500
    description: "Planetary resources, minerals, and carbon sinks. High depletion reduces GDP capability and triggers severe social shocks.",
    value: "85.0%",
  },
  {
    id: "co2",
    label: "Atmospheric CO2",
    x: 440,
    y: 280,
    color: "#ef4444", // red-500
    description: "Atmospheric greenhouse gases and temperature rise. High temperatures trigger feedback loops, destroy crops, and harm social stability.",
    value: "+1.28°C",
  },
  {
    id: "tech",
    label: "Technology Index",
    x: 140,
    y: 280,
    color: "#22d3ee", // cyan-400
    description: "Global technological efficiency. Buffers resource constraints, enhances ecological resilience, and speeds carbon capture.",
    value: "15.0",
  },
  {
    id: "social",
    label: "Social Stability",
    x: 290,
    y: 180,
    color: "#ec4899", // pink-500
    description: "Public wellness, institutional trust, and human index. If social stability collapses to 0%, systemic revolution halts all operations.",
    value: "78.0%",
  },
];

export const CAUSAL_CONNECTIONS: NodeConnection[] = [
  { from: "gdp", to: "resources", type: "negative", label: "Resource Extraction" },
  { from: "gdp", to: "co2", type: "negative", label: "Industrial Emissions" },
  { from: "resources", to: "gdp", type: "positive", label: "Material Inputs" },
  { from: "tech", to: "gdp", type: "positive", label: "Automation Efficiency" },
  { from: "tech", to: "resources", type: "positive", label: "Recycling & Synthesis" },
  { from: "tech", to: "co2", type: "positive", label: "Carbon Scrubbing" },
  { from: "co2", to: "resources", type: "negative", label: "Biosphere Destruction" },
  { from: "co2", to: "social", type: "negative", label: "Severe Weather Scarcity" },
  { from: "resources", to: "social", type: "positive", label: "Food & Material Security" },
  { from: "social", to: "gdp", type: "positive", label: "Worker Cooperation" },
  { from: "gdp", to: "tech", type: "positive", label: "R&D Investment Funding" },
];
