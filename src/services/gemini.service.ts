import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
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
  private ai: any; // Type 'any' use kar rahe hain taaki version issue na ho

  constructor() {
    // Environment file se API Key lenge
    const apiKey = environment.firebase ? environment.firebase.apiKey : '';
    
    if (apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey: apiKey });
      } catch (error) {
        console.error('Gemini Init Error:', error);
      }
    }
  }

  async getOutfitRecommendations(
    occasion: string,
    products: Product[],
    image?: { mimeType: string; data: string }
  ): Promise<RecommendationResponse[]> {
    
    if (!this.ai) return [];

    // Product list ko simplify kar rahe hain
    const productCatalog = products.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price
    }));

    let prompt = `Recommend an outfit for: "${occasion}". 
    From this catalog: ${JSON.stringify(productCatalog)}. 
    Return strictly JSON array.`;

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
