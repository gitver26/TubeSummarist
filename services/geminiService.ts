
import { GoogleGenAI, Type } from "@google/genai";
import { VideoInsight } from "../types";

const API_KEY = process.env.API_KEY;

export const generateVideoInsights = async (url: string): Promise<VideoInsight> => {
  if (!API_KEY) throw new Error("API Key is not configured");

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // We use Gemini 3 Flash for its speed and search grounding capabilities
  const prompt = `Analyze this YouTube video: ${url}. 
  1. Provide a concise summary in 120 words or less.
  2. Determine if it is a "how-to" or instructional video.
  3. If it is how-to, extract a list of structured steps with detailed descriptions.
  4. Identify the video title.
  
  Search for the video metadata and transcript to ensure accuracy.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          isHowTo: { type: Type.BOOLEAN },
          howToSteps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                step: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["step", "description"]
            }
          }
        },
        required: ["title", "summary", "isHowTo"]
      }
    }
  });

  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  const sourceUrls = groundingChunks?.map((chunk: any) => chunk.web?.uri).filter(Boolean) || [];

  try {
    const data = JSON.parse(response.text.trim());
    return {
      ...data,
      sourceUrls
    };
  } catch (err) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Failed to process video insights. Please try again.");
  }
};
