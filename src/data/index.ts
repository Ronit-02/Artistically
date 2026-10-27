import type {
  Product,
  CartItem,
  Artist,
  Story,
  Review,
  OrderItem,
  TrackingItem,
  OrderStep,
} from "@/types";

export const paintings: Product[] = [];

export const sculptures: Product[] = [];

export const ceramics: Product[] = [];

export const artists: Artist[] = [];

export const stories: Story[] = [];

export const reviews: Review[] = [];

export const initialCartItems: CartItem[] = [];

export const allProducts: Product[] = [...paintings, ...sculptures, ...ceramics];

export const categories: string[] = [
  "Paintings", 
  "Digital Art", 
  "Sculptures", 
  "Glass Art", 
  "Woodwork", 
  "Ceramics",
];

export const orderHistory: OrderItem[] = [];

export const trackingItems: TrackingItem[] = [];

export const ORDER_STEPS: OrderStep[] = [
  { n: 1, title: "Almost there!", sub: "Preparing your artwork", active: true },
  { n: 2, title: "Done!", sub: "Artwork ready for delivery", active: false },
  { n: 3, title: "Delivered!", sub: "Artwork successfully delivered", active: false },
];

export const ART_TYPES = [
  "Digital Art", "3D Art", "Photography", "Textile Design",
  "Calligraphy", "Painting", "Drawing", "Sculpture",
  "Jewelry", "Ceramics", "Glass Art", "Woodwork",
];

export const PRICE_RANGES = [
  "Under ₹500", "₹500 - ₹1,000", "₹1,000 - ₹2,000",
  "₹2,000 - ₹3,000", "Over ₹3,000",
];

export const PRICE_RANGE_MAP: Record<string, [number, number]> = {
  "Under ₹500":       [0,    499],
  "₹500 - ₹1,000":   [500,  1000],
  "₹1,000 - ₹2,000": [1000, 2000],
  "₹2,000 - ₹3,000": [2000, 3000],
  "Over ₹3,000":      [3000, Infinity],
};
