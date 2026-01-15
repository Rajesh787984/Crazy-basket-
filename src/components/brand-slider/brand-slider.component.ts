import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-brand-slider',
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <section class="py-8 bg-gray-100 dark:bg-gray-800" aria-labelledby="brands-heading">
      <h2 id="brands-heading" class="text-center text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">FEATURED BRANDS</h2>
      <div class="w-full inline-flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <ul class="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll">
            @for(brand of brands; track brand.alt) {
              <li>
                <img [ngSrc]="brand.src" [alt]="brand.alt" class="h-10 w-auto" height="40" width="120">
              </li>
            }
        </ul>
        <ul class="flex items-center justify-center md:justify-start [&_li]:mx-8 [&_img]:max-w-none animate-infinite-scroll" aria-hidden="true">
            @for(brand of brands; track brand.alt) {
              <li>
                <img [ngSrc]="brand.src" [alt]="brand.alt" class="h-10 w-auto" height="40" width="120">
              </li>
            }
        </ul>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BrandSliderComponent {
  brands = [
    { src: 'https://img.icons8.com/color/48/nike.png', alt: 'Nike' },
    { src: 'https://img.icons8.com/color/48/adidas-trefoil.png', alt: 'Adidas' },
    { src: 'https://img.icons8.com/color/48/puma-se-logo.png', alt: 'Puma' },
    { src: 'https://img.icons8.com/color/48/levis.png', alt: "Levi's" },
    { src: 'https://img.icons8.com/color/48/zara-logo.png', alt: 'Zara' },
    { src: 'https://img.icons8.com/color/48/h-and-m-logo.png', alt: 'H&M' },
    { src: 'https://img.icons8.com/color/48/sony.png', alt: 'Sony' },
    { src: 'https://img.icons8.com/color/48/samsung.png', alt: 'Samsung' },
  ];
}