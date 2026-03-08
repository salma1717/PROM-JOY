import { GoogleGenAI } from "@google/genai";

export const generateMascotImage = async () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("VITE GEMINI API KEY tidak ditemukan.");
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey
  });
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          text: "A high-quality 3D character sheet for a mascot named 'PromJoy'. The character is a friendly, round robot with a bright yellow body and a light blue face screen. It has simple oval eyes and a friendly smile on its screen. It has a small antenna on its head with a glowing tip. The sheet shows multiple views: front view waving, side view, and back view. Soft studio lighting, clean white background, 4k resolution, playful and comforting aesthetic.",
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
