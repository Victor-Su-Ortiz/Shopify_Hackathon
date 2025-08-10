import React, { useState } from 'react';
import { useGameState } from '../hooks/useGameState';
import { GameHeader } from './GameHeader';
import { ClueCard } from './ClueCard';
import { ProductReveal } from './ProductReveal';
import { ShareModal } from './ShareModal';

export const Game: React.FC = () => {
  const {
    gameState,
    dailyStats,
    clues,
    isLoading,
    hasPlayedAlready,
    revealNextClue,
    makeGuess,
    updateProductImage,
  } = useGameState();
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  
  // Log on every render
  console.log('🔄 Game component rendered:', {
    cluesRevealed: gameState.cluesRevealed,
    totalClues: clues.length,
    isLoading,
    hasPlayedAlready,
    isGameWon: gameState.isGameWon,
  });
  
  const handleRevealClue = () => {
    console.log('🎯 handleRevealClue clicked');
    console.log('Game state:', {
      isGameWon: gameState.isGameWon,
      cluesRevealed: gameState.cluesRevealed,
      currentProduct: gameState.currentProduct
    });
    console.log('Available clues:', clues);
    
    if (!gameState.isGameWon) {
      console.log('📢 Calling revealNextClue()');
      revealNextClue();
    } else {
      console.log('❌ Game already won, not revealing clue');
    }
  };
  
  const handleProductGuess = async (productId: string) => {
    console.log('🎲 Product guess clicked:', productId);
    console.log('🎯 Current product ID:', gameState.currentProduct?.id);
    
    setSelectedProductId(productId);
    console.log('🔍 Checking guess:', productId);
    
    const isCorrect = await makeGuess(productId);
    console.log('✅ Guess result:', isCorrect);
    
    if (isCorrect) {
      // Update the product image with the tote bag image for consistency
      updateProductImage('https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop');
      
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="emoji-2xl animate-bounce-in" style={{ fontSize: '5rem' }}>🎯</div>
          <p className="text-xl font-bold text-gray-700 mt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Loading today's mystery drop...
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto p-4 pb-20">
        <GameHeader
          streak={dailyStats?.streak || 0}
          todayPlayed={!hasPlayedAlready}
          startTime={gameState.startTime}
          isGameWon={gameState.isGameWon}
        />
        
        {/* Product Mystery Box / Reveal */}
        <div className="mb-8 animate-slide-down" style={{ animationDelay: '0.1s' }}>
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
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className="emoji-lg animate-float">🔮</span>
                <div>
                  <h2 className="text-2xl font-black text-gray-800">Mystery Clues</h2>
                  <p className="text-sm text-gray-600 font-semibold">
                    {gameState.cluesRevealed}/{clues.length} revealed
                  </p>
                </div>
              </div>
              {gameState.cluesRevealed < clues.length && (
                <button
                  onClick={() => {
                    console.log('🔘 Button clicked directly!');
                    console.log('Current state before click:', {
                      cluesRevealed: gameState.cluesRevealed,
                      cluesLength: clues.length
                    });
                    handleRevealClue();
                  }}
                  className="btn-warning animate-wiggle-hover"
                  style={{
                    padding: '14px 28px',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>💡</span> 
                  <span className="font-black">Reveal Clue</span>
                </button>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="progress-bar mb-6" style={{ height: '20px' }}>
              <div 
                className="progress-fill" 
                style={{ 
                  '--progress': `${(gameState.cluesRevealed / clues.length) * 100}%`,
                  width: `${(gameState.cluesRevealed / clues.length) * 100}%`
                } as React.CSSProperties}
              />
            </div>
            
            <div className="space-y-3">
              {clues.map((clue, index) => {
                console.log(`🗺️ Mapping clue ${index + 1}:`, {
                  shouldReveal: index < gameState.cluesRevealed,
                  cluesRevealed: gameState.cluesRevealed,
                  index
                });
                return (
                  <ClueCard
                    key={clue.id}
                    clue={clue}
                    isRevealed={index < gameState.cluesRevealed}
                    index={index}
                  />
                );
              })}
            </div>
          </div>
        )}
        
        {/* Product Guessing Section */}
        {!gameState.isGameWon && gameState.cluesRevealed > 0 && (
          <div className="mb-8">
            <div className="mascot-bubble animate-slide-up">
              <p className="text-lg font-bold text-gray-800">
                <span className="text-2xl mr-2">🤔</span> 
                Think you know what it is? Take a guess!
              </p>
            </div>
            
            {/* Use mock products for consistent demo experience */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { 
                  id: 'prod_demo', 
                  title: 'Organic Cotton Tote Bag', 
                  vendor: 'EcoStyle Co',
                  image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop'
                },
                { 
                  id: 'prod_2', 
                  title: 'Wireless Earbuds Pro', 
                  vendor: 'TechGear',
                  image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop'
                },
                { 
                  id: 'prod_3', 
                  title: 'Bamboo Water Bottle', 
                  vendor: 'GreenLife',
                  image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop'
                },
                { 
                  id: 'prod_4', 
                  title: 'Leather Wallet', 
                  vendor: 'Craftsman Co',
                  image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400&h=400&fit=crop'
                },
                { 
                  id: 'prod_5', 
                  title: 'Ceramic Coffee Mug', 
                  vendor: 'HomeStyle',
                  image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop'
                },
                { 
                  id: 'prod_6', 
                  title: 'Yoga Mat Premium', 
                  vendor: 'FitZone',
                  image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400&h=400&fit=crop'
                },
              ].map((product, index) => (
                <button
                  key={product.id}
                  onClick={() => handleProductGuess(product.id)}
                  disabled={gameState.isGameWon}
                  className={`
                    card-bubble p-4 transition-all overflow-hidden relative
                    ${selectedProductId === product.id 
                      ? 'animate-wiggle border-4 border-green-500 bg-green-50' 
                      : 'hover:scale-105 hover:shadow-xl bg-white'
                    }
                    ${gameState.isGameWon ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  style={{ 
                    animationDelay: `${index * 0.05}s`,
                    animation: selectedProductId === product.id ? 'wiggle 0.5s ease-in-out' : undefined
                  }}
                >
                  <div className="aspect-square bg-gray-100 rounded-2xl mb-3 overflow-hidden">
                    <img 
                      src={(product as any).image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        console.log('❌ Image failed to load:', (product as any).image);
                        // Use a more attractive placeholder
                        const colors = ['4F46E5', '10B981', 'F59E0B', 'EF4444', '8B5CF6', '06B6D4'];
                        const color = colors[index % colors.length];
                        (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x400/${color}/ffffff?text=${encodeURIComponent(product.title.charAt(0))}`;
                      }}
                    />
                  </div>
                  <p className="text-sm font-black text-gray-800 truncate">{product.title}</p>
                  <p className="text-xs text-gray-500 font-semibold">{(product as any).vendor}</p>
                  {selectedProductId === product.id && (
                    <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-3xl">
                      <div className="text-center">
                        <span className="emoji-lg animate-bounce">🎲</span>
                        <p className="text-sm font-black text-gray-700 mt-2">Checking...</p>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 font-semibold">
                <span className="text-lg mr-1">💭</span>
                Can't find it? Reveal more clues or browse the catalog!
              </p>
            </div>
          </div>
        )}
        
        {/* Already Played Message */}
        {hasPlayedAlready && (
          <div className="card-bubble bg-gradient-to-br from-blue-50 to-purple-50 text-center animate-bounce-in">
            <span className="emoji-2xl animate-float">⏰</span>
            <h3 className="text-2xl font-black text-gray-800 mt-4 mb-2">You've already played today!</h3>
            <p className="text-lg text-gray-700 mb-6 font-semibold">
              Come back tomorrow for a new mystery drop challenge.
            </p>
            <button
              onClick={handleShare}
              className="btn-primary"
              style={{ fontSize: '18px', padding: '14px 32px' }}
            >
              <span className="mr-2">🎉</span> Share Today's Results
            </button>
          </div>
        )}
        
        {/* Stats Section */}
        <div className="card-bubble animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="emoji-lg">📊</span>
            <h3 className="text-2xl font-black text-gray-800">Your Stats</h3>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-2 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 min-h-[80px] flex flex-col justify-center">
              <p className="text-xl font-black text-purple-600">1</p>
              <p className="text-xs font-bold text-purple-700 mt-1">Games</p>
            </div>
            <div className="text-center p-2 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 min-h-[80px] flex flex-col justify-center">
              <p className="text-lg font-black text-green-600">{dailyStats?.won ? '100%' : '0%'}</p>
              <p className="text-xs font-bold text-green-700 mt-1">Win Rate</p>
            </div>
            <div className="text-center p-2 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 min-h-[80px] flex flex-col justify-center">
              <div className="flex items-center justify-center gap-1">
                <p className="text-xl font-black text-orange-600">{dailyStats?.streak || 0}</p>
                {(dailyStats?.streak || 0) > 0 && <span className="text-sm">🔥</span>}
              </div>
              <p className="text-xs font-bold text-orange-700 mt-1">Streak</p>
            </div>
            <div className="text-center p-2 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 min-h-[80px] flex flex-col justify-center">
              <p className="text-xl font-black text-blue-600">{dailyStats?.score || 0}</p>
              <p className="text-xs font-bold text-blue-700 mt-1">Best Score</p>
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