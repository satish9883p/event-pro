import Chat from '../models/Chat.js';
import { callGroqAPI, createAssistantMessage, generateEventAssistantContext } from '../services/groqService.js';
import { getEventContextForAI } from '../services/eventContextService.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty',
      });
    }

    // Get event context for AI
    const events = await getEventContextForAI(true);
    const eventContext = generateEventAssistantContext(events);

    // Create message array with system context
    const messages = createAssistantMessage(message, eventContext);

    // Call Groq API
    const aiResponse = await callGroqAPI(messages);

    if (!aiResponse.success) {
      return res.status(500).json({
        success: false,
        message: aiResponse.error || 'Failed to get AI response',
      });
    }

    // Find or create chat history
    let chat = await Chat.findOne({ userId: req.user.userId });
    if (!chat) {
      chat = await Chat.create({
        userId: req.user.userId,
        messages: [],
      });
    }

    // Add user message and AI response to chat history
    chat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    chat.messages.push({
      role: 'assistant',
      content: aiResponse.content,
      timestamp: new Date(),
    });

    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Message processed successfully',
      data: {
        userMessage: message,
        aiResponse: aiResponse.content,
        timestamp: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChatHistory = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ userId: req.user.userId });

    if (!chat) {
      return res.status(200).json({
        success: true,
        data: {
          userId: req.user.userId,
          messages: [],
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userId: chat.userId,
        messages: chat.messages,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const clearChatHistory = async (req, res, next) => {
  try {
    await Chat.findOneAndDelete({ userId: req.user.userId });

    res.status(200).json({
      success: true,
      message: 'Chat history cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteChatMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;

    const chat = await Chat.findOne({ userId: req.user.userId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
      });
    }

    chat.messages = chat.messages.filter((msg) => msg._id.toString() !== messageId);
    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
