import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { Product } from '../models/product.model';
import { environment } from '../environments/environment';

export interface RecommendationResponse {
  category: string;
  productId: string;
  reasoning: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // ✅ FIX: API Key सीधे environment फाइल से उठा रहे हैं
    const apiKey = environment.firebase ? environment.firebase.apiKey : '';
    this.ai = new GoogleGenAI({ apiKey: apiKey });
  }

  async getOutfitRecommendations(
    occasion: string,
    products: Product[],
    image?: { mimeType: string; data: string }
  ): Promise<RecommendationResponse[]> {
    
    // प्रोडक्ट लिस्ट को छोटा कर रहे हैं ताकि AI को आसानी हो
    const productCatalog = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price
    }));

    let prompt = `Recommend an outfit for: "${occasion}". 
    Choose from this catalog: ${JSON.stringify(productCatalog)}. 
    Return strictly JSON format with productId, category, and reasoning.`;

    const contents: any = { parts: [{ text: prompt }] };

    if (image) {
       contents.parts.push({
          inlineData: { mimeType: image.mimeType, data: image.data }
       });
    }

    try {
      const response: any = await this.ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents,
        config: { responseMimeType: 'application/json' }
      });

      const jsonStr = response.text().trim();
      return JSON.parse(jsonStr) as RecommendationResponse[];

    } catch (error) {
      console.error('Gemini API Error:', error);
      return [];
    }
  }
}
