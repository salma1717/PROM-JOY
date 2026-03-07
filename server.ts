import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');

// Middleware
app.use(cors());
app.use(express.json());

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read chat file
const readChatFile = (userId: string) => {
  const filePath = path.join(DATA_DIR, `${userId}.json`);
  if (!fs.existsSync(filePath)) {
    return { user_id: userId, chats: [] };
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
};

// Helper to write chat file
const writeChatFile = (userId: string, data: any) => {
  const filePath = path.join(DATA_DIR, `${userId}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};

// POST /api/save-chat - Save chat message
app.post('/api/save-chat', (req, res) => {
  try {
    const { user_id, role, message } = req.body;

    if (!user_id || !role || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Read current chats
    const chatData = readChatFile(user_id);

    // Add new message
    chatData.chats.push({
      role,
      message,
      timestamp: new Date().toISOString(),
    });

    // Write back to file
    writeChatFile(user_id, chatData);

    res.json({ success: true, message: 'Chat saved' });
  } catch (error) {
    console.error('Error saving chat:', error);
    res.status(500).json({ error: 'Failed to save chat' });
  }
});

// GET /api/chat/:user_id - Get all chats for a user
app.get('/api/chat/:user_id', (req, res) => {
  try {
    const { user_id } = req.params;
    const chatData = readChatFile(user_id);
    res.json(chatData);
  } catch (error) {
    console.error('Error reading chat:', error);
    res.status(500).json({ error: 'Failed to read chat' });
  }
});

// GET /api/all-chats - Get all chats from all responden
app.get('/api/all-chats', (req, res) => {
  try {
    const allChats: any = {};
    const files = fs.readdirSync(DATA_DIR);

    files.forEach((file) => {
      if (file.endsWith('.json')) {
        const userId = file.replace('.json', '');
        const data = readChatFile(userId);
        allChats[userId] = data;
      }
    });

    res.json(allChats);
  } catch (error) {
    console.error('Error reading all chats:', error);
    res.status(500).json({ error: 'Failed to read chats' });
  }
});

// GET /api/stats - Get stats for all responden
app.get('/api/stats', (req, res) => {
  try {
    const stats: any = {};
    const files = fs.readdirSync(DATA_DIR);

    files.forEach((file) => {
      if (file.endsWith('.json')) {
        const userId = file.replace('.json', '');
        const data = readChatFile(userId);
        stats[userId] = {
          total_messages: data.chats.length,
          last_chat: data.chats.length > 0 ? data.chats[data.chats.length - 1].timestamp : null,
        };
      }
    });

    res.json(stats);
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', port: PORT });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n✅ Backend server running at http://localhost:${PORT}`);
  console.log(`📊 View chats: http://localhost:${PORT}/api/chat/R01`);
  console.log(`📈 View stats: http://localhost:${PORT}/api/stats`);
  console.log(`🔍 View all: http://localhost:${PORT}/api/all-chats\n`);
});
