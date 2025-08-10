import { Product, Clue, UserProfile } from '../types/game';

// Generate a deterministic seed for today's puzzle
export const getTodaysSeed = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

// Calculate score based on attempts and time
export const calculateScore = (attempts: number, timeInSeconds: number): number => {
  const baseScore = 1000;
  const attemptPenalty = Math.max(0, (attempts - 1) * 100);
  const timePenalty = Math.max(0, Math.floor(timeInSeconds / 10));
  return Math.max(100, baseScore - attemptPenalty - timePenalty);
};

// Generate clues for a product
export const generateClues = (product: Product, userProfile?: UserProfile): Clue[] => {
  const clues: Clue[] = [];
  
  // Easy clue - Category
  if (product.category) {
    clues.push({
      id: 1,
      text: `This item belongs to the ${product.category} category`,
      type: 'category',
      difficulty: 'easy'
    });
  }
  
  // Medium clue - Brand hint
  clues.push({
    id: 2,
    text: `Made by a brand that starts with "${product.vendor[0]}" and has ${product.vendor.length} letters`,
    type: 'brand',
    difficulty: 'medium'
  });
  
  // Price range clue
  const price = parseFloat(product.price.replace(/[^0-9.]/g, ''));
  const priceRange = getPriceRange(price);
  clues.push({
    id: 3,
    text: `Priced in the ${priceRange} range`,
    type: 'price',
    difficulty: 'easy'
  });
  
  // Location-based clue if available
  if (product.location) {
    clues.push({
      id: 4,
      text: `This brand hails from ${product.location}`,
      type: 'location',
      difficulty: 'medium'
    });
  }
  
  // Rating clue if available
  if (product.rating) {
    clues.push({
      id: 5,
      text: `Customers rate this ${getRatingDescription(product.rating)}`,
      type: 'rating',
      difficulty: 'easy'
    });
  }
  
  // Special attributes
  if (product.isBlackOwned) {
    clues.push({
      id: 6,
      text: `Supporting a Black-owned business`,
      type: 'feature',
      difficulty: 'medium'
    });
  }
  
  if (product.isEcoFriendly) {
    clues.push({
      id: 7,
      text: `An eco-conscious choice for sustainable shoppers`,
      type: 'feature',
      difficulty: 'medium'
    });
  }
  
  // Style/use case clue
  if (product.tags && product.tags.length > 0) {
    const tag = product.tags[0];
    clues.push({
      id: 8,
      text: `Perfect for ${tag} enthusiasts`,
      type: 'style',
      difficulty: 'hard'
    });
  }
  
  // Personalized clue based on user profile
  if (userProfile?.favoriteCategories?.includes(product.category || '')) {
    clues.push({
      id: 9,
      text: `Something from one of your favorite categories!`,
      type: 'category',
      difficulty: 'easy'
    });
  }
  
  // Shuffle and return exactly 5 clues
  const shuffled = clues.sort(() => Math.random() - 0.5);
  const selectedClues = shuffled.slice(0, 5);
  
  // Ensure we always have at least 3 clues
  while (selectedClues.length < 3) {
    selectedClues.push({
      id: selectedClues.length + 1,
      text: `Hint ${selectedClues.length + 1}: This is a special item in Shop's catalog`,
      type: 'feature',
      difficulty: 'medium'
    });
  }
  
  return selectedClues;
};

const getPriceRange = (price: number): string => {
  if (price < 25) return 'budget-friendly ($0-$25)';
  if (price < 50) return 'affordable ($25-$50)';
  if (price < 100) return 'mid-range ($50-$100)';
  if (price < 200) return 'premium ($100-$200)';
  return 'luxury ($200+)';
};

const getRatingDescription = (rating: number): string => {
  if (rating >= 4.8) return 'as exceptional (4.8+ stars)';
  if (rating >= 4.5) return 'highly (4.5+ stars)';
  if (rating >= 4.0) return 'well (4.0+ stars)';
  if (rating >= 3.5) return 'positively (3.5+ stars)';
  return 'with mixed reviews';
};

// Format time for display
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Check if user has already played today
export const hasPlayedToday = (lastPlayedDate?: string): boolean => {
  if (!lastPlayedDate) return false;
  const today = getTodaysSeed();
  return lastPlayedDate === today;
};
