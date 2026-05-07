import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { GoogleGenAI, Type } from "@google/genai";
import {
  GeminiFeedbackRequestSchema,
  GeminiFeedbackResponseSchema,
  type GeminiFeedbackResponse,
} from "@localspeak/contracts";

const GEMINI_FEEDBACK_JSON_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    pronunciationBand: {
      type: Type.NUMBER,
      description: "IELTS pronunciation band estimate (0-9, step 0.5)",
    },
    fluencyBand: {
      type: Type.NUMBER,
      description: "IELTS fluency band estimate (0-9, step 0.5)",
    },
    topErrors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: {
            type: Type.STRING,
            description: "The specific word with the error",
          },
          phoneme: {
            type: Type.STRING,
            description: "The phoneme that was mispronounced (IPA)",
          },
          explanation: {
            type: Type.STRING,
            description:
              "Brief explanation of why this matters for IELTS",
          },
        },
        propertyOrdering: ["word", "phoneme", "explanation"],
      },
      description: "Exactly 3 top pronunciation errors from the data",
    },
    drills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Exactly 3 actionable practice exercises",
    },
    summary: {
      type: Type.STRING,
      description: "2-3 sentence overall assessment with band context",
    },
  },
  propertyOrdering: [
    "pronunciationBand",
    "fluencyBand",
    "topErrors",
    "drills",
    "summary",
  ],
};

@Injectable()
export class GeminiFeedbackService {
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    this.model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  }

  async getFeedback(
    body: unknown,
    locale: "vi" | "en",
  ): Promise<GeminiFeedbackResponse> {
    const parsed = GeminiFeedbackRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException({
        message: "Invalid feedback request payload.",
        issues: parsed.error.issues.slice(0, 5),
      });
    }

    const analysisData = parsed.data;

    try {
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: JSON.stringify(analysisData),
        config: {
          systemInstruction: this.buildSystemInstruction(locale),
          responseMimeType: "application/json",
          responseJsonSchema: GEMINI_FEEDBACK_JSON_SCHEMA,
          httpOptions: { timeout: 30000 },
        },
      });

      if (!response.text) {
        throw new Error("Gemini returned empty response");
      }

      const geminiOutput = JSON.parse(response.text);
      const validated = GeminiFeedbackResponseSchema.safeParse(geminiOutput);

      if (!validated.success) {
        throw new Error("Gemini response failed Zod validation");
      }

      return validated.data;
    } catch {
      throw new InternalServerErrorException({
        message: "AI feedback unavailable, please try again.",
      });
    }
  }

  private buildSystemInstruction(locale: "vi" | "en"): string {
    const langDirective =
      locale === "vi"
        ? "Respond entirely in Vietnamese."
        : "Respond entirely in English.";

    return `You are an expert IELTS Speaking examiner and pronunciation coach.
${langDirective}

Your task: Analyze the pronunciation and fluency metrics provided and give specific, actionable feedback.

Rules:
- Be concise and direct. No platitudes or generic advice.
- Reference SPECIFIC words and phonemes from the provided data.
- Each error in topErrors must cite the actual word and phoneme (IPA) that triggered it, with a brief explanation of why it matters for IELTS scoring.
- Each drill must be a concrete exercise the learner can do immediately (e.g., "Record yourself saying 'think' and compare your /t/ with the target /θ/").
- Summary must be 2-3 sentences contextualizing the bands (e.g., "Band 6.5 means...").
- Use "You" language — address the learner directly.
- For Vietnamese learners: be aware of common L1 interference patterns (/θ/ → /t/, dropped word-final consonants, consonant cluster reduction).
- Return EXACTLY 3 topErrors and EXACTLY 3 drills.`;
  }
}
