const aiRouter = require('./ai-router');
const logger = require('../utils/logger');

/**
 * AI Tutor Engine - Handles student doubts and conversational tutoring
 */
class TutorEngine {
  /**
   * Answer student question
   */
  async answerQuestion(question, context = {}) {
    const { subject, topic, examType, studentLevel } = context;

    const systemPrompt = `
You are an expert tutor specializing in ${subject || 'all subjects'} for ${examType || 'competitive exams'}.
You are teaching a ${studentLevel || 'intermediate'} level student.

Your teaching style:
- Clear, step-by-step explanations
- Use simple language and analogies
- Provide examples and real-world connections
- Encourage and motivate the student
- Check understanding with follow-up questions
- Point out common mistakes
- Give exam-specific tips

Always:
1. Start by acknowledging the question
2. Break down the answer logically
3. Use formatting (bold, bullet points) for clarity
4. End with a practice problem or follow-up question
5. Be supportive and encouraging

Never:
- Give incomplete answers
- Use overly technical jargon without explaining
- Make the student feel bad for asking
- Skip important steps in solutions`;

    const prompt = `
Student Question: ${question}

${topic ? `Topic Context: ${topic}` : ''}

Please provide a comprehensive answer following the teaching style above.`;

    try {
      const answer = await aiRouter.generate(prompt, {
        systemPrompt,
        needSpeed: true,
        temperature: 0.7,
      });

      logger.info('Generated answer for student question');
      return answer;
    } catch (error) {
      logger.error('Failed to answer question:', error);
      throw error;
    }
  }

  /**
   * Stream answer for real-time chat experience
   */
  async *streamAnswer(question, context = {}) {
    const { subject, topic, examType, studentLevel } = context;

    const systemPrompt = `You are a friendly, expert tutor for ${examType || 'competitive exams'}. 
Answer clearly and step-by-step. Be encouraging and supportive.`;

    const prompt = `
Student asks: ${question}
${topic ? `(Topic: ${topic})` : ''}

Provide a clear, helpful answer:`;

    try {
      const stream = aiRouter.generateStream(prompt, {
        systemPrompt,
        temperature: 0.7,
      });

      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error) {
      logger.error('Failed to stream answer:', error);
      throw error;
    }
  }

  /**
   * Start conversational chat session
   */
  async startChatSession(studentId, context = {}) {
    try {
      const chat = await aiRouter.startChat([
        {
          role: 'model',
          content: `Hello! I'm your AI tutor for ${context.subject || 'all subjects'}. I'm here to help you prepare for ${context.examType || 'your exam'}. Feel free to ask me anything - doubts, concepts, problem-solving, or exam strategies. Let's learn together! 📚`,
        },
      ]);

      logger.info('Started chat session', { studentId });
      return chat;
    } catch (error) {
      logger.error('Failed to start chat session:', error);
      throw error;
    }
  }

  /**
   * Explain answer to a question
   */
  async explainAnswer(question, studentAnswer, correctAnswer, options = {}) {
    const prompt = `
Question: ${question}

Student's Answer: ${studentAnswer}
Correct Answer: ${correctAnswer}

Please provide:
1. Is the student's answer correct? (Yes/No)
2. If wrong, where exactly did they go wrong?
3. Detailed explanation of the correct solution (step-by-step)
4. Key concept that was tested
5. Tips to avoid this mistake in future
6. A similar practice question to reinforce learning

Be encouraging even if the answer is wrong. Focus on learning, not criticism.

Return as JSON:
{
  "isCorrect": boolean,
  "feedback": "string",
  "explanation": "string (detailed, step-by-step)",
  "conceptTested": "string",
  "mistake": "string (if wrong)",
  "tips": ["string"],
  "practiceQuestion": {
    "question": "string",
    "options": {"A": "string", "B": "string", "C": "string", "D": "string"},
    "correctAnswer": "string"
  }
}`;

    try {
      const explanation = await aiRouter.generateJSON(prompt, { needSpeed: true });
      logger.info('Generated answer explanation');
      return explanation;
    } catch (error) {
      logger.error('Failed to explain answer:', error);
      throw error;
    }
  }

  /**
   * Provide personalized recommendations
   */
  async getRecommendations(studentProfile) {
    const {
      recentScores,
      weakTopics,
      strongTopics,
      studyTime,
      examDate,
      lastActive,
    } = studentProfile;

    const daysUntilExam = Math.ceil(
      (new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const prompt = `
Analyze this student's performance and provide personalized recommendations:

Performance Data:
- Recent Test Scores: ${recentScores.join(', ')}%
- Weak Topics: ${weakTopics.join(', ')}
- Strong Topics: ${strongTopics.join(', ')}
- Average Daily Study Time: ${studyTime} hours
- Days Until Exam: ${daysUntilExam}
- Last Active: ${lastActive}

Provide specific, actionable recommendations:
1. What to focus on next (prioritized)
2. Study strategy adjustments
3. Time management suggestions
4. Motivation and encouragement
5. Exam preparation tips

Be realistic, supportive, and specific.

Return as JSON:
{
  "overallFeedback": "string (encouraging summary)",
  "priorities": [
    {
      "rank": number,
      "topic": "string",
      "reason": "string",
      "action": "string (what to do)",
      "timeEstimate": "string"
    }
  ],
  "strategyAdjustments": ["string"],
  "motivationalMessage": "string",
  "nextSteps": ["string"],
  "examReadiness": "string (percentage or assessment)"
}`;

    try {
      const recommendations = await aiRouter.generateJSON(prompt, { usePro: true });
      logger.info('Generated recommendations');
      return recommendations;
    } catch (error) {
      logger.error('Failed to generate recommendations:', error);
      throw error;
    }
  }

  /**
   * Generate hints for a problem (without giving full solution)
   */
  async generateHints(question, difficulty = 'medium') {
    const prompt = `
Question: ${question}

Generate 3 progressive hints to help a student solve this problem WITHOUT giving the complete answer:

Hint 1: Very subtle nudge - just a starting direction
Hint 2: More specific - what concept/formula to use
Hint 3: Almost there - show the approach but not final answer

Each hint should help the student think, not just give away the solution.

Return as JSON:
{
  "hints": [
    {
      "level": 1,
      "hint": "string"
    },
    {
      "level": 2,
      "hint": "string"
    },
    {
      "level": 3,
      "hint": "string"
    }
  ],
  "encouragement": "string (motivational message)"
}`;

    try {
      const hints = await aiRouter.generateJSON(prompt, { needSpeed: true });
      logger.info('Generated hints for problem');
      return hints;
    } catch (error) {
      logger.error('Failed to generate hints:', error);
      throw error;
    }
  }

  /**
   * Analyze image question (for diagram-based problems)
   */
  async analyzeImageQuestion(imageData, question, context = {}) {
    const prompt = `
The student has uploaded an image with this question: ${question}

${context.subject ? `Subject: ${context.subject}` : ''}
${context.topic ? `Topic: ${context.topic}` : ''}

Please:
1. Describe what you see in the image
2. Identify the key elements/data in the image
3. Explain how to solve this problem step-by-step
4. Provide the solution

Be clear and thorough.`;

    try {
      const analysis = await aiRouter.generateWithImage(prompt, imageData, {
        usePro: true,
      });

      logger.info('Analyzed image question');
      return analysis;
    } catch (error) {
      logger.error('Failed to analyze image:', error);
      throw error;
    }
  }
}

module.exports = new TutorEngine();
