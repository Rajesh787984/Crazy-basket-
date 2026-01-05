

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
}