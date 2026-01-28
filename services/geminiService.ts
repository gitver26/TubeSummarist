import { GoogleGenAI, Type } from "@google/genai";
import { VideoInsight } from "../types";

const API_KEY = process.env.API_KEY;

interface TranscriptResponse {
  transcript: string;
  title: string;
  videoId: string;
  error?: string;
}

async function fetchTranscript(url: string): Promise<TranscriptResponse> {
  const apiUrl = `/api/transcript?url=${encodeURIComponent(url)}`;
  const response = await fetch(apiUrl);
  const data = await response.json();
  
  if (!response.ok || data.error) {
    throw new Error(data.error || 'Failed to fetch transcript');
  }
  
  return data;
}

export const generateVideoInsights = async (url: string): Promise<VideoInsight> => {
  if (!API_KEY) throw new Error("API Key is not configured. Please set GEMINI_API_KEY in environment variables.");

  const { transcript, title } = await fetchTranscript(url);

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `You are analyzing a YouTube video. Here is the actual transcript from the video:

VIDEO TITLE: ${title}

TRANSCRIPT:
${transcript}

Based ONLY on this transcript, provide:
1. A concise summary in 120 words or less that captures the main points.
2. Determine if this is a "how-to" or instructional video.
3. If it is a how-to video, extract a list of structured steps with detailed descriptions.

IMPORTANT: Use ONLY the information from the transcript above. Do not make up or infer information not present in the transcript.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
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
        required: ["summary", "isHowTo"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text.trim());
    return {
      title,
      ...data,
      sourceUrls: []
    };
  } catch (err) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Failed to process video insights. Please try again.");
  }
};
