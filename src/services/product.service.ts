

import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private products: Product[] = [
    // Men
    {
      id: '1',
      name: 'Polo Collar Slim Fit T-shirt',
      brand: 'Louis Philippe',
      price: 1064,
      originalPrice: 1499,
      b2bPrice: 950,
      discount: 29,
      rating: 4.4,
      reviews: 16000,
      images: ['https://picsum.photos/id/1025/400/600', 'https://picsum.photos/id/1026/400/600', 'https://picsum.photos/id/1027/400/600'],
      sizes: [ { name: 'S', inStock: true }, { name: 'M', inStock: true }, { name: 'L', inStock: false }, { name: 'XL', inStock: true }, { name: 'XXL', inStock: false }, ],
      details: ['Navy blue T-shirt for men', 'Solid', 'Regular length', 'Polo collar', 'Short, regular sleeves', 'Knitted cotton fabric', 'Button closure'],
      fit: 'Slim Fit',
      fabric: '60% Cotton, 40% Polyester',
      category: 'Men',
      tags: ['tshirt', 't-shirt', 'tee', 'top', 'polo', 'navy blue', 'men apparel'],
      isCodAvailable: true,
      videoUrl: 'https://www.youtube.com/embed/ScMzIvxBSi4',
      flashSale: {
        price: 899,
        endDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
      },
      allowPhotoUpload: true,
      sizeChartUrl: 'https://picsum.photos/id/10/800/600',
      preorderAvailable: true,
       bundleOffer: {
        bundledProductId: '11',
        offerText: 'Buy with Slim Fit Jeans and save big!'
      }
    },
    {
      id: '2',
      name: 'Cotton Pure Cotton T-shirt',
      brand: 'H&M',
      price: 399,
      originalPrice: 499,
      b2bPrice: 350,
      discount: 20,
      rating: 4.2,
      reviews: 57800,
      images: ['https://picsum.photos/id/200/400/600', 'https://picsum.photos/id/201/400/600'],
      sizes: [ { name: 'S', inStock: true }, { name: 'M', inStock: true }, { name: 'L', inStock: true }, ],
      details: ['White T-shirt for men', 'Solid color', 'Round neck'],
      fit: 'Regular Fit',
      fabric: '100% Cotton',
      category: 'Men',
      tags: ['tshirt', 't-shirt', 'tee', 'top', 'white', 'men apparel', 'round neck'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: false,
    },
    {
      id: '3',
      name: '3-Pack Regular Fit T-shirts',
      brand: 'H&M',
      price: 1199,
      originalPrice: 1499,
      b2bPrice: 1050,
      discount: 20,
      rating: 4.1,
      reviews: 9400,
      images: ['https://picsum.photos/id/305/400/600', 'https://picsum.photos/id/306/400/600'],
      sizes: [ { name: 'S', inStock: false }, { name: 'M', inStock: true }, { name: 'L', inStock: true }, { name: 'XL', inStock: true }, ],
      details: ['Pack of 3 t-shirts in different colors', 'Solid', 'Regular length'],
      fit: 'Regular Fit',
      fabric: '100% Cotton',
      category: 'Men',
      tags: ['tshirt', 't-shirt', 'tee', 'top', 'pack', 'combo', 'men apparel'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: true,
    },
    {
      id: '9',
      name: 'Men Slim Fit Casual Shirt',
      brand: 'Roadster',
      price: 799,
      originalPrice: 1599,
      b2bPrice: 700,
      discount: 50,
      rating: 4.1,
      reviews: 22000,
      images: ['https://picsum.photos/id/322/400/600', 'https://picsum.photos/id/323/400/600'],
      sizes: [ { name: 'S', inStock: true }, { name: 'M', inStock: true }, { name: 'L', inStock: true }, { name: 'XL', inStock: true }, ],
      details: ['Checked casual shirt', 'Full sleeves', 'Spread collar'],
      fit: 'Slim Fit',
      fabric: '100% Cotton',
      category: 'Men',
      tags: ['shirt', 'casual shirt', 'checked', 'checks', 'men apparel'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      sizeChartUrl: 'https://picsum.photos/id/11/800/600',
      preorderAvailable: false,
    },
    {
      id: '11',
      name: 'Mid-Rise Slim Fit Jeans',
      brand: 'Levi\'s',
      price: 1799,
      originalPrice: 2999,
      b2bPrice: 1650,
      discount: 40,
      rating: 4.5,
      reviews: 12000,
      images: ['https://picsum.photos/id/145/400/600', 'https://picsum.photos/id/146/400/600'],
      sizes: [ { name: '30', inStock: true }, { name: '32', inStock: true }, { name: '34', inStock: false }, { name: '36', inStock: true }, ],
      details: ['Blue dark wash 5-pocket jeans', 'Slim fit, mid-rise', 'Stretchable denim'],
      fit: 'Slim Fit',
      fabric: '98% Cotton, 2% Elastane',
      category: 'Men',
      tags: ['jeans', 'denim', 'pants', 'bottoms', 'blue', 'men apparel'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: true,
    },
    {
      id: '12',
      name: 'Men Solid Running Shoes',
      brand: 'Puma',
      price: 2499,
      originalPrice: 4999,
      b2bPrice: 2200,
      discount: 50,
      rating: 4.3,
      reviews: 8500,
      images: ['https://picsum.photos/id/211/400/600', 'https://picsum.photos/id/212/400/600'],
      sizes: [ { name: '8', inStock: true }, { name: '9', inStock: true }, { name: '10', inStock: false }, { name: '11', inStock: true }, ],
      details: ['Mesh upper for breathability', 'Lace-up closure', 'Cushioned footbed'],
      fit: 'Regular',
      fabric: 'Mesh',
      category: 'Men',
      tags: ['shoes', 'footwear', 'sneakers', 'running', 'sports', 'men footwear'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: false,
    },
    // Women
    {
      id: '4',
      name: 'Printed Kurta Set',
      brand: 'Anouk',
      price: 1259,
      originalPrice: 3499,
      b2bPrice: 1100,
      discount: 64,
      rating: 4.3,
      reviews: 2100,
      images: ['https://picsum.photos/id/401/400/600', 'https://picsum.photos/id/402/400/600'],
      sizes: [ { name: 'M', inStock: true }, { name: 'L', inStock: true }, { name: 'XL', inStock: false }, ],
      details: ['Beautiful printed kurta', 'Comes with palazzos', 'Three-quarter sleeves'],
      fit: 'Regular Fit',
      fabric: 'Viscose Rayon',
      category: 'Women',
      tags: ['kurta', 'kurta set', 'ethnic', 'traditional', 'indian wear', 'women apparel'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: true,
    },
    {
      id: '5',
      name: 'Floral Print Top',
      brand: 'Tokyo Talkies',
      price: 454,
      originalPrice: 999,
      b2bPrice: 400,
      discount: 55,
      rating: 4.0,
      reviews: 12000,
      images: ['https://picsum.photos/id/503/400/600', 'https://picsum.photos/id/504/400/600'],
      sizes: [ { name: 'S', inStock: true }, { name: 'M', inStock: true }, { name: 'L', inStock: true }, ],
      details: ['Stylish floral print', 'Puff sleeves', 'Square neck'],
      fit: 'Slim Fit',
      fabric: 'Polyester',
      category: 'Women',
      tags: ['top', 'floral', 'women apparel', 'blouse'],
      isCodAvailable: false,
      allowPhotoUpload: false,
      preorderAvailable: false,
    },
    {
      id: '6',
      name: 'High-Rise Jeans',
      brand: 'Mast & Harbour',
      price: 899,
      originalPrice: 1999,
      b2bPrice: 800,
      discount: 55,
      rating: 4.2,
      reviews: 18000,
      images: ['https://picsum.photos/id/601/400/600', 'https://picsum.photos/id/602/400/600'],
      sizes: [ { name: '28', inStock: true }, { name: '30', inStock: false }, { name: '32', inStock: true }, { name: '34', inStock: true }, ],
      details: ['Classic blue wash', '5-pocket design', 'Stretchable denim'],
      fit: 'Skinny Fit',
      fabric: 'Cotton, Elastane',
      category: 'Women',
      tags: ['jeans', 'denim', 'pants', 'bottoms', 'blue', 'women apparel', 'skinny'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: false,
    },
    {
      id: '10',
      name: 'Women Solid A-Line Kurta',
      brand: 'W',
      price: 1299,
      originalPrice: 2599,
      b2bPrice: 1150,
      discount: 50,
      rating: 4.4,
      reviews: 4500,
      images: ['https://picsum.photos/id/411/400/600', 'https://picsum.photos/id/412/400/600'],
      sizes: [ { name: 'M', inStock: true }, { name: 'L', inStock: false }, { name: 'XL', inStock: true }, { name: 'XXL', inStock: true }, ],
      details: ['Elegant solid kurta', 'Three-quarter sleeves', 'Mandarin collar'],
      fit: 'A-Line',
      fabric: 'Viscose Rayon',
      category: 'Women',
      tags: ['kurta', 'ethnic', 'traditional', 'indian wear', 'women apparel', 'a-line'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: true,
    },
    {
      id: '13',
      name: 'Solid Heeled Boots',
      brand: 'DressBerry',
      price: 1499,
      originalPrice: 2999,
      b2bPrice: 1300,
      discount: 50,
      rating: 4.5,
      reviews: 3200,
      images: ['https://picsum.photos/id/621/400/600', 'https://picsum.photos/id/622/400/600'],
      sizes: [ { name: '37', inStock: true }, { name: '38', inStock: true }, { name: '39', inStock: false }, ],
      details: ['Tan brown solid boots', 'Side zip closure', 'Block heels'],
      fit: 'Regular',
      fabric: 'Synthetic',
      category: 'Women',
      tags: ['shoes', 'footwear', 'boots', 'heels', 'brown', 'tan', 'women footwear'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: false,
    },
    {
      id: '14',
      name: 'Women Embellished Saree',
      brand: 'KALINI',
      price: 999,
      originalPrice: 2499,
      b2bPrice: 850,
      discount: 60,
      rating: 4.1,
      reviews: 1500,
      images: ['https://picsum.photos/id/431/400/600', 'https://picsum.photos/id/432/400/600'],
      sizes: [ { name: 'One Size', inStock: true } ],
      details: ['Elegant embellished saree', 'Comes with a blouse piece', 'Perfect for festive occasions'],
      fit: 'Regular',
      fabric: 'Georgette',
      category: 'Women',
      tags: ['saree', 'sari', 'ethnic', 'traditional', 'indian wear', 'women apparel', 'embellished'],
      isCodAvailable: false,
      allowPhotoUpload: false,
      preorderAvailable: false,
    },
    // Kids
    {
      id: '7',
      name: 'Boys Printed T-shirt',
      brand: 'Gini & Jony',
      price: 349,
      originalPrice: 499,
      b2bPrice: 300,
      discount: 30,
      rating: 4.5,
      reviews: 500,
      images: ['https://picsum.photos/id/1/400/600', 'https://picsum.photos/id/2/400/600'],
      sizes: [ { name: '2-3Y', inStock: true }, { name: '3-4Y', inStock: true }, { name: '4-5Y', inStock: true }, ],
      details: ['Fun graphic print', 'Round neck', 'Comfortable cotton'],
      fit: 'Regular Fit',
      fabric: '100% Cotton',
      category: 'Kids',
      tags: ['tshirt', 't-shirt', 'tee', 'top', 'kids apparel', 'boys wear', 'graphic'],
      isCodAvailable: true,
      allowPhotoUpload: true,
      preorderAvailable: false,
    },
    {
      id: '8',
      name: 'Girls Embellished Dress',
      brand: 'Cutecumber',
      price: 1499,
      originalPrice: 2499,
      b2bPrice: 1350,
      discount: 40,
      rating: 4.6,
      reviews: 350,
      images: ['https://picsum.photos/id/103/400/600', 'https://picsum.photos/id/104/400/600'],
      sizes: [ { name: '5-6Y', inStock: true }, { name: '6-7Y', inStock: false }, { name: '7-8Y', inStock: true }, ],
      details: ['Party wear dress', 'Sequin details', 'Net fabric overlay'],
      fit: 'Regular Fit',
      fabric: 'Polyester',
      category: 'Kids',
      tags: ['dress', 'frock', 'party wear', 'kids apparel', 'girls wear', 'embellished'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: true,
    },
     {
      id: '15',
      name: 'Unisex Dino Print Sneakers',
      brand: 'YK',
      price: 799,
      originalPrice: 1299,
      b2bPrice: 720,
      discount: 38,
      rating: 4.7,
      reviews: 450,
      images: ['https://picsum.photos/id/161/400/600', 'https://picsum.photos/id/162/400/600'],
      sizes: [ { name: 'C7', inStock: true }, { name: 'C8', inStock: true }, { name: 'C9', inStock: true }, ],
      details: ['Fun dinosaur print', 'Velcro closure for easy wear', 'Comfortable for all-day play'],
      fit: 'Regular',
      fabric: 'Canvas',
      category: 'Kids',
      tags: ['shoes', 'footwear', 'sneakers', 'kids footwear', 'unisex', 'dinosaur'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: false,
    },
    {
      id: '16',
      name: 'Girls Printed Leggings',
      brand: 'Mothercare',
      price: 599,
      originalPrice: 799,
      b2bPrice: 540,
      discount: 25,
      rating: 4.4,
      reviews: 200,
      images: ['https://picsum.photos/id/123/400/600', 'https://picsum.photos/id/124/400/600'],
      sizes: [ { name: '1-2Y', inStock: true }, { name: '2-3Y', inStock: true }, { name: '3-4Y', inStock: false }, ],
      details: ['Cute all-over print', 'Elasticated waistband', 'Soft and stretchable fabric'],
      fit: 'Regular',
      fabric: 'Cotton Blend',
      category: 'Kids',
      tags: ['leggings', 'bottoms', 'pants', 'kids apparel', 'girls wear'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: false,
    },
    {
      id: '17',
      name: 'Boys Pack of 2 Shorts',
      brand: 'Allen Solly Junior',
      price: 899,
      originalPrice: 1499,
      b2bPrice: 810,
      discount: 40,
      rating: 4.5,
      reviews: 600,
      images: ['https://picsum.photos/id/55/400/600', 'https://picsum.photos/id/56/400/600'],
      sizes: [ { name: '7-8Y', inStock: true }, { name: '8-9Y', inStock: true }, { name: '9-10Y', inStock: true }, ],
      details: ['Pack contains two pairs of shorts', 'Drawstring waist', 'Ideal for summer wear'],
      fit: 'Regular Fit',
      fabric: '100% Cotton',
      category: 'Kids',
      tags: ['shorts', 'bottoms', 'pack', 'combo', 'kids apparel', 'boys wear'],
      isCodAvailable: true,
      allowPhotoUpload: false,
      preorderAvailable: false,
    }
  ];

  getAllProducts(): Product[] {
    return this.products;
  }

  getProducts(category: string | null): Product[] {
    if (!category) {
        return this.products;
    }
    return this.products.filter(p => p.category === category);
  }

  getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  addProduct(product: Omit<Product, 'id'>) {
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}`,
    };
    this.products.unshift(newProduct);
  }

  updateProduct(updatedProduct: Product) {
    const index = this.products.findIndex(p => p.id === updatedProduct.id);
    if (index > -1) {
      this.products[index] = updatedProduct;
    }
  }

  deleteProduct(productId: string) {
    this.products = this.products.filter(p => p.id !== productId);
  }

  updateCategoryName(oldName: string, newName: string) {
    this.products.forEach(p => {
      if (p.category === oldName) {
        p.category = newName;
      }
    });
  }

  bulkUpdatePrices(
    type: 'category' | 'brand',
    name: string,
    updateType: 'percent' | 'flat',
    direction: 'increase' | 'decrease',
    value: number
  ): number {
    let updatedCount = 0;
    this.products.forEach(p => {
      if ((type === 'category' && p.category === name) || (type === 'brand' && p.brand === name)) {
        let newPrice = p.price;
        if (updateType === 'percent') {
          const change = p.originalPrice * (value / 100);
          newPrice = direction === 'increase' ? p.price + change : p.price - change;
        } else { // flat amount
          newPrice = direction === 'increase' ? p.price + value : p.price - value;
        }

        // Ensure price doesn't go below 0 or above original price
        p.price = Math.max(1, Math.min(newPrice, p.originalPrice));
        p.price = Math.round(p.price);

        // Recalculate discount
        p.discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
        
        updatedCount++;
      }
    });
    return updatedCount;
  }
}