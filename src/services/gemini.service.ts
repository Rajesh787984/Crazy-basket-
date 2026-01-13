import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';
import { Product } from '../models/product.model';

export interface RecommendationResponse {
  category: string;
  productId: string;
  reasoning: string;
}

// ==================================================================================
// IMPORTANT: GEMINI API KEY
// ==================================================================================
// The Gemini API key was not configured, which would cause the app to crash when
// accessing AI features. I've added a placeholder below to prevent this.
//
// PLEASE REPLACE this placeholder value with your actual Gemini API key to enable
// the AI Style Helper feature.
// ==================================================================================
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";


@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    // The Gemini features will not work until a valid API key is provided.
    // This prevents the app from crashing if the key is missing.
    try {
      if (GEMINI_API_KEY && GEMINI_API_KEY !== "YOUR_GEMINI_API_KEY_HERE") {
        this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      } else {
        console.warn("Gemini API key is not configured. AI features will be disabled.");
      }
    } catch (e) {
      console.error("Could not initialize Gemini Service:", e);
    }
  }

  async getOutfitRecommendations(
    occasion: string,
    products: Product[],
    image?: { mimeType: string; data: string }
  ): Promise<RecommendationResponse[]> {
    if (!this.ai) {
      console.error('Gemini Service is not initialized. Please provide a valid API key.');
      throw new Error('AI stylist is not available. Please configure the API key.');
    }
    
    // Simplify products to only include essential info for the prompt
    const productCatalog = products.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        details: p.details.join(', '),
        price: p.price
    }));

    const systemInstruction = `You are an expert fashion stylist for an e-commerce platform called "Crazy Basket". Your goal is to create a complete, stylish outfit for the user based on their request. You MUST ONLY use products from the provided JSON catalog.`;
    
    let prompt = `I need an outfit for the following occasion: "${occasion}".

Please recommend a top, a bottom, shoes, and one accessory to create a complete look.

Here is the catalog of available products:
${JSON.stringify(productCatalog)}

For each item in the outfit, provide the product 'id', the item 'category' (e.g., Top, Bottom, Shoes, Accessory), and a brief 'reasoning' for your choice.`;

    const imagePart = image ? {
        inlineData: {
            mimeType: image.mimeType,
            data: image.data,
        },
    } : null;
    
    const textPart = { text: prompt };

    const contents = {
        parts: imagePart ? [textPart, imagePart] : [textPart],
    };

    if (imagePart) {
      prompt = `I need an outfit for the following occasion: "${occasion}". The outfit should complement this item I already own (see attached image).

Please recommend a top, a bottom, shoes, and one accessory to create a complete look.

Here is the catalog of available products:
${JSON.stringify(productCatalog)}

For each item in the outfit, provide the product 'id', the item 'category' (e.g., Top, Bottom, Shoes, Accessory), and a brief 'reasoning' for your choice.`;
      contents.parts[0] = { text: prompt };
    }


    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  description: "The type of clothing, e.g., 'Top', 'Bottom', 'Shoes', 'Accessory'.",
                },
                productId: {
                  type: Type.STRING,
                  description: 'The ID of the recommended product from the provided list.',
                },
                reasoning: {
                  type: Type.STRING,
                  description: 'A short justification for why this product was chosen for the outfit.',
                },
              },
            },
          },
        },
      });

      const jsonStr = response.text.trim();
      return JSON.parse(jsonStr) as RecommendationResponse[];

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to get recommendations from AI stylist.');
    }
  }
}
