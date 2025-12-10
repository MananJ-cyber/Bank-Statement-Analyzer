import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

// Helper to convert File to Base64
const fileToPart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    transactions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "YYYY-MM-DD format" },
          time: { type: Type.STRING, nullable: true },
          transaction_type: { type: Type.STRING, description: "debit, credit, upi, card, charge, atm, etc." },
          party: { type: Type.STRING, description: "Name of the payer or payee" },
          description: { type: Type.STRING },
          amount: { type: Type.NUMBER, description: "Absolute value of the transaction" },
          status: { type: Type.STRING, description: "successful, failed, reversed, pending" },
          balance: { type: Type.NUMBER, nullable: true, description: "The balance after this transaction if visible" },
        },
        required: ["date", "transaction_type", "party", "description", "amount", "status"],
      },
    },
    insights: {
      type: Type.OBJECT,
      properties: {
        totalCredits: { type: Type.NUMBER },
        totalDebits: { type: Type.NUMBER },
        topSpendingCategories: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING, description: "Specific name of the spending category (e.g., 'Groceries', 'Rent', 'Utilities', 'Shopping'). Do not use the word 'category'." },
              amount: { type: Type.NUMBER },
            },
            required: ["category", "amount"],
          },
        },
        monthlyExpenditurePattern: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              month: { type: Type.STRING, description: "Month name or YYYY-MM" },
              amount: { type: Type.NUMBER },
            },
            required: ["month", "amount"],
          },
        },
        predictedMonthlySavings: { type: Type.NUMBER },
        actionableSavingsSuggestions: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ["totalCredits", "totalDebits", "topSpendingCategories", "monthlyExpenditurePattern", "predictedMonthlySavings", "actionableSavingsSuggestions"],
    },
  },
  required: ["transactions", "insights"],
};

export const analyzeBankStatement = async (files: File[]): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare document parts (Images or PDFs)
  const documentParts = await Promise.all(files.map((file) => fileToPart(file)));

  const prompt = `
    You are an expert financial OCR system. 
    Analyze the provided bank statement documents (images or PDFs). 
    Extract every single transaction row available in the document.
    Normalize inconsistent terminology.
    Extract the date in YYYY-MM-DD format.
    Determine the transaction type (Credit/Debit/UPI/etc).
    Identify the 'Party' (who paid or who was paid).
    Extract the Balance if available in the row.
    
    After extracting transactions, perform a financial analysis to populate the insights section including:
    - Sum of credits and debits.
    - Categorize spending into meaningful groups (e.g., Food, Transport, Rent, Utilities, Shopping) and identify the top spending categories by total amount. Ensure the 'category' field contains the actual name of the category (e.g. "Groceries"), not the word "category".
    - Identify monthly spending patterns.
    - Predict savings and give suggestions.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: "user",
        parts: [
            { text: prompt },
            ...documentParts
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.1, // Low temperature for high extraction accuracy
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};