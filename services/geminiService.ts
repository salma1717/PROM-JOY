import { GoogleGenAI, Chat } from "@google/genai";
import { Message, Sender } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_API_KEY || '';

if (!apiKey) {
  console.warn("GEMINI_API_KEY is missing. Please set it in your environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

// Create a chat session config
const chatConfig = {
  model: 'gemini-2.5-flash',
  config: {
    systemInstruction: SYSTEM_INSTRUCTION,
    temperature: 0.7, // Slightly creative but stable
    topK: 40,
    topP: 0.95,
  },
};

/**
 * Sends a message to Gemini and yields chunks of the response.
 * We recreate the history context each time to keep the component stateless regarding API connection,
 * though keeping a persistent Chat object is also valid. 
 * For this implementation, we will utilize a persistent chat instance pattern handled in the component
 * or re-hydrate history if needed. Here we assume a fresh call or managed history.
 * 
 * To strictly follow the "chat" pattern, we should maintain a Chat object.
 */
export const createChatSession = (): Chat => {
  return ai.chats.create(chatConfig);
};

export const sendMessageStream = async function* (
  chatSession: Chat,
  message: string
) {
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
