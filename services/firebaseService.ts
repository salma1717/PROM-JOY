import { database } from '../firebaseConfig';
import { ref, set, get } from 'firebase/database';
import { Message, Sender } from '../types';

/**
 * Save a single chat message to Firebase
 */
export const saveChatToFirebase = async (userId: string, role: string, message: string) => {
  try {
    const chatRef = ref(database, `chats/${userId}`);
    
    // Get current chats
    const snapshot = await get(chatRef);
    const chats = snapshot.val() || [];
    
    // Add new message
    chats.push({
      role,
      message,
      timestamp: new Date().toISOString(),
    });
    
    // Save back to Firebase
    await set(chatRef, chats);
    console.log('✅ Chat saved to Firebase');
  } catch (error) {
    console.error('❌ Error saving to Firebase:', error);
  }
};

/**
 * Load chat history from Firebase for a specific user
 */
export const loadChatHistoryFromFirebase = async (userId: string): Promise<Message[]> => {
  try {
    const chatRef = ref(database, `chats/${userId}`);
    const snapshot = await get(chatRef);
    
    console.log('🔍 Firebase snapshot exists:', snapshot.exists());
    console.log('🔍 Firebase snapshot value:', snapshot.val());
    
    if (!snapshot.exists()) {
      console.log('❌ No data found at chats/' + userId);
      return [];
    }
    
    const chats = snapshot.val() || [];
    console.log('📊 Chats loaded:', chats);
    
    // Convert to Message format
    return chats.map((chat: any, index: number) => ({
      id: `${Date.now()}-${index}`,
      text: chat.message,
      sender: chat.role === 'user' ? Sender.USER : Sender.BOT,
      timestamp: new Date(chat.timestamp),
    }));
  } catch (error) {
    console.error('❌ Error loading from Firebase:', error);
    return [];
  }
};

/**
 * Get all chats for monitoring (admin view)
 */
export const getAllChatsFromFirebase = async () => {
  try {
    const allChatsRef = ref(database, 'chats');
    const snapshot = await get(allChatsRef);
    
    if (!snapshot.exists()) {
      return {};
    }
    
    return snapshot.val();
  } catch (error) {
    console.error('❌ Error loading all chats:', error);
    return {};
  }
};

/**
 * Clear chat history for a user (for testing)
 */
export const clearChatFromFirebase = async (userId: string) => {
  try {
    const chatRef = ref(database, `chats/${userId}`);
    await set(chatRef, []);
    console.log(`✅ Chat cleared for ${userId}`);
  } catch (error) {
    console.error('❌ Error clearing chat:', error);
  }
};
