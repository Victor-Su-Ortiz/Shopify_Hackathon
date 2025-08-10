export interface Product {
  id: string;
  shopifyId?: string;  // Real Shopify product ID for navigation
  title: string;
  vendor: string;
  image: string;
  price: string;
  description?: string;
  category?: string;
  tags?: string[];
  rating?: number;
  isBlackOwned?: boolean;
  isEcoFriendly?: boolean;
  location?: string;
}

export interface GameState {
  currentProduct: Product | null;
  cluesRevealed: number;
  isGameWon: boolean;
  attempts: number;
  startTime: number;
  endTime?: number;
  score?: number;
}

export interface DailyStats {
  date: string;
  played: boolean;
  won: boolean;
  attempts: number;
  timeToSolve?: number;
  score?: number;
  streak: number;
}

export interface Clue {
  id: number;
  text: string;
  type: 'category' | 'brand' | 'price' | 'feature' | 'rating' | 'location' | 'style';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface UserProfile {
  favoriteCategories?: string[];
  purchaseHistory?: string[];
  preferredBrands?: string[];
  isEcoConscious?: boolean;
  stylePreference?: 'casual' | 'formal' | 'streetwear' | 'athletic' | 'luxury';
}
