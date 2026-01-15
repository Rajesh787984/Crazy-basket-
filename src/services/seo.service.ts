import { Injectable, inject, OnDestroy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title, Meta, MetaDefinition } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class SeoService implements OnDestroy {
  private titleService: Title = inject(Title);
  private metaService: Meta = inject(Meta);
  private doc: Document = inject(DOCUMENT);
  private jsonLdScript: HTMLScriptElement | null = null;

  private readonly defaultTitle = 'Crazy Basket - Online Shopping for Fashion & More';
  private readonly defaultDescription = 'Shop online for men, women, and kids fashion, electronics, and customized gifts at Crazy Basket. Enjoy great deals, discounts, and fast delivery.';

  constructor() {
    this.setInitialTags();
  }

  private setInitialTags() {
    const initialTags: MetaDefinition[] = [
      { name: 'robots', content: 'index, follow' },
      { property: 'og:site_name', content: 'Crazy Basket' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ];
    initialTags.forEach(tag => this.metaService.updateTag(tag));
  }
  
  public updateTitle(title?: string): void {
    const finalTitle = title ? `${title} | Crazy Basket` : this.defaultTitle;
    this.titleService.setTitle(finalTitle);
    this.metaService.updateTag({ property: 'og:title', content: finalTitle });
    this.metaService.updateTag({ name: 'twitter:title', content: finalTitle });
  }

  public updateDescription(description?: string): void {
    const finalDescription = description || this.defaultDescription;
    this.metaService.updateTag({ name: 'description', content: finalDescription });
    this.metaService.updateTag({ property: 'og:description', content: finalDescription });
    this.metaService.updateTag({ name: 'twitter:description', content: finalDescription });
  }
  
  public updateImageUrl(imageUrl: string): void {
    this.metaService.updateTag({ property: 'og:image', content: imageUrl });
    this.metaService.updateTag({ name: 'twitter:image', content: imageUrl });
  }

  public updateJsonLd(data: object | null): void {
    if (!this.jsonLdScript) {
      this.jsonLdScript = this.doc.createElement('script');
      this.jsonLdScript.id = 'json-ld-schema';
      this.jsonLdScript.type = 'application/ld+json';
      this.doc.head.appendChild(this.jsonLdScript);
    }
    this.jsonLdScript.textContent = data ? JSON.stringify(data, null, 2) : '';
  }

  ngOnDestroy(): void {
    // Clean up the script tag if the service is destroyed
    if (this.jsonLdScript && this.jsonLdScript.parentNode) {
      this.doc.head.removeChild(this.jsonLdScript);
    }
  }
}
