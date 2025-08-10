import { useState, useEffect, useCallback } from 'react';
import { useAsyncStorage } from '@shopify/shop-minis-react';
import { GameState, DailyStats, Product, Clue } from '../types/game';
import { getTodaysSeed, calculateScore, generateClues } from '../utils/gameUtils';

const STORAGE_KEYS = {
  GAME_STATE: 'drophunt_game_state',
  DAILY_STATS: 'drophunt_daily_stats',
  USER_STATS: 'drophunt_user_stats',
};

export const useGameState = () => {
  console.log('🚀 useGameState hook initializing - VERSION 2.0');
  
  // Initialize with default clues immediately
  const defaultClues: Clue[] = [
    { id: 1, text: 'This item belongs to the Accessories category', type: 'category', difficulty: 'easy' },
    { id: 2, text: 'Made by a brand that starts with "E" and has 11 letters', type: 'brand', difficulty: 'medium' },
    { id: 3, text: 'Priced in the affordable ($25-$50) range', type: 'price', difficulty: 'easy' },
    { id: 4, text: 'This brand hails from Los Angeles, CA', type: 'location', difficulty: 'medium' },
    { id: 5, text: 'An eco-conscious choice for sustainable shoppers', type: 'feature', difficulty: 'medium' },
  ];
  
  console.log('📋 Default clues created:', defaultClues.length, 'clues');
  
  const mockProduct: Product = {
    id: 'prod_demo',
    title: 'Organic Cotton Tote Bag',
    vendor: 'EcoStyle Co',
    image: 'https://via.placeholder.com/400x400/4F46E5/ffffff?text=Mystery+Product',
    price: '$32.00',
    description: 'Sustainable and stylish everyday carry',
    category: 'Accessories',
    tags: ['sustainable', 'everyday', 'minimalist'],
    rating: 4.8,
    isEcoFriendly: true,
    location: 'Los Angeles, CA',
  };
  
  console.log('📦 Mock product created:', mockProduct.title);
  
  const [gameState, setGameState] = useState<GameState>({
    currentProduct: mockProduct,  // Start with product loaded
    cluesRevealed: 1,  // Start with first clue already revealed
    isGameWon: false,
    attempts: 0,
    startTime: Date.now(),
  });
  
  console.log('🎮 Initial game state:', {
    hasProduct: !!gameState.currentProduct,
    cluesRevealed: gameState.cluesRevealed
  });
  
  const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
  const [clues, setClues] = useState<Clue[]>(defaultClues); // Start with default clues
  const [isLoading, setIsLoading] = useState(false); // Start loaded
  const [hasPlayedAlready, setHasPlayedAlready] = useState(false);
  
  const storage = useAsyncStorage();
  
  // Log state changes
  useEffect(() => {
    console.log('📈 Game state changed:', {
      cluesRevealed: gameState.cluesRevealed,
      isGameWon: gameState.isGameWon,
      attempts: gameState.attempts,
      hasProduct: !!gameState.currentProduct
    });
  }, [gameState]);
  
  // Load saved game state - only run once on mount
  useEffect(() => {
    const loadGameState = async () => {
      try {
        const todaySeed = getTodaysSeed();
        const savedStats = await storage.getItem({ key: STORAGE_KEYS.DAILY_STATS });
        
        if (savedStats) {
          const stats: DailyStats = JSON.parse(savedStats);
          if (stats.date === todaySeed && stats.played && stats.won) {
            setHasPlayedAlready(true);
            setDailyStats(stats);
          }
        }
        
        // For demo purposes, create a mock product
        // In production, this would fetch from Shop's catalog
        const mockProduct: Product = {
          id: 'prod_demo',  // Fixed ID for demo
          title: 'Organic Cotton Tote Bag',
          vendor: 'EcoStyle Co',
          image: 'https://via.placeholder.com/400x400/4F46E5/ffffff?text=Mystery+Product',
          price: '$32.00',
          description: 'Sustainable and stylish everyday carry',
          category: 'Accessories',
          tags: ['sustainable', 'everyday', 'minimalist'],
          rating: 4.8,
          isEcoFriendly: true,
          location: 'Los Angeles, CA',
        };
        
        // Only reset state if we don't have a product yet
        setGameState(prev => {
          if (!prev.currentProduct) {
            return {
              ...prev,
              currentProduct: mockProduct,
              cluesRevealed: 1,  // Keep initial clue revealed
              isGameWon: false,
              attempts: 0,
            };
          }
          // If product exists, just update it without resetting progress
          return {
            ...prev,
            currentProduct: mockProduct,
          };
        });
        
        // Generate clues for the product
        const generatedClues = generateClues(mockProduct);
        setClues(generatedClues);
        
      } catch (error) {
        console.error('Error loading game state:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadGameState();
  }, []); // Empty dependency array - only run once on mount
  
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
    
    const isCorrect = guessedProductId === gameState.currentProduct.id;
    console.log('🎲 Comparison:', guessedProductId, '===', gameState.currentProduct.id, '=', isCorrect);
    
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
