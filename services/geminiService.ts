

import { GoogleGenAI, Type } from "@google/genai";
import { Message, Persona } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); 

export const streamChatResponse = async function* (
  currentMessage: string,
  history: Message[],
  persona: Persona
) {
  if (!process.env.API_KEY) {
    yield "Error: API_KEY is missing in environment variables.";
    return;
  }

  try {
    const model = 'gemini-2.5-flash';
    
    // Transform history into GoogleGenAI format
    // Filter out error messages or empty states if any
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: model,
      history: chatHistory,
      config: {
        systemInstruction: persona.systemInstruction,
        temperature: 0.7, // Balance between creativity and consistency
      },
    });

    const result = await chat.sendMessageStream({ message: currentMessage });

    for await (const chunk of result) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    yield "I'm having a little trouble connecting to my thoughts right now. Please try again in a moment.";
  }
};

export const generateAssessmentAnalysis = async (
    scores: { depression: number; anxiety: number; stress: number },
    levels: { depression: string; anxiety: string; stress: string }
): Promise<any> => {
    // Better Fallback logic in case of timeout or error
    const fallback = {
        overallSummary: `Your results indicate ${levels.stress.toLowerCase()} stress, ${levels.anxiety.toLowerCase()} anxiety, and ${levels.depression.toLowerCase()} depression levels.`,
        whatThisMeans: "These scores reflect your emotional state over the past week. It is completely valid to feel this way.",
        suggestions: ["Prioritize rest today.", "Connect with a loved one.", "Try a 5-minute meditation."],
        supportNote: "This is a screening tool, not a diagnosis. If you feel overwhelmed, please see a professional."
    };

    if (!process.env.API_KEY) return fallback;

    try {
        const prompt = `The user completed the DASS-21 assessment.
        Scores:
        - Depression: ${scores.depression} (${levels.depression})
        - Anxiety: ${scores.anxiety} (${levels.anxiety})
        - Stress: ${scores.stress} (${levels.stress})

        Please provide a supportive, non-clinical, and simple analysis in JSON format.
        Language must be gentle, safe, and easy to understand. Avoid scary medical jargon.
        
        The response must follow this schema:
        {
          "overallSummary": "Briefly explain which area is highest and what that feels like emotionally.",
          "whatThisMeans": "Explain in easy words how these scores relate to daily life (mood, sleep, focus).",
          "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4", "Suggestion 5"],
          "supportNote": "A clear statement that this is not a diagnosis and professional help is recommended if scores are high."
        }`;

        // Create a timeout promise that rejects after 5 seconds
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Request timed out")), 5000)
        );

        const apiCall = ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        overallSummary: { type: Type.STRING },
                        whatThisMeans: { type: Type.STRING },
                        suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        supportNote: { type: Type.STRING }
                    }
                }
            }
        });

        // Race the API call against the timeout
        const response: any = await Promise.race([apiCall, timeout]);

        const text = response.text;
        if (!text) throw new Error("No response");
        return JSON.parse(text);

    } catch (e) {
        console.warn("Analysis generation failed or timed out, using fallback:", e);
        return fallback;
    }
}