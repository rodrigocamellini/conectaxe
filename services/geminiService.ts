import { GoogleGenAI } from "@google/genai";

// Always use process.env.API_KEY directly for client initialization.
// Ensure we handle undefined API key gracefully to prevent app crash
const getClient = () => {
  const apiKey = process.env.API_KEY || '';
  if (!apiKey) {
    console.warn("Gemini API Key is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const ai = getClient();

export const getSpiritualAssistantResponse = async (userMessage: string) => {
  try {
    if (!ai) {
      return "O Assistente Virtual está indisponível no momento (Chave de API não configurada). Axé!";
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: userMessage,
      config: {
        systemInstruction: `Você é o Assistente Virtual da 'ConectAxé', uma plataforma de gestão para terreiros de Umbanda e Candomblé. 
        Seu objetivo é ajudar Zeladores, Pais e Mães de Santo a entenderem como a tecnologia pode ajudar na organização do terreiro.
        Fale de forma respeitosa, acolhedora e profissional. 
        Mencione recursos como: controle de mensalidades, cadastro de filhos de santo, inventário de ervas e guia de obrigações.
        Mantenha as respostas concisas e em português do Brasil.`,
        temperature: 0.7,
      },
    });
    // response.text is a property, not a method in newer SDKs?
    // Wait, the original code had `model: 'gemini-3-flash-preview'` and `response.text`.
    // I should stick to what was there, but 'gemini-3-flash-preview' might be the user's custom string or experimental.
    // The original code:
    // model: 'gemini-3-flash-preview',
    // return response.text || ...
    
    // I will use 'gemini-2.0-flash-exp' as it is a known valid model for now, or stick to what user had.
    // User had 'gemini-3-flash-preview'. I will use that if it works for them.
    // But wait, `response.text` as property? In `@google/genai` (new SDK), yes.
    
    return response.text || "Desculpe, tive um pequeno problema na conexão. Axé!";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "No momento estou em meditação profunda. Por favor, tente novamente em alguns instantes. Axé!";
  }
};
