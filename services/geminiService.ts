import { GoogleGenAI, Chat } from "@google/genai";
import { Message, Sender } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE GEMINI API KEY tidak ditemukan.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey
});



// Create a chat session config
const chatConfig = {
  model: 'gemini-3.1-flash-lite-preview',
  config: {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
  },
};

/**
 * Creates a new chat session
 */
export const createChatSession = (): Chat => {
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not configured. Please set VITE_GEMINI_API_KEY in environment variables.");
  }
  return ai.chats.create(chatConfig);
};

/**
 * Lists all available models
 */
export const listAvailableModels = async () => {
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not configured");
  }
  
  try {
    const models = await ai.models.list();
    return models;
  } catch (error) {
    console.error("Error listing models:", error);
    throw error;
  }
};

/**
 * Sends a message to Gemini and yields chunks of the response
 */
export const sendMessageStream = async function* (
  chatSession: Chat,
  message: string
) {
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY is not configured");
  }
  
  try {
    const result = await chatSession.sendMessageStream({ message });
    
    for await (const chunk of result) {
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};
