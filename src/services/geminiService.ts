import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface JudgingCriteria {
  name: string;
  score: number;
  feedback: string;
}

export interface JudgingResult {
  scores: JudgingCriteria[];
  totalScore: number;
  verdict: string;
  verdictEmoji: string;
  criticalAnalysis: string;
  upgradeSuggestions: string[];
  isWinner: boolean;
}

export interface QuestionnaireAnswer {
  category: string;
  question: string;
  answer: string;
}

export interface QuestionnaireEvaluation {
  scores: {
    question: string;
    score: number;
    feedback: string;
  }[];
  totalRawScore: number;
  categoryDeepDive: {
    name: string;
    summary: string;
  }[];
  executiveSummary: string;
}

export async function judgeProject(description: string): Promise<JudgingResult> {
  const prompt = `
    You are a professional DeFi evaluator. Conduct a comprehensive analysis of the following project based on 10 institutional-grade criteria (each out of 10):
    1. Innovation & Novelty
    2. Problem-Solution Alignment
    3. Engineering Depth
    4. On-chain Architecture
    5. User Experience (UX) Utility
    6. Implementation Fidelity
    7. Market Viability
    8. Strategic Communication
    9. Presentation Impact
    10. Ecosystem Alignment

    Project Description:
    "${description}"

    Evaluation Framework:
    - 🥇 85–100: Exceptional (Top Tier)
    - 🥈 70–84: Strong (Viable Candidate)
    - 🥉 50–69: Moderate (Standard Implementation)
    - ❌ <50: Incomplete / Low Viability

    Instructions:
    - Provide a "criticalAnalysis" highlighting specific architectural or strategic risks.
    - Offer "upgradeSuggestions" as high-level strategic roadmap items.
    - Ensure detailed feedback for each criterion.

    Provide the response in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                score: { type: Type.NUMBER },
                feedback: { type: Type.STRING }
              },
              required: ["name", "score", "feedback"]
            }
          },
          totalScore: { type: Type.NUMBER },
          verdict: { type: Type.STRING },
          verdictEmoji: { type: Type.STRING },
          criticalAnalysis: { type: Type.STRING },
          upgradeSuggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          isWinner: { type: Type.BOOLEAN }
        },
        required: ["scores", "totalScore", "verdict", "verdictEmoji", "criticalAnalysis", "upgradeSuggestions", "isWinner"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function evaluateQuestionnaire(answers: QuestionnaireAnswer[]): Promise<QuestionnaireEvaluation> {
  const prompt = `
    You are a professional DeFi Analyst. Evaluate these 25 inquiries to a deep-dive project assessment.
    For each response, assign a score:
    0 = Lacks specificity or technical detail
    1 = Partial evidence or theoretical approach
    2 = Rigorous, validated, and technically sound evidence provided

    Answers:
    ${JSON.stringify(answers, null, 2)}

    Provide a professional assessment in JSON format.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                score: { type: Type.NUMBER, description: "0, 1, or 2" },
                feedback: { type: Type.STRING }
              },
              required: ["question", "score", "feedback"]
            }
          },
          totalRawScore: { type: Type.NUMBER },
          categoryDeepDive: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                summary: { type: Type.STRING }
              },
              required: ["name", "summary"]
            }
          },
          executiveSummary: { type: Type.STRING }
        },
        required: ["scores", "totalRawScore", "categoryDeepDive", "executiveSummary"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
