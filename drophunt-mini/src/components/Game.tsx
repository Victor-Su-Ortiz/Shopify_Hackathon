import React, { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { GameHeader } from './GameHeader';
import { ClueCard } from './ClueCard';
import { ProductReveal } from './ProductReveal';
import { ShareModal } from './ShareModal';
import { usePopularProducts } from '@shopify/shop-minis-react';

export const Game: React.FC = () => {
  const {
    gameState,
    dailyStats,
    clues,
    isLoading,
    hasPlayedAlready,
    revealNextClue,
    makeGuess,
  } = useGameState();
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const { products } = usePopularProducts();
  
  const handleRevealClue = () => {
    if (!gameState.isGameWon) {
      revealNextClue();
    }
  };
  
  const handleProductGuess = async (productId: string) => {
    setSelectedProductId(productId);
    // For demo, make the first product the correct answer
    const guessId = productId === products?.[0]?.id ? 'prod_demo' : productId;
    const isCorrect = await makeGuess(guessId);
    
    if (isCorrect) {
      setTimeout(() => {
        setShowShareModal(true);
      }, 1500);
    } else {
      // Show wrong answer feedback
      setTimeout(() => {
        setSelectedProductId(null);
      }, 1000);
    }
  };
  
  const handleShare = () => {
    setShowShareModal(true);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎯</div>
          <p className="text-lg font-semibold text-gray-700">Loading today's mystery drop...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-2xl mx-auto">
        <GameHeader
          streak={dailyStats?.streak || 0}
          todayPlayed={!hasPlayedAlready}
          startTime={gameState.startTime}
          isGameWon={gameState.isGameWon}
        />
        
        {/* Product Mystery Box / Reveal */}
        <div className="mb-6">
          <ProductReveal
            product={gameState.currentProduct!}
            isRevealed={gameState.isGameWon}
            score={gameState.score}
            attempts={gameState.attempts}
            timeToSolve={dailyStats?.timeToSolve}
            onShare={handleShare}
            onPlayAgain={() => {}}
          />
        </div>
        
        {/* Clues Section */}
        {!gameState.isGameWon && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Clues ({gameState.cluesRevealed}/{clues.length})</h2>
              {gameState.cluesRevealed < clues.length && (
                <button
                  onClick={() => revealNextClue()}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <span>🔍</span> Reveal Next Clue
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {clues.map((clue, index) => (
                <ClueCard
                  key={clue.id}
                  clue={clue}
                  isRevealed={index < gameState.cluesRevealed}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Product Guessing Section */}
        {!gameState.isGameWon && gameState.cluesRevealed > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-bold mb-4">Make Your Guess</h2>
            <div className="grid grid-cols-2 gap-3">
              {products?.slice(0, 6).map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductGuess(product.id)}
                  disabled={hasPlayedAlready}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${selectedProductId === product.id 
                      ? 'border-purple-600 bg-purple-50' 
                      : 'border-gray-200 bg-white hover:border-purple-400'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <div className="aspect-square bg-gray-100 rounded mb-2">
                    {/* Product image would go here */}
                  </div>
                  <p className="text-sm font-medium truncate">{product.title}</p>
                  <p className="text-xs text-gray-600">{(product as any).vendor || 'Shop'}</p>
                </button>
              ))}
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Can't find it? Reveal more clues or browse the catalog!
              </p>
            </div>
          </div>
        )}
        
        {/* Already Played Message */}
        {hasPlayedAlready && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
            <div className="text-4xl mb-2">⏰</div>
            <h3 className="text-lg font-bold mb-2">You've already played today!</h3>
            <p className="text-gray-700 mb-4">
              Come back tomorrow for a new mystery drop challenge.
            </p>
            <button
              onClick={handleShare}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Share Today's Results
            </button>
          </div>
        )}
        
        {/* Stats Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-4">Your Stats</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">1</p>
              <p className="text-xs text-gray-600">Games Played</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{dailyStats?.won ? '100%' : '0%'}</p>
              <p className="text-xs text-gray-600">Win Rate</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{dailyStats?.streak || 0}</p>
              <p className="text-xs text-gray-600">Current Streak</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{dailyStats?.score || 0}</p>
              <p className="text-xs text-gray-600">Best Score</p>
            </div>
          </div>
        </div>
      </div>
      
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        stats={dailyStats}
      />
    </div>
  );
};
