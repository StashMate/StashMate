import { EXPO_PUBLIC_GEMINI_API_KEY } from '@env';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(EXPO_PUBLIC_GEMINI_API_KEY);

export async function sendMessageToGemini(message: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    let instruction = "Please provide a concise and easy-to-understand response.";
    const detailKeywords = ["details", "explain more", "in depth", "elaborate", "full explanation"];
    const lowerCaseMessage = message.toLowerCase();

    if (detailKeywords.some(keyword => lowerCaseMessage.includes(keyword))) {
      instruction = "Please provide a detailed and comprehensive response.";
    }

    const fullMessage = `${instruction}

User: ${message}`;

    const result = await model.generateContent(fullMessage);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('Error sending message to Gemini:', error);
    return 'Sorry, I am unable to respond at the moment.';
  }
}
