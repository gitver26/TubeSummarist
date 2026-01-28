import { GoogleGenAI, Type } from "@google/genai";
import { VideoInsight } from "../types";

const API_KEY = process.env.API_KEY;

export const generateVideoInsights = async (url: string): Promise<VideoInsight> => {
  if (!API_KEY) throw new Error("API Key is not configured. Please set GEMINI_API_KEY in environment variables.");

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Analyze this YouTube video thoroughly.

Based on the video content, provide:
1. The exact title of the video.
2. A concise summary in 120 words or less that captures the main points.
3. Determine if this is a "how-to" or instructional video.
4. If it is a how-to video, extract a list of structured steps with detailed descriptions.

IMPORTANT: Base your analysis ONLY on the actual video content. Be accurate and specific.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            fileData: {
              fileUri: url,
              mimeType: 'video/*'
            }
          },
          { text: prompt }
        ]
      }
    ],
    config: {
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

  try {
    const data = JSON.parse(response.text.trim());
    return {
      ...data,
      sourceUrls: []
    };
  } catch (err) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Failed to process video insights. Please try again.");
  }
};
