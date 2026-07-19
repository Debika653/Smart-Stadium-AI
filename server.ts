import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// 1. Enterprise Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: referrer; connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; frame-ancestors 'self' https://*.run.app https://ai.studio https://*.google.com https://*.googleusercontent.com;"
  );
  next();
});

// 2. Custom Rate Limiter to mitigate DDoS/Brute-Force vectors
const rateLimitWindowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 120; // Allow 120 requests/min
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();

app.use("/api/", (req, res, next) => {
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "anonymous";
  const now = Date.now();

  const record = rateLimitMap.get(ip);
  if (!record) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return next();
  }

  if (now - record.windowStart > rateLimitWindowMs) {
    record.count = 1;
    record.windowStart = now;
    return next();
  }

  record.count += 1;
  if (record.count > maxRequestsPerWindow) {
    return res.status(429).json({
      error: true,
      message: "Too many requests. Cyber-defense rate limiting activated. Please slow down.",
    });
  }

  next();
});

app.use(express.json());

// Lazy Gemini API Client Initialization
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Route: System Status check
app.get("/api/health", (req, res) => {
  res.json({
    status: "active",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// API Route: Server-Side Gemini Multi-Agent Simulation Negotiation
app.post("/api/simulation/agent-negotiate", async (req, res) => {
  try {
    const {
      crowdFlow,
      transitFlow,
      carbonEmission,
      smartGrid,
      staffReadiness,
      greenPower,
      smartRouting,
      transitDispatch,
      staffSupport,
      crisisEvent,
    } = req.body;

    // A. Robust Input Validation & Sanitization (Defending against XSS & parameter tampering)
    const validateNum = (val: any, min: number, max: number, fallback: number): number => {
      const parsed = parseFloat(val);
      if (isNaN(parsed)) return fallback;
      return Math.min(max, Math.max(min, parsed));
    };

    const cleanCrowdFlow = validateNum(crowdFlow, 0, 100, 85.0);
    const cleanTransitFlow = validateNum(transitFlow, 0, 100, 82.0);
    const cleanCarbonEmission = validateNum(carbonEmission, 0, 10.0, 1.28);
    const cleanSmartGrid = validateNum(smartGrid, 0, 100, 15.0);
    const cleanStaffReadiness = validateNum(staffReadiness, 0, 100, 78.0);
    const cleanGreenPower = validateNum(greenPower, 0, 100, 40.0);
    const cleanSmartRouting = validateNum(smartRouting, 0, 100, 30.0);
    const cleanTransitDispatch = validateNum(transitDispatch, 10, 100, 50.0);
    const cleanStaffSupport = validateNum(staffSupport, 0, 100, 20.0);

    // B. Prompt Injection and XSS mitigation sanitization for text fields
    const sanitizeText = (val: any, limit: number): string => {
      if (typeof val !== "string") return "";
      let cleaned = val.trim().substring(0, limit);
      // Remove tags to mitigate HTML/XSS injection
      cleaned = cleaned.replace(/<[^>]*>/g, "");
      
      // Deflect Prompt Injection tricks targeting system instructions
      const exploitTerms = [
        /ignore\s+previous/gi,
        /override\s+system/gi,
        /system\s+instruction/gi,
        /you\s+are\s+now/gi,
        /forget\s+all\s+rules/gi,
        /new\s+role/gi,
        /instead\s+of\s+stadium/gi
      ];
      for (const term of exploitTerms) {
        if (term.test(cleaned)) {
          cleaned = cleaned.replace(term, "[DEFLECTED_INJECTION]");
        }
      }
      return cleaned;
    };

    const cleanCrisisTitle = sanitizeText(crisisEvent?.title || "Stadium Equilibrium Normal", 100);
    const cleanCrisisDesc = sanitizeText(crisisEvent?.description || "No acute operational stresses detected.", 500);
    const cleanCrisisSeverity = validateNum(crisisEvent?.severity, 1, 10, 1);

    // Check if API key is present; if not, return fallback data gracefully
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined. Using rule-based fallback negotiation model.");
      return res.json(getFallbackNegotiation(
        cleanCrowdFlow,
        cleanTransitFlow,
        cleanCarbonEmission,
        cleanSmartGrid,
        cleanStaffReadiness,
        {
          id: crisisEvent?.id || "normal",
          title: cleanCrisisTitle,
          description: cleanCrisisDesc,
          severity: cleanCrisisSeverity,
        }
      ));
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are the core cognitive engine of the Smart Stadium AI Digital Twin. 
Your task is to simulate a high-stakes, hyper-realistic tournament operations debate between four powerful stadium control delegates facing an acute match-day incident.
The delegates are:
1. Stadium Operations Director (ID: "stadium_ops", color: Amber): Focuses on stadium logistics, bottleneck mitigation, maximum shuttle utilization, and venue throughput.
2. Sustainability Manager (ID: "eco_sustainability", color: Emerald): Focuses on carbon neutrality, maximizing solar microgrid usage, minimizing compost/waste overflow, and clean operations.
3. Fan Experience Coordinator (ID: "fan_experience", color: Cyan): Focuses on volunteer readiness, fan translation assistance, wheelchair & accessibility, and overall seating satisfaction.
4. Safety Command Center (ID: "safety_security", color: Rose): Focuses on gate entry security, crowd safety indexes, fire code compliance, and direct incident suppression.

Current State Dials:
- Crowd Safety Index: ${cleanCrowdFlow.toFixed(1)}% (critical crowd bottleneck triggers alert)
- Transit Logistics: ${cleanTransitFlow.toFixed(1)}% (shortage triggers gridlock delays)
- Carbon Footprint: ${cleanCarbonEmission.toFixed(2)}t per active match (high emissions damage green compliance)
- AI Smart Grid Index: ${cleanSmartGrid.toFixed(1)} (increases computational computer vision and camera accuracy)
- Volunteer Readiness: ${cleanStaffReadiness.toFixed(1)}% (low readiness triggers volunteer burnout warnings)

Active Executive Sliders:
- Green Solar Power Allocation: ${cleanGreenPower}%
- AI Crowd Routing & Tech: ${cleanSmartRouting}%
- Transit Shuttles Dispatch: ${cleanTransitDispatch}%
- Volunteer Incentives & Support: ${cleanStaffSupport}%

Active Match-Day Incident:
Title: "${cleanCrisisTitle}"
Severity: ${cleanCrisisSeverity}/10
Description: "${cleanCrisisDesc}"

Analyze how this incident affects each operational department, trigger a simulated logistics debate, and output a detailed decision matrix. Each delegate has 10 negotiation tokens. They allocate them to proposals that resolve the bottleneck in their favor.
Provide:
1. A highly professional, immersive statement from each representative reacting to the incident and active sliders.
2. The private, tactical 'internalReasoning' for each agent explaining their hidden worries, resource trade-offs, or scheduling compromises.
3. A breakdown of token allocations (must sum to exactly 10 per agent).
4. A master negotiation summary.
5. Mathematical modifiers that will cascade into the simulator's state variables for the next tick. Keep modifications subtle, balanced, and realistic (values generally between -5.0 and +5.0 for percentage values, and -0.1 to +0.1 for the carbon emission metrics, reflecting systemic friction of physical movements).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Perform the multi-agent systemic negotiation and crisis impact projection.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["agents", "negotiationSummary", "modifiers", "crisisResolutionTitle", "crisisResolutionText"],
          properties: {
            agents: {
              type: Type.ARRAY,
              description: "The list of the 4 cognitive simulation agents and their stance.",
              items: {
                type: Type.OBJECT,
                required: ["id", "name", "statement", "internalReasoning", "tokenAllocation", "policyVote"],
                properties: {
                  id: { type: Type.STRING, description: "Must be 'stadium_ops', 'eco_sustainability', 'fan_experience', or 'safety_security'" },
                  name: { type: Type.STRING },
                  statement: { type: Type.STRING, description: "Position statement reacting to the incident and the current executive sliders." },
                  internalReasoning: { type: Type.STRING, description: "Private operational trade-offs and backend logistics strategy." },
                  tokenAllocation: { type: Type.INTEGER, description: "Number of negotiation tokens (0-10) backing their proposal." },
                  policyVote: { type: Type.STRING, description: "Their proposed operational focus area to address the incident." },
                },
              },
            },
            negotiationSummary: {
              type: Type.STRING,
              description: "A summary of how the debates unfolded, consensus made, or conflicts between operational heads.",
            },
            modifiers: {
              type: Type.OBJECT,
              required: [
                "crowdFlowModifier",
                "transitFlowModifier",
                "carbonEmissionModifier",
                "smartGridModifier",
                "staffReadinessModifier"
              ],
              properties: {
                crowdFlowModifier: { type: Type.NUMBER, description: "Impact on Crowd Safety Index (percentage point change, e.g. -3 to +3)" },
                transitFlowModifier: { type: Type.NUMBER, description: "Impact on Transit Logistics (percentage point change)" },
                carbonEmissionModifier: { type: Type.NUMBER, description: "Impact on Carbon Footprint (tons deviation, e.g. -0.1 to +0.1)" },
                smartGridModifier: { type: Type.NUMBER, description: "Impact on Smart Grid capacity" },
                staffReadinessModifier: { type: Type.NUMBER, description: "Impact on Volunteer Readiness" },
              },
            },
            crisisResolutionTitle: {
              type: Type.STRING,
              description: "The name of the compromise operational decree reached.",
            },
            crisisResolutionText: {
              type: Type.STRING,
              description: "A detailed breakdown of how the incident was mitigated or managed based on the council's actions.",
            },
          },
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json(parsedData);
  } catch (error: any) {
    console.error("Simulation endpoint error:", error);
    res.status(500).json({
      error: true,
      message: error.message || "An error occurred during agent simulation calculation.",
    });
  }
});

// High-fidelity fallback logic when GEMINI_API_KEY is not configured
function getFallbackNegotiation(
  crowdFlow: number,
  transitFlow: number,
  carbonEmission: number,
  smartGrid: number,
  staffReadiness: number,
  crisisEvent: any
) {
  const baseIntensity = crisisEvent.severity / 10;
  
  return {
    agents: [
      {
        id: "stadium_ops",
        name: "Stadium Operations Director",
        statement: `The active incident "${crisisEvent.title}" threatens stadium gate access. Crowd safety stands at ${crowdFlow.toFixed(1)}%. We must dispatch additional transit loop shuttles and redirect fan flow to open side-gates immediately!`,
        internalReasoning: "We are worried that high shuttle demand will overload our current fleet capacity, requiring us to draw power from the main grid backup.",
        tokenAllocation: 8,
        policyVote: "Emergency Gate Redirection Protocol",
      },
      {
        id: "eco_sustainability",
        name: "Sustainability Manager",
        statement: `Even in emergency mode, carbon footprint sits at ${carbonEmission.toFixed(2)}t. We must sustain our solar microgrid allocation. Relying on fossil fuel generators will violate carbon neutrality goals.`,
        internalReasoning: "If we start diesel generators, we will fail our green compliance score. We are pushing for smart solar grid priority.",
        tokenAllocation: 7,
        policyVote: "Solar Microgrid Priority Dispatch",
      },
      {
        id: "fan_experience",
        name: "Fan Experience Coordinator",
        statement: `Volunteer Readiness is at ${staffReadiness.toFixed(1)}%. Staff are overwhelmed by the incident. We need volunteer support and real-time smart routing translation aids to prevent immediate exhaustion.`,
        internalReasoning: "If volunteers begin quitting, gate congestion will rise. We are allocating tokens to incentivize volunteer morale.",
        tokenAllocation: 9,
        policyVote: "Volunteer Support & Shift Rotation",
      },
      {
        id: "safety_security",
        name: "Safety Command Center",
        statement: `With AI grid index at ${smartGrid.toFixed(1)}, our computer vision camera arrays are detecting bottlenecks at Gate 4. We demand real-time gate splitting security to suppress congestion spikes before code violations occur.`,
        internalReasoning: "We are ready to deploy barricades to filter crowds safely if dynamic gate routing is not backed by full operations staff.",
        tokenAllocation: 9,
        policyVote: "Computer Vision Bottleneck Splitting",
      },
    ],
    negotiationSummary: `Operations chiefs debated intensely over "${crisisEvent.title}". Stadium Ops sought to open auxiliary gates, but Safety demanded physical screening barriers to prevent stampede risks. Fan Experience successfully negotiated a rotation plan for exhausted volunteers, backed by solar-powered real-time translators proposed by Sustainability.`,
    modifiers: {
      crowdFlowModifier: 3.5 * baseIntensity,
      transitFlowModifier: -2.1 * baseIntensity,
      carbonEmissionModifier: -0.05 * baseIntensity,
      smartGridModifier: 1.5 * baseIntensity,
      staffReadinessModifier: -1.8 * baseIntensity,
    },
    crisisResolutionTitle: "Integrated Match-Day Mitigation Accord",
    crisisResolutionText: `In response to the incident, the operations console enacted a combined gate-splitting and shift-rotation plan. Crowds are filtered smoothly via computer vision assistance, and volunteer burnout is buffered, though bus logistics experience slight delays.`,
  };
}

// Vite and static asset server pipeline configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SmartStadium Server] Active and listening on port ${PORT}`);
    console.log(`[SmartStadium Server] Mode: ${process.env.NODE_ENV || "development"}`);
    console.log(`[SmartStadium Server] Gemini API Status: ${process.env.GEMINI_API_KEY ? "CONFIGURED" : "FALLBACK_MODE"}`);
  });
}

startServer();
