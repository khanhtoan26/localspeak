import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { GoogleGenAI, Modality } from "@google/genai";
import type { TokenResponse } from "@localspeak/contracts";

@Injectable()
export class AudioTokenService {
  private readonly ai: GoogleGenAI;
  private readonly model: string;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
      httpOptions: { apiVersion: "v1alpha" },
    });
    this.model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  }

  async createToken(referenceText: string): Promise<TokenResponse> {
    const expireTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    try {
      const token = await this.ai.authTokens.create({
        config: {
          expireTime,
          uses: 1,
          liveConnectConstraints: {
            model: this.model,
            config: {
              responseModalities: [Modality.TEXT],
              systemInstruction: this.buildSystemInstruction(referenceText),
            },
          },
        },
      });

      return { token: token.name!, expiresAt: expireTime };
    } catch {
      throw new InternalServerErrorException({
        message: "Unable to create audio session token. Please try again.",
      });
    }
  }

  private buildSystemInstruction(referenceText: string): string {
    return `You are an expert IELTS pronunciation coach specializing in Vietnamese learners.

The learner is attempting to say: "${referenceText}"

Listen to their audio and provide real-time feedback on:
1. Pronunciation accuracy - identify specific phoneme errors using IPA notation
2. Common Vietnamese L1 interference (e.g., /θ/ → /t/, dropped final consonants, cluster reduction)
3. Hesitations, fillers, and unnatural pauses
4. Speech rate and fluency
5. Priority errors to fix first
6. Specific drills to practice

Be concise, direct, and actionable. Address the learner as "you".`;
  }
}
