import { GoogleGenAI, Chat } from "@google/genai";
import { Message, Sender } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

// Get API key from environment variable
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Debug: Log if API key is present (only first few chars for security)
console.log('🔑 Gemini API Key status:', apiKey ? `Present (${apiKey.substring(0, 10)}...)` : 'MISSING');

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing! Please set VITE_GEMINI_API_KEY in Vercel environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

// Create a chat session config
const chatConfig = {
  model: 'gemini-2.0-flash',
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
    throw new Error("GEMINI_API_KEY is not configured. Please set VITE_GEMINI_API_KEY in environment variables.");
  }
  return ai.chats.create(chatConfig);
};

/**
 * Sends a message to Gemini and yields chunks of the response
 */
export const sendMessageStream = async function* (
  chatSession: Chat,
  message: string
) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
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
