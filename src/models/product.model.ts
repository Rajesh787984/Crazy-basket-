

export interface ProductSize {
  name: string;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  images: string[];
  sizes: ProductSize[];
  details: string[];
  fit: string;
  fabric: string;
  category: string;
  tags?: string[];
  isCodAvailable: boolean;
  videoUrl?: string;
  b2bPrice?: number;
  flashSale?: {
    price: number;
    endDate: string; // ISO string format
  };
  allowPhotoUpload: boolean;
  sizeChartUrl?: string;
  preorderAvailable: boolean;
  bundleOffer?: {
    bundledProductId: string;
    offerText: string;
  };
  // New fields from user request
  color: string;
  pattern: string;
  idealFor: string; // e.g., 'Men', 'Women', 'Kids', 'Unisex'
  sleeve: string;
  closure: string;
  fabricCare: string;
  // FIX: Added optional returnWindowDays property to align with its usage in product seed data.
  returnWindowDays?: number;
}
