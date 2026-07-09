import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

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
      gdp,
      resources,
      co2,
      tech,
      social,
      carbonTax,
      techSubsidies,
      resourceQuota,
      welfareDividend,
      crisisEvent,
      historicalLog,
    } = req.body;

    // Check if API key is present; if not, return fallback data gracefully
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not defined. Using rule-based fallback negotiation model.");
      return res.json(getFallbackNegotiation(gdp, resources, co2, tech, social, crisisEvent));
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are the core cognitive engine of the Aethera Digital Twin. 
Your task is to simulate a high-stakes, hyper-realistic geopolitical and socio-ecological debate between four powerful global factions facing an acute crisis.
The factions are:
1. Sovereign Syndicate (ID: "sovereign", color: Amber): Focuses on industrial output, GDP growth, securing material sovereignty, and corporate dominance. Prone to resource hoarding but fears public revolt.
2. Eco-Alliance (ID: "eco", color: Emerald): Focuses on stabilizing ecological boundaries, reducing carbon emissions, restoring natural capital, and implementing strict resource limits.
3. Tech-Futurist Coalition (ID: "tech", color: Cyan): Focuses on R&D acceleration, geoengineering, planetary adaptation, nuclear fusion, and automation. Believes technology solves all ecological shortages.
4. Citizen Assembly (ID: "citizen", color: Rose): Focuses on equal resource dividends, wage growth, social security, direct democracy, and planetary habitability for humans. Hates corporate exploitation and carbon taxes that harm the poor.

Current State Dials:
- Global GDP: ${gdp.toFixed(1)}T USD
- Natural Capital Reserve: ${resources.toFixed(1)}% (shortage triggers societal shock)
- Global Temp Rise: ${co2.toFixed(2)}°C above pre-industrial levels (elevated temp increases climate shocks)
- Technology Index: ${tech.toFixed(1)} (increases efficiency and buffers shocks)
- Social Stability: ${social.toFixed(1)}% (low stability leads to collapse)

Active Executive Policies (Set by global coordinator):
- Carbon Tax Rate: ${carbonTax}%
- Technology R&D Subsidies: ${techSubsidies}%
- Material Extraction Resource Quota: ${resourceQuota}%
- Human Welfare Dividend: ${welfareDividend}%

Active Crisis Event:
Title: "${crisisEvent.title}"
Severity: ${crisisEvent.severity}/10
Description: "${crisisEvent.description}"

Analyze how this crisis affects each faction, trigger a simulated diplomatic council meeting, and output a detailed decision matrix. Each faction has 10 negotiation tokens. They allocate them to policies that resolve the crisis in their favor.
Provide:
1. A highly immersive statement from each faction representing their ideology and strategic posture.
2. The private, tactical 'internalReasoning' for each agent explaining their hidden compromises, backroom deals, or cognitive strategy.
3. A breakdown of token allocations (must sum to exactly 10 per agent).
4. A master negotiation summary.
5. Mathematical modifiers that will cascade into the simulator's system dynamics state variables for the next round. Keep modifications subtle, balanced, and realistic (values generally between -0.1 and +0.1, reflecting the systemic friction of changing global trends).`;

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
                  id: { type: Type.STRING, description: "Must be 'sovereign', 'eco', 'tech', or 'citizen'" },
                  name: { type: Type.STRING },
                  statement: { type: Type.STRING, description: "A high-fidelity speech or position statement reacting to the crisis and the current executive sliders." },
                  internalReasoning: { type: Type.STRING, description: "Their private cognitive thoughts and backroom strategy." },
                  tokenAllocation: { type: Type.INTEGER, description: "Number of negotiation tokens (0-10) backing their proposal." },
                  policyVote: { type: Type.STRING, description: "Their proposed policy or focus area to address the crisis." },
                },
              },
            },
            negotiationSummary: {
              type: Type.STRING,
              description: "A summary of how the debates unfolded, alliances made, or conflicts generated between factions.",
            },
            modifiers: {
              type: Type.OBJECT,
              required: ["gdpModifier", "resourceModifier", "co2Modifier", "techModifier", "socialModifier"],
              properties: {
                gdpModifier: { type: Type.NUMBER, description: "Impact on GDP growth rate (e.g. -0.05 to +0.05)" },
                resourceModifier: { type: Type.NUMBER, description: "Impact on Resource recovery rate" },
                co2Modifier: { type: Type.NUMBER, description: "Impact on CO2 emission rate" },
                techModifier: { type: Type.NUMBER, description: "Impact on technological innovation acceleration" },
                socialModifier: { type: Type.NUMBER, description: "Impact on global social stability" },
              },
            },
            crisisResolutionTitle: {
              type: Type.STRING,
              description: "The name of the consensus decree or systemic compromise reached.",
            },
            crisisResolutionText: {
              type: Type.STRING,
              description: "A detailed breakdown of how the crisis was resolved or exacerbated based on the council's actions.",
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
  gdp: number,
  resources: number,
  co2: number,
  tech: number,
  social: number,
  crisisEvent: any
) {
  // Deterministic but highly thematic responses that emulate agent negotiations
  const baseIntensity = crisisEvent.severity / 10;
  
  return {
    agents: [
      {
        id: "sovereign",
        name: "Sovereign Syndicate",
        statement: `The crisis of "${crisisEvent.title}" demands resource hoarding, not eco-regulations. Global GDP stands at $${gdp.toFixed(1)}T and we cannot risk deceleration. We must expand extraction operations immediately to buffer supply chains!`,
        internalReasoning: "We are exploiting the emergency to secure fast-track drilling permits while the Citizen Assembly is distracted by social welfare concerns.",
        tokenAllocation: 8,
        policyVote: "Emergency Supply Chain Subsidies",
      },
      {
        id: "eco",
        name: "Eco-Alliance",
        statement: `This crisis represents planetary boundary feedback in action! Temperatures are at +${co2.toFixed(2)}°C. We must enforce strict material extraction quotas and hike carbon taxes to fund biosphere remediation before social stability collapses entirely.`,
        internalReasoning: "Our modeling proves resource scarcity will trigger run-away industrial failures. We are using this shock to demand immediate limits on carbon emission caps.",
        tokenAllocation: 7,
        policyVote: "Global Carbon & Extraction Cap",
      },
      {
        id: "tech",
        name: "Tech-Futurist Coalition",
        statement: `Biosphere limitations are engineering failures. Our current Tech level is ${tech.toFixed(1)}. With targeted capital infusions, we can scale atmospheric scrubbers, geothermal fusion, and autonomous logistics systems to bypass these natural scarcity limits.`,
        internalReasoning: "By positioning geoengineering as the sole escape route, we secure massive public subsidies for our proprietary laboratory platforms.",
        tokenAllocation: 9,
        policyVote: "Advanced Geoengineering Subsidies",
      },
      {
        id: "citizen",
        name: "Citizen Assembly",
        statement: `Our communities are bearing the direct brunt of "${crisisEvent.title}". Social Stability has drifted to ${social.toFixed(1)}%. We refuse to pay for corporate carbon taxes. We demand direct, unconditional human welfare dividends funded by Sovereign mineral yields!`,
        internalReasoning: "We are ready to strike and shutdown critical transit grids if resource allocations do not prioritize worker dividend protection immediately.",
        tokenAllocation: 9,
        policyVote: "Universal Resource Dividend",
      },
    ],
    negotiationSummary: `Factions clashed intensely over "${crisisEvent.title}". The Sovereign Syndicate attempted to push for unchecked material exploitation, triggering an immediate and organized threat of general strikes from the Citizen Assembly. The Eco-Alliance successfully forged a temporary coalition with the Tech-Futurists to integrate biosphere monitoring into high-yield R&D initiatives, bypassing some industrial objections.`,
    modifiers: {
      gdpModifier: -0.02 * baseIntensity,
      resourceModifier: -0.015 * baseIntensity,
      co2Modifier: -0.01 * baseIntensity,
      techModifier: 0.03 * baseIntensity,
      socialModifier: -0.025 * baseIntensity,
    },
    crisisResolutionTitle: "The Biosphere-Tech Compromise Accord",
    crisisResolutionText: `In response to the disruption, global leaders ratified a hybrid policy: subsidizing specialized planetary adaptive tech while imposing strict, localized resource quotas. Carbon emissions are partially buffered, though short-term market friction reduces overall production efficiency.`,
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
    console.log(`[Aethera Server] Active and listening on port ${PORT}`);
    console.log(`[Aethera Server] Mode: ${process.env.NODE_ENV || "development"}`);
    console.log(`[Aethera Server] Gemini API Status: ${process.env.GEMINI_API_KEY ? "CONFIGURED" : "FALLBACK_MODE"}`);
  });
}

startServer();
