import { Message } from '../types';

const STORAGE_PREFIX = 'prom_joy_chat_';

/**
 * Save chat history for a specific user to localStorage
 */
export const saveChatHistory = (userId: string, messages: Message[]): void => {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    const serializedMessages = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
    }));
    localStorage.setItem(key, JSON.stringify(serializedMessages));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};

/**
 * Load chat history for a specific user from localStorage
 */
export const loadChatHistory = (userId: string): Message[] => {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    const data = localStorage.getItem(key);
    
    if (!data) {
      return [];
    }

    const messages = JSON.parse(data) as Array<any>;
    return messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
};

/**
 * Clear chat history for a specific user
 */
export const clearChatHistory = (userId: string): void => {
  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
};

/**
 * Clear all chat data
 */
export const clearAllChatData = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
    localStorage.removeItem('user_id');
  } catch (error) {
    console.error('Error clearing all chat data:', error);
  }
};
