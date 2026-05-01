import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Falta GEMINI_API_KEY en las variables de entorno");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Modelo principal: responde siempre en JSON
export const geminiFlash = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    temperature: 0.2, // baja temperatura = respuestas más consistentes y precisas
  },
});
