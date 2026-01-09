import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GOOGLE_AI_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    // We don't throw immediately to allow app to start, but services relying on it will fail
    console.warn('⚠️ GOOGLE_AI_KEY is not set in environment variables.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');
export const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
