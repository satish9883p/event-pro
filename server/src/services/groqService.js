import axios from 'axios';
import { env } from '../config/env.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.1-8b-instant';

export const callGroqAPI = async (messages) => {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: GROQ_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          Authorization: `Bearer ${env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      content: response.data.choices[0].message.content,
    };
  } catch (error) {
    console.error('Groq API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error?.message || 'Failed to get AI response',
    };
  }
};

export const generateEventAssistantContext = (events = []) => {
  if (events.length === 0) {
    return 'No events available in the system.';
  }

  const eventSummaries = events
    .map(
      (event) =>
        `- ${event.title} (${event.category}): ${event.date} at ${event.venue}, Capacity: ${event.capacity}, Status: ${event.status}`
    )
    .join('\n');

  return `Here are the available events:\n${eventSummaries}`;
};

export const createAssistantMessage = (userMessage, eventContext) => {
  const systemMessage = `You are Event Pro Assistant, a helpful assistant for Event Pro – Event & Function Hall Booking Platform. You help users with:
- Event and Function Hall related questions
- Venue search, locations, and capacity discovery
- Booking and slot availability guidance
- Venue and date/time information
- Pricing breakdowns and additional services
- Booking policies and FAQs about the platform

Always be helpful and provide accurate information based on the event context provided. If asked about information not available in the system, clearly state that the information is not available. Never invent event details.

Available Events Context:
${eventContext}

Current Time: ${new Date().toISOString()}`;

  return [
    {
      role: 'system',
      content: systemMessage,
    },
    {
      role: 'user',
      content: userMessage,
    },
  ];
};
