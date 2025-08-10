import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  useAsyncStorage, 
  useProducts,
  useCurrentUser,
  useSavedProducts 
} from '@shopify/shop-minis-react';
import { GameState, DailyStats, Product, Clue } from '../types/game';
import { getTodaysSeed, calculateScore, generateClues } from '../utils/gameUtils';

const STORAGE_KEYS = {
  GAME_STATE: 'drophunt_game_state',
  DAILY_STATS: 'drophunt_daily_stats',
  USER_STATS: 'drophunt_user_stats',
};

// Mock products for development/fallback
const MOCK_PRODUCTS = [
  {
    id: 'gid://shopify/Product/1',
    title: 'Organic Cotton Tote Bag',
    vendor: 'EcoStyle Co',
    productType: 'Accessories',
    tags: ['sustainable', 'organic', 'everyday'],
    featuredImage: { url: 'https://picsum.photos/400/400?random=1' },
    priceRange: { minVariantPrice: { amount: '32.00', currencyCode: 'USD' } },
    description: 'Sustainable and stylish everyday carry'
  },
  {
    id: 'gid://shopify/Product/2',
    title: 'Wireless Bluetooth Headphones',
    vendor: 'TechSound Pro',
    productType: 'Electronics',
    tags: ['wireless', 'bluetooth', 'music'],
    featuredImage: { url: 'https://picsum.photos/400/400?random=2' },
    priceRange: { minVariantPrice: { amount: '89.99', currencyCode: 'USD' } },
    description: 'Premium sound quality with active noise cancellation'
  },
  {
    id: 'gid://shopify/Product/3',
    title: 'Artisan Coffee Blend',
    vendor: 'Roast Masters',
    productType: 'Food & Beverage',
    tags: ['coffee', 'organic', 'fair-trade'],
    featuredImage: { url: 'https://picsum.photos/400/400?random=3' },
    priceRange: { minVariantPrice: { amount: '18.50', currencyCode: 'USD' } },
    description: 'Single-origin, ethically sourced premium coffee'
  },
  {
    id: 'gid://shopify/Product/4',
    title: 'Minimalist Leather Wallet',
    vendor: 'Craft & Co',
    productType: 'Accessories',
    tags: ['leather', 'minimalist', 'handmade'],
    featuredImage: { url: 'https://picsum.photos/400/400?random=4' },
    priceRange: { minVariantPrice: { amount: '45.00', currencyCode: 'USD' } },
    description: 'Handcrafted genuine leather slim wallet'
  },
  {
    id: 'gid://shopify/Product/5',
    title: 'Plant-Based Protein Powder',
    vendor: 'NutriLife',
    productType: 'Health & Wellness',
    tags: ['vegan', 'protein', 'fitness'],
    featuredImage: { url: 'https://picsum.photos/400/400?random=5' },
    priceRange: { minVariantPrice: { amount: '54.99', currencyCode: 'USD' } },
    description: 'Complete protein blend from organic plant sources'
  }
];

export const useGameState = () => {
  console.log('🚀 useGameState hook initializing - VERSION 3.0 with Real Shop Data');
  
  const storage = useAsyncStorage();
  
  // Get real products from Shop catalog
  // @ts-ignore - SDK type definition may be incomplete
  const { products: sdkProducts, loading: sdkLoading } = useProducts({} as any) || {};
  
  // Get current user for personalization
  // @ts-ignore - SDK type definition may be incomplete
  const currentUser = useCurrentUser() as any;
  
  // Get user's saved products for personalization
  // @ts-ignore - SDK type definition may be incomplete
  const savedProducts = useSavedProducts() as any;
  
  // Use SDK products if available, otherwise use mock products
  const products = sdkProducts && sdkProducts.length > 0 ? sdkProducts : MOCK_PRODUCTS;
  const productsLoading = sdkLoading && !products;
  
  console.log('📦 Products status:', {
    sdkProducts: sdkProducts?.length || 0,
    usingMockData: !sdkProducts || sdkProducts.length === 0,
    totalProducts: products?.length || 0
  });
  
  const [gameState, setGameState] = useState<GameState>({
    currentProduct: null,
    cluesRevealed: 1,
    isGameWon: false,
    attempts: 0,
    startTime: Date.now(),
  });
  
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [clues, setClues] = useState<Clue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPlayedAlready, setHasPlayedAlready] = useState(false);
  
  // Force loading to finish after timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('⚠️ Loading timeout - forcing completion');
        setIsLoading(false);
      }
    }, 3000); // 3 second timeout
    
    return () => clearTimeout(timeout);
  }, [isLoading]);
  
  // Convert Shop product to our Product type
  const convertShopProduct = useCallback((shopProduct: any): Product => {
    // Extract price from the product variants
    const price = shopProduct.variants?.nodes?.[0]?.price?.amount || shopProduct.priceRange?.minVariantPrice?.amount || '0';
    const currencyCode = shopProduct.variants?.nodes?.[0]?.price?.currencyCode || 'USD';
    
    // Extract category from product type or collections
    const category = shopProduct.productType || shopProduct.collections?.nodes?.[0]?.title || 'General';
    
    // Extract tags
    const tags = shopProduct.tags || [];
    
    // Build description from the product
    const description = shopProduct.description || shopProduct.descriptionHtml?.replace(/<[^>]*>/g, '') || '';
    
    return {
      id: shopProduct.id,
      shopifyId: shopProduct.id,
      title: shopProduct.title,
      vendor: shopProduct.vendor || 'Unknown Brand',
      image: shopProduct.featuredImage?.url || shopProduct.images?.nodes?.[0]?.url || 'https://via.placeholder.com/400x400',
      price: `${currencyCode === 'USD' ? '$' : currencyCode}${parseFloat(price).toFixed(2)}`,
      description: description.substring(0, 200),
      category,
      tags: tags.slice(0, 5),
      rating: 4.5 + Math.random() * 0.5, // Simulate rating
      isEcoFriendly: tags.some((tag: string) => 
        tag.toLowerCase().includes('eco') || 
        tag.toLowerCase().includes('sustainable') ||
        tag.toLowerCase().includes('organic')
      ),
      location: shopProduct.vendor ? 'United States' : undefined, // Default location
    };
  }, []);
  
  // Select today's product based on date seed
  const todaysProduct = useMemo(() => {
    if (!products || products.length === 0) {
      console.log('⚠️ No products available');
      return null;
    }
    
    const seed = getTodaysSeed();
    // Use seed to deterministically select a product
    const seedNum = seed.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    const productIndex = seedNum % products.length;
    
    const selectedProduct = products[productIndex];
    console.log('🎯 Selected product for today:', selectedProduct?.title || 'Unknown');
    
    try {
      return convertShopProduct(selectedProduct);
    } catch (error) {
      console.error('Error converting product:', error);
      // Return a basic fallback product structure
      const fallbackProduct: Product = {
        id: selectedProduct?.id || 'unknown',
        shopifyId: selectedProduct?.id,
        title: selectedProduct?.title || 'Mystery Product',
        vendor: selectedProduct?.vendor || 'Unknown Brand',
        image: selectedProduct?.featuredImage?.url || 'https://picsum.photos/400/400',
        price: '$0.00',
        description: selectedProduct?.description || 'A mysterious product awaits',
        category: 'General',
        tags: [],
        rating: 4.5
      };
      return fallbackProduct;
    }
  }, [products, convertShopProduct]);
  
  // Log state changes
  useEffect(() => {
    console.log('📈 Game state changed:', {
      cluesRevealed: gameState.cluesRevealed,
      isGameWon: gameState.isGameWon,
      attempts: gameState.attempts,
      hasProduct: !!gameState.currentProduct,
      productsAvailable: products?.length || 0
    });
  }, [gameState, products]);
  
  // Load saved game state and set up today's product
  useEffect(() => {
    const loadGameState = async () => {
      console.log('🔍 Loading game state...', {
        hasTodaysProduct: !!todaysProduct,
        productsLoading,
        productsCount: products?.length || 0
      });
      
      // If no products at all after initial load, set loading to false
      if (!productsLoading && !todaysProduct) {
        console.log('⚠️ No products available, showing fallback');
        setIsLoading(false);
        return;
      }
      
      if (!todaysProduct || productsLoading) {
        console.log('⏳ Waiting for products to load...');
        return; // Wait for products to load
      }
      
      try {
        const todaySeed = getTodaysSeed();
        const savedStats = await storage.getItem({ key: STORAGE_KEYS.DAILY_STATS });
        const savedGameState = await storage.getItem({ key: STORAGE_KEYS.GAME_STATE });
        
        // Check if user already played today
        if (savedStats) {
          const stats: DailyStats = JSON.parse(savedStats);
          if (stats.date === todaySeed && stats.played) {
            setHasPlayedAlready(true);
            setDailyStats(stats);
            
            // Restore game state if it exists
            if (savedGameState) {
              const restoredState: GameState = JSON.parse(savedGameState);
              if (restoredState.currentProduct?.id === todaysProduct.id) {
                setGameState(restoredState);
                const restoredClues = generateClues(todaysProduct, currentUser ? {
                  favoriteCategories: savedProducts?.map((p: any) => p.productType).filter(Boolean),
                  isEcoConscious: currentUser?.displayName?.includes('eco') // Simple check
                } : undefined);
                setClues(restoredClues);
                return;
              }
            }
          }
        }
        
        // Set up new game with today's product
        setGameState(prev => ({
          ...prev,
          currentProduct: todaysProduct,
          cluesRevealed: 1,
          isGameWon: false,
          attempts: 0,
          startTime: Date.now(),
        }));
        
        // Generate personalized clues
        const userProfile = currentUser ? {
          favoriteCategories: savedProducts?.map((p: any) => p.productType).filter(Boolean),
          isEcoConscious: savedProducts?.some((p: any) => 
            p.tags?.some((tag: string) => tag.toLowerCase().includes('eco'))
          )
        } : undefined;
        
        const generatedClues = generateClues(todaysProduct, userProfile);
        setClues(generatedClues);
        
        console.log('✅ Game initialized with real product:', todaysProduct.title);
        console.log('👤 User personalization applied:', !!userProfile);
        
      } catch (error) {
        console.error('Error loading game state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGameState();
  }, [todaysProduct, productsLoading, storage, currentUser, savedProducts]); // Dependencies for real data
  
  // Reveal next clue
  const revealNextClue = useCallback(() => {
    console.log('🔍 revealNextClue called');
    console.log('Current clues array:', clues);
    console.log('Current clues length:', clues.length);
    console.log('Current gameState:', gameState);
    
    setGameState(prev => {
      console.log('📊 Inside setState - Previous state:', {
        cluesRevealed: prev.cluesRevealed,
        isGameWon: prev.isGameWon,
        attempts: prev.attempts
      });
      
      const maxClues = Math.max(clues.length, 5);
      console.log('Max clues allowed:', maxClues);
      
      if (prev.cluesRevealed < maxClues && !prev.isGameWon) {
        const newState = {
          ...prev,
          cluesRevealed: prev.cluesRevealed + 1,
          attempts: prev.attempts + 1,
        };
        console.log('✅ Updating state to:', {
          cluesRevealed: newState.cluesRevealed,
          attempts: newState.attempts
        });
        return newState;
      }
      
      console.log('❌ No state update - conditions not met');
      console.log('Reason:', {
        'cluesRevealed >= maxClues': prev.cluesRevealed >= maxClues,
        'isGameWon': prev.isGameWon
      });
      return prev;
    });
  }, [clues, gameState]);
  
  // Make a guess
  const makeGuess = useCallback(async (guessedProductId: string) => {
    console.log('🎯 makeGuess called with:', guessedProductId);
    console.log('📦 Current product:', gameState.currentProduct?.id);
    console.log('🏆 Game already won?', gameState.isGameWon);
    
    if (!gameState.currentProduct || gameState.isGameWon) {
      console.log('❌ Cannot make guess - no product or game already won');
      return false;
    }
    
    // Compare both the full ID and just the numeric part for flexibility
    const isCorrect = guessedProductId === gameState.currentProduct.id || 
                     guessedProductId === gameState.currentProduct.shopifyId ||
                     guessedProductId.includes(gameState.currentProduct.id.split('/').pop() || '');
    
    console.log('🎲 Comparison:', guessedProductId, 'vs', gameState.currentProduct.id, '=', isCorrect);
    
    if (isCorrect) {
      const endTime = Date.now();
      const timeToSolve = Math.floor((endTime - gameState.startTime) / 1000);
      const score = calculateScore(gameState.cluesRevealed, timeToSolve);
      
      const newGameState = {
        ...gameState,
        isGameWon: true,
        endTime,
        score,
      };
      
      setGameState(newGameState);
      
      // Save daily stats
      const todayStats: DailyStats = {
        date: getTodaysSeed(),
        played: true,
        won: true,
        attempts: gameState.cluesRevealed,
        timeToSolve,
        score,
        streak: 1, // Calculate actual streak in production
      };
      
      await storage.setItem({ key: STORAGE_KEYS.DAILY_STATS, value: JSON.stringify(todayStats) });
      await storage.setItem({ key: STORAGE_KEYS.GAME_STATE, value: JSON.stringify(newGameState) });
      setDailyStats(todayStats);
      
      return true;
    }
    
    setGameState(prev => ({
      ...prev,
      attempts: prev.attempts + 1,
    }));
    
    return false;
  }, [gameState, storage]);
  
  // Reset game for tomorrow
  const resetGame = useCallback(async () => {
    await storage.removeItem({ key: STORAGE_KEYS.GAME_STATE });
    await storage.removeItem({ key: STORAGE_KEYS.DAILY_STATS });
    
    setGameState({
      currentProduct: null,
      cluesRevealed: 0,
      isGameWon: false,
      attempts: 0,
      startTime: Date.now(),
    });
    
    setDailyStats(null);
    setHasPlayedAlready(false);
  }, [storage]);
  
  // Update product image when correct guess is made
  const updateProductImage = useCallback((imageUrl: string) => {
    setGameState(prev => {
      if (!prev.currentProduct) return prev;
      return {
        ...prev,
        currentProduct: {
          ...prev.currentProduct,
          image: imageUrl
        }
      };
    });
  }, []);
  
  // Update product with real Shopify ID for navigation
  const updateProductShopifyId = useCallback((shopifyId: string) => {
    setGameState(prev => {
      if (!prev.currentProduct) return prev;
      return {
        ...prev,
        currentProduct: {
          ...prev.currentProduct,
          shopifyId: shopifyId
        }
      };
    });
  }, []);
  
  return {
    gameState,
    dailyStats,
    clues,
    isLoading,
    hasPlayedAlready,
    revealNextClue,
    makeGuess,
    resetGame,
    updateProductImage,
    updateProductShopifyId,
  };
};
