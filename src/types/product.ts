export type ProductCategory = "vegetable" | "leaf";

export interface ProductSize {
  weight: string;
  price: number;
  inStock: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: ProductCategory;
  sizes: ProductSize[];
  images: string[];
  benefits: string[];
  howToUse: string[];
  nutrition?: string;
  tags: string[];
  featured: boolean;
  createdAt: string;
}
