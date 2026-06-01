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

export const paintings: Product[] = [
  { id: 1, title: "Flower Canvas Painting", artist: "VASL", artistName: "VASL", rating: 4.5, reviews: 81, price: 2499, originalPrice: 4999, discount: 50, image: "/paintings/painting-1.jpg", category: "Paintings" },
  { id: 2, title: "Color Abstract Painting", artist: "Alexis Johnson", artistName: "Alexis Johnson", rating: 4.5, reviews: 54, price: 2499, originalPrice: 5900, discount: 58, image: "/paintings/painting-2.jpg", category: "Paintings", badge: "LIMITED EDITION" },
  { id: 3, title: "7 Colors Decors Beautiful Colourful Trees Landscape Painting", artist: "Amar Sharma", artistName: "Amar Sharma", rating: 4, reviews: 8, price: 1989, originalPrice: 2789, discount: 29, image: "/paintings/painting-3.jpg", category: "Paintings", badge: "LIMITED EDITION" },
  { id: 4, title: "Abstract Art", artist: "Pradip Sengupta", artistName: "Pradip Sengupta", rating: 4.5, reviews: 61, price: 1725, originalPrice: null, discount: null, image: "/paintings/painting-4.jpg", category: "Paintings" },
  { id: 5, title: "Abstract Colourful Canvas - Handpainted Art Painting - 32 × 44 in", artist: "Alexis Johnson", artistName: "Alexis Johnson", rating: 4, reviews: 30, price: 1852, originalPrice: 1975, discount: 10, image: "/paintings/painting-5.jpg", category: "Paintings" },
  { id: 6, title: "Nature Inspired Modern Art Canvas Painting", artist: "Alexis Johnson", artistName: "Alexis Johnson", rating: 4, reviews: 22, price: 2280, originalPrice: 2560, discount: 12, image: "/paintings/painting-6.jpg", category: "Paintings" },
  { id: 7, title: "Human and Animal Modern Painting", artist: "Alexis Johnson", artistName: "Alexis Johnson", rating: 4, reviews: 18, price: 2499, originalPrice: null, discount: null, image: "/paintings/painting-7.jpg", category: "Paintings" },
];

export const sculptures: Product[] = [
  { id: 101, title: "Bull Statue", artist: "Alexis Johnson", artistName: "Alexis Johnson", rating: 4.5, reviews: 22, price: 259, originalPrice: 280, discount: 10, image: "/sculptures/sculpture-1.jpg", category: "Sculptures" },
  { id: 102, title: "Hindu God Statue", artist: "Alexis Johnson", artistName: "Alexis Johnson", rating: 5, reviews: 61, price: 1099, originalPrice: null, discount: null, image: "/sculptures/sculpture-2.jpg", category: "Sculptures", badge: "LIMITED EDITION" },
  { id: 103, title: "Greek Roman Sculpture", artist: "Sundar Pradesh", artistName: "Sundar Pradesh", rating: 4.5, reviews: 8, price: 2499, originalPrice: 4000, discount: 37, image: "/sculptures/sculpture-3.jpg", category: "Sculptures" },
  { id: 104, title: "Ocean Wave Fused Glass Sculpture", artist: "Connected Goods", artistName: "Connected Goods", rating: 4.5, reviews: 15, price: 4960, originalPrice: null, discount: null, image: "/sculptures/sculpture-4.jpg", category: "Sculptures" },
  { id: 105, title: "Statue World's Modern Abstract Face Sculpture", artist: "Mohan Roy", artistName: "Mohan Roy", rating: 4.5, reviews: 15, price: 3990, originalPrice: null, discount: null, image: "/sculptures/sculpture-5.jpg", category: "Sculptures" },
  { id: 106, title: "Thinker Statue", artist: "Street27", artistName: "Street27", rating: 4.5, reviews: 15, price: 900, originalPrice: null, discount: null, image: "/sculptures/sculpture-6.jpg", category: "Sculptures" },
  { id: 107, title: "Ellementry Spellbound Face Ecomix Sculpture", artist: "Elementary Store", artistName: "Elementary Store", rating: 4.5, reviews: 15, price: 1300, originalPrice: null, discount: null, image: "/sculptures/sculpture-7.jpg", category: "Sculptures" },
  { id: 108, title: "Chhatrapati Shivaji Maharaj Sculpture", artist: "Silaii", artistName: "Silaii", rating: 4.5, reviews: 15, price: 9999, originalPrice: null, discount: null, image: "/sculptures/sculpture-8.jpg", category: "Sculptures" },
];

export const ceramics: Product[] = [
  { id: 201, title: "Handmade Ceramic Jars", artist: "Alexis Johnson", artistName: "Alexis Johnson", rating: 4.5, reviews: 6, price: 789, originalPrice: 1400, discount: 47, image: "/ceramics/ceramic-1.jpg", category: "Ceramics" },
  { id: 202, title: "Ceramic Sculpture", artist: "Alexis Johnson", artistName: "Alexis Johnson", rating: 4.5, reviews: 12, price: 1205, originalPrice: 4338, discount: 10, image: "/ceramics/ceramic-2.jpg", category: "Ceramics" },
  { id: 203, title: "Ceramic Vase", artist: "Alexis Johnson", artistName: "Alexis Johnson", rating: 4, reviews: 9, price: 3999, originalPrice: 4999, discount: 20, image: "/ceramics/ceramic-3.jpg", category: "Ceramics" },
  { id: 204, title: "Ceramic Golden Blessing Birds", artist: "Mahesh", artistName: "Mahesh", rating: 4, reviews: 9, price: 349, originalPrice: 449, discount: 20, image: "/ceramics/ceramic-4.jpg", category: "Ceramics" },
  { id: 205, title: " Lavish Silver Home Decor Elephant Couple", artist: "Mahesh", artistName: "Mahesh", rating: 4, reviews: 9, price: 1249, originalPrice: 1449, discount: 20, image: "/ceramics/ceramic-5.jpg", category: "Ceramics" },
];

export const artists: Artist[] = [
  { id: 301, name: "Cy Twombly", handle: "@cytwombly", followers: "10,000", avatar: "/artists/artist-1.jpg", cover: "/artists/artist-1-cover.jpg", designs: 45, bio: "Award-winning abstract painter based in New York. My work explores the intersection of color and emotion, drawing from urban landscapes and personal narratives.", verified: true },
  { id: 302, name: "Shara Hughes", handle: "@anaillueca", followers: "5,000", avatar: "/artists/artist-2.jpg", cover: "/artists/artist-2-cover.jpg", designs: 32, bio: "Contemporary landscape artist inspired by the natural world. Every painting is a journey through light, texture, and the quiet beauty of everyday moments.", verified: true },
  { id: 303, name: "Dale Chihuly", handle: "@glasschihuly", followers: "2,000", avatar: "/artists/artist-3.jpg", cover: "/artists/artist-3-cover.jpg", designs: 28, bio: "Glass sculptor and ceramics artist creating immersive installations that play with light and form. Based in Seattle, exhibited internationally.", verified: false },
];

export const stories: Story[] = [
  { id: 401, title: "Acrylic on Canvas", date: "2023-04-15", image: "/stories/story-1.jpg", excerpt: "Exploring the limitless possibilities of acrylic paint — texture, layering, and the art of letting go. A deep dive into one artist's creative process.", category: "Technique" },
  { id: 402, title: "Cash, Credit or Painting?", date: "2023-01-25", image: "/stories/story-2.jpg", excerpt: "The evolving conversation around art as investment. How collectors, galleries, and artists are reshaping the economics of the art world.", category: "Business" },
  { id: 403, title: "Creating a World About Herself", date: "2023-01-23", image: "/stories/story-3.jpg", excerpt: "A profile of Ana Illueca and her journey from graphic designer to internationally acclaimed painter. On identity, process, and finding your voice.", category: "Profile" },
];

export const reviews: Review[] = [
  { id: 1, author: "Jo-Ann", date: "23 Dec, 2023", rating: 4.5, text: "Love my purchase! First it is a beautiful work of art. The textures and mixtures of fabrics adds a sophisticated element to this beautiful peace!" },
  { id: 2, author: "Joan Coleman", date: "29 Nov, 2023", rating: 4.5, text: "This is simply gorgeous. Love the dark colors and the beautifully inscribed dedication to the singer Tom Waits." },
  { id: 3, author: "Amet Joshi", date: "27 Nov, 2023", rating: 4.5, text: "Abstract painting are pure pieces of beauty" },
];

export const initialCartItems: CartItem[] = [
  { id: 1, title: "Hand Painted Knife Art Flowers Oil Painting", artist: "Pradip Sengupta", artistName: "Pradip Sengupta", rating: 4.5, reviews: 61, price: 1725, originalPrice: null, discount: null, image: "/paintings/painting-1.jpg", category: "Paintings", size: "5×7", quantity: 2 },
  { id: 2, title: "Wall Decor Painting - Landscape", artist: "Cloude Made", artistName: "Cloude Made", rating: 4, reviews: 8, price: 999, originalPrice: null, discount: null, image: "/paintings/painting-4.jpg", category: "Paintings", size: "5×7", quantity: 1 },
  { id: 3, title: "Bull Sculpture", artist: "Connected Goods", artistName: "Connected Goods", rating: 4.5, reviews: 15, price: 4960, originalPrice: null, discount: null, image: "/sculptures/sculpture-1.jpg", category: "Sculptures", size: "5×7", quantity: 1 },
];

export const allProducts: Product[] = [...paintings, ...sculptures, ...ceramics];

export const categories: string[] = [
  "Paintings", "Digital Art", "Sculptures", "Glass Art", "Woodwork", "Ceramics",
];

export const orderHistory: OrderItem[] = [
  { id: 1, title: "Hand Painted Knife Art Flowers Oil Painting", artist: "Pradip Sengupta", price: 7200, originalPrice: 7920, discount: 10, image: "/paintings/painting-1.jpg", status: "delivered", date: "15 Jan, 2024" },
  { id: 2, title: "Wall Decor Painting - Landscape", artist: "Cloud Made", price: 9600, originalPrice: null, discount: null, image: "/paintings/painting-3.jpg", status: "in-transit", date: "02 Feb, 2024" },
  { id: 3, title: "Abstract Art", artist: "Connected Goods", price: 4960, originalPrice: null, discount: null, image: "/paintings/painting-4.jpg", status: "processing", date: "20 Mar, 2024" },
];

export const trackingItems: TrackingItem[] = [
  { id: 1, title: "Hand Painted Knife Art Flowers Oil Painting", artist: "Pradip Sengupta", size: "5×7", price: 1725, qty: 2, image: "/paintings/painting-1.jpg" },
  { id: 2, title: "Wall Decor Painting - Landscape", artist: "Cloude Made", size: "5×7", price: 999, qty: null, image: "/paintings/painting-3.jpg" },
  { id: 3, title: "Abstract Art", artist: "Connected Goods", size: "5×7", price: 4960, qty: null, image: "/paintings/painting-4.jpg" },
];

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

// ─── Collections ─────────────────────────────────────────────────────────────

import type { Collection } from "@/types";

export const collections: Collection[] = [
  {
    id: 1,
    name: "Chromatic Dreams",
    description: "A curated journey through bold colors and abstract expression. Works that blur the boundary between emotion and canvas.",
    coverImage: "/paintings/painting-2.jpg",
    artworkCount: 18,
    curatorName: "Shara Hughes",
    curatorAvatar: "/artists/artist-2.jpg",
    featured: true,
    tags: ["Abstract", "Color", "Contemporary"],
  },
  {
    id: 2,
    name: "Earth & Form",
    description: "Sculptures and ceramics celebrating texture, weight, and the ancient bond between human hands and raw materials.",
    coverImage: "/ceramics/ceramic-2.jpg",
    artworkCount: 12,
    curatorName: "Dale Chihuly",
    curatorAvatar: "/artists/artist-3.jpg",
    featured: true,
    tags: ["Ceramics", "Sculpture", "Handmade"],
  },
  {
    id: 3,
    name: "Urban Narratives",
    description: "Stories told through cityscapes, street life, and the quiet moments found in metropolitan corners.",
    coverImage: "/paintings/painting-5.jpg",
    artworkCount: 24,
    curatorName: "Cy Twombly",
    curatorAvatar: "/artists/artist-1.jpg",
    featured: true,
    tags: ["Urban", "Narrative", "Contemporary"],
  },
  {
    id: 4,
    name: "Glass & Light",
    description: "Translucent sculptures that transform light into living art. Every angle reveals a new world within.",
    coverImage: "/sculptures/sculpture-4.jpg",
    artworkCount: 9,
    curatorName: "Dale Chihuly",
    curatorAvatar: "/artists/artist-3.jpg",
    featured: false,
    tags: ["Glass", "Light", "Installation"],
  },
];

export const categoryImages: Record<string, string> = {
  "Paintings": "/paintings/painting-4.jpg",
  "Digital Art": "/digital-arts/digital-art-cover.jpg",
  "Sculptures": "/sculptures/sculpture-cover.jpg",
  "Glass Art": "/sculptures/sculpture-4.jpg",
  "Woodwork": "/paintings/painting-6.jpg",
  "Ceramics": "/ceramics/ceramic-1.jpg",
};

export const categoryArtworkCounts: Record<string, number> = {
  "Paintings": 7,
  "Digital Art": 0,
  "Sculptures": 4,
  "Glass Art": 1,
  "Woodwork": 0,
  "Ceramics": 3,
};
