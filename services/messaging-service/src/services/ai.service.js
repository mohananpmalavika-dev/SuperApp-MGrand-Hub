const Message = require('../models/Message.model');
const axios = require('axios');

class AIService {
  constructor() {
    this.aiApiUrl = process.env.AI_API_URL;
    this.aiApiKey = process.env.AI_API_KEY;
  }

  /**
   * Generate smart reply suggestions
   */
  async generateSmartReply(messageId, userId) {
    try {
      const message = await Message.findById(messageId);
      
      if (!message) {
        throw new Error('Message not found');
      }

      // Get recent conversation context
      const recentMessages = await Message.find({
        chat: message.chat,
        createdAt: { $lte: message.createdAt }
      })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('content sender createdAt');

      const context = recentMessages.reverse().map(msg => ({
        sender: msg.sender.toString() === userId ? 'user' : 'other',
        content: msg.content
      }));

      // If AI API is configured, use it
      if (this.aiApiUrl && this.aiApiKey) {
        try {
          const response = await axios.post(
            `${this.aiApiUrl}/smart-reply`,
            {
              message: message.content,
              context
            },
            {
              headers: {
                'Authorization': `Bearer ${this.aiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          return response.data.suggestions;
        } catch (error) {
          console.error('AI API error:', error.message);
          // Fall back to rule-based suggestions
        }
      }

      // Rule-based smart reply fallback
      return this.generateRuleBasedReplies(message.content);
    } catch (error) {
      console.error('Smart reply error:', error);
      throw error;
    }
  }

  /**
   * Generate rule-based smart replies (fallback)
   */
  generateRuleBasedReplies(messageContent) {
    const content = messageContent.toLowerCase();
    
    const replies = [];

    // Questions
    if (content.includes('?')) {
      replies.push("I'll check and get back to you");
      replies.push("Let me think about that");
      replies.push("Good question!");
    }

    // Greetings
    if (content.match(/\b(hi|hello|hey|good morning|good evening)\b/)) {
      replies.push("Hello! How are you?");
      replies.push("Hi there!");
      replies.push("Hey! What's up?");
    }

    // Thanks
    if (content.match(/\b(thanks|thank you|appreciate)\b/)) {
      replies.push("You're welcome!");
      replies.push("No problem!");
      replies.push("Happy to help!");
    }

    // Agreement
    if (content.match(/\b(yes|yeah|sure|ok|okay)\b/)) {
      replies.push("Great!");
      replies.push("Sounds good");
      replies.push("Perfect!");
    }

    // Disagreement
    if (content.match(/\b(no|nope|don't|disagree)\b/)) {
      replies.push("I understand");
      replies.push("That's okay");
      replies.push("No worries");
    }

    // Default suggestions
    if (replies.length === 0) {
      replies.push("Got it");
      replies.push("Understood");
      replies.push("Thanks for letting me know");
    }

    return replies.slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Translate message
   */
  async translateMessage(messageId, targetLanguage) {
    try {
      const message = await Message.findById(messageId);
      
      if (!message) {
        throw new Error('Message not found');
      }

      // Check if already translated
      if (message.translations && message.translations[targetLanguage]) {
        return {
          original: message.content,
          translated: message.translations[targetLanguage],
          language: targetLanguage
        };
      }

      // If AI API is configured, use it for translation
      if (this.aiApiUrl && this.aiApiKey) {
        try {
          const response = await axios.post(
            `${this.aiApiUrl}/translate`,
            {
              text: message.content,
              targetLanguage
            },
            {
              headers: {
                'Authorization': `Bearer ${this.aiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          const translatedText = response.data.translatedText;

          // Save translation
          if (!message.translations) {
            message.translations = {};
          }
          message.translations[targetLanguage] = translatedText;
          await message.save();

          return {
            original: message.content,
            translated: translatedText,
            language: targetLanguage
          };
        } catch (error) {
          console.error('AI translation error:', error.message);
        }
      }

      // Fallback: Return original text with note
      return {
        original: message.content,
        translated: message.content,
        language: targetLanguage,
        note: 'Translation service not available'
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  /**
   * Summarize chat conversation
   */
  async summarizeChat(chatId, userId, limit = 100) {
    try {
      // Get recent messages
      const messages = await Message.find({
        chat: chatId,
        deletedFor: { $ne: userId }
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('sender', 'name email')
        .select('content sender createdAt type');

      if (messages.length === 0) {
        return {
          summary: 'No messages to summarize',
          messageCount: 0
        };
      }

      // If AI API is configured, use it
      if (this.aiApiUrl && this.aiApiKey) {
        try {
          const messageTexts = messages.reverse().map(msg => ({
            sender: msg.sender.name,
            content: msg.content,
            timestamp: msg.createdAt
          }));

          const response = await axios.post(
            `${this.aiApiUrl}/summarize`,
            {
              messages: messageTexts
            },
            {
              headers: {
                'Authorization': `Bearer ${this.aiApiKey}`,
                'Content-Type': 'application/json'
              }
            }
          );

          return {
            summary: response.data.summary,
            messageCount: messages.length,
            keyPoints: response.data.keyPoints || []
          };
        } catch (error) {
          console.error('AI summarization error:', error.message);
        }
      }

      // Rule-based summary fallback
      const senderCounts = {};
      let totalMessages = messages.length;

      messages.forEach(msg => {
        const senderName = msg.sender.name;
        senderCounts[senderName] = (senderCounts[senderName] || 0) + 1;
      });

      const summary = `Chat summary: ${totalMessages} messages exchanged. ` +
        Object.entries(senderCounts)
          .map(([name, count]) => `${name}: ${count} messages`)
          .join(', ');

      return {
        summary,
        messageCount: totalMessages,
        participants: Object.keys(senderCounts)
      };
    } catch (error) {
      console.error('Summarize chat error:', error);
      throw error;
    }
  }

  /**
   * Detect sentiment of message
   */
  async detectSentiment(text) {
    const positiveWords = ['good', 'great', 'awesome', 'excellent', 'love', 'happy', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'angry', 'disappointed'];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (lowerText.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (lowerText.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Extract action items from messages
   */
  async extractActionItems(messages) {
    const actionKeywords = ['todo', 'task', 'need to', 'should', 'must', 'deadline', 'by tomorrow', 'urgent'];
    const actionItems = [];

    messages.forEach(msg => {
      const lowerContent = msg.content.toLowerCase();
      
      actionKeywords.forEach(keyword => {
        if (lowerContent.includes(keyword)) {
          actionItems.push({
            content: msg.content,
            sender: msg.sender,
            timestamp: msg.createdAt
          });
        }
      });
    });

    return actionItems;
  }
}

module.exports = new AIService();
