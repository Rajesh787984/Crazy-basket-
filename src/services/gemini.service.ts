import { Injectable } from '@angular/core';
import { GoogleGenAI, GenerateContentResult } from '@google/genai';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: any;

  constructor() {
    try {
      // API Key को environment फाइल से ले रहे हैं
      if (environment.firebase && environment.firebase.apiKey) {
        this.ai = new GoogleGenAI({ apiKey: environment.firebase.apiKey });
      } else {
        console.warn('Gemini API key not found in environment');
      }
    } catch (e) {
      console.error('Gemini init error', e);
    }
  }

  async generateText(prompt: string): Promise<string> {
    if (!this.ai) return 'AI Service not initialized';
    try {
      const model = this.ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result: GenerateContentResult = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini Error:', error);
      return 'Error generating text';
    }
  }
  
  // अगर आपको outfit recommendations वाला function भी चाहिए तो वो भी यहाँ रख सकते हैं
  async getOutfitRecommendations(occasion: string, products: any[], image?: any): Promise<any[]> {
      // ... (पुराना लॉजिक यहाँ कॉपी कर सकते हैं, बस API Key का ध्यान रखें)
      return [];
  }
}
