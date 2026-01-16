import { Injectable, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';

export interface HeroSlide {
  id: number;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  productId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  // Firebase हटा दिया गया है, अब हम यहाँ डायरेक्ट डेटा यूज़ करेंगे
  
  // 1. Hero Slides (बैनर इमेजेस)
  heroSlides: WritableSignal<HeroSlide[]> = signal([
    {
      id: 1,
      imageUrl: 'https://picsum.photos/seed/slide1/1200/400',
      title: 'Summer Collection',
      subtitle: 'Up to 50% Off on new arrivals',
      productId: '1'
    },
    {
      id: 2,
      imageUrl: 'https://picsum.photos/seed/slide2/1200/400',
      title: 'New Trends',
      subtitle: 'Explore the latest fashion',
      productId: '2'
    }
  ]);

  // 2. Home Page Sections (कौन से सेक्शन दिखाने हैं)
  homePageSections = signal<string[]>(['slider', 'deals', 'trending']);

  constructor(private router: Router) {}

  // 3. Navigation Function (पेज बदलने के लिए)
  navigateTo(path: string, params?: any) {
    if (params) {
      this.router.navigate([path, params]);
    } else {
      this.router.navigate([path]);
    }
  }
}
