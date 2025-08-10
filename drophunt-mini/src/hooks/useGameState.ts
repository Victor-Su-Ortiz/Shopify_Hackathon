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

export const useGameState = () => {
  console.log('🚀 useGameState hook initializing - VERSION 3.0 with Real Shop Data');
  
  const storage = useAsyncStorage();
  
  // Get real products from Shop catalog
  // @ts-ignore - SDK type definition may be incomplete
  const { products, loading: productsLoading } = useProducts({} as any);
  
  // Get current user for personalization
  // @ts-ignore - SDK type definition may be incomplete
  const currentUser = useCurrentUser() as any;
  
  // Get user's saved products for personalization
  // @ts-ignore - SDK type definition may be incomplete
  const savedProducts = useSavedProducts() as any;
  
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
    if (!products || products.length === 0) return null;
    
    const seed = getTodaysSeed();
    // Use seed to deterministically select a product
    const seedNum = seed.split('-').reduce((acc, val) => acc + parseInt(val), 0);
    const productIndex = seedNum % products.length;
    
    const selectedProduct = products[productIndex];
    return convertShopProduct(selectedProduct);
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
      if (!todaysProduct || productsLoading) {
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
