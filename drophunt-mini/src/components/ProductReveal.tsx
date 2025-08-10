import React, { useState, useEffect } from 'react';
import { Product } from '../types/game';
import { formatTime } from '../utils/gameUtils';
import { useShopNavigation } from '@shopify/shop-minis-react';

interface ProductRevealProps {
  product: Product;
  isRevealed: boolean;
  score?: number;
  attempts: number;
  timeToSolve?: number;
  onShare: () => void;
  onPlayAgain: () => void;
}

export const ProductReveal: React.FC<ProductRevealProps> = ({
  product,
  isRevealed,
  score,
  attempts,
  timeToSolve,
  onShare
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const shopNavigation = useShopNavigation();
  console.log('🧭 Shop Navigation available:', !!shopNavigation?.navigateToProduct);
  
  useEffect(() => {
    if (isRevealed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [isRevealed]);
  
  if (!isRevealed) {
    return (
      <div className="card-bubble bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden" style={{ minHeight: '280px' }}>
        <div className="absolute inset-0 bg-black/10" />
        
        {/* Animated question marks */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="absolute text-white/20 animate-float"
              style={{
                fontSize: '3rem',
                left: `${15 + (i % 3) * 30}%`,
                top: `${20 + Math.floor(i / 3) * 40}%`,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            >
              ❓
            </span>
          ))}
        </div>
        
        <div className="relative z-10 text-center text-white py-16">
          <div className="emoji-2xl mb-4 animate-wiggle" style={{ fontSize: '5rem' }}>🎁</div>
          <h2 className="text-3xl font-black mb-2">Mystery Product</h2>
          <p className="text-lg font-semibold opacity-90">
            Can you guess what's inside?
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <span className="badge" style={{ background: 'rgba(255,255,255,0.3)', color: 'white' }}>
              🕵️ Detective Mode
            </span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.3)', color: 'white' }}>
              🎯 Daily Challenge
            </span>
          </div>
        </div>
        
        {/* Decorative circles */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-float" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
      </div>
    );
  }
  
  return (
    <div className="relative">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                backgroundColor: ['#58cc02', '#1cb0f6', '#ffc800', '#ff4b4b', '#ce82ff'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </div>
      )}
      
      <div className="card-bubble bg-white overflow-hidden transform transition-all duration-700 animate-celebrate">
        {/* Success banner */}
        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-4 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 animate-pulse" />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="emoji-lg animate-bounce">🎉</span>
              <h2 className="text-2xl font-black">AMAZING!</h2>
              <span className="emoji-lg animate-bounce" style={{ animationDelay: '0.2s' }}>🎊</span>
            </div>
            <p className="text-lg font-bold">You solved the mystery!</p>
          </div>
        </div>
        
        {/* Product image */}
        <div className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4">
            <span className="badge badge-success text-lg px-4 py-2 animate-glow">
              ✅ SOLVED
            </span>
          </div>
        </div>
        
        {/* Product details */}
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-black text-gray-800 mb-2">{product.title}</h2>
            <p className="text-lg text-gray-600 font-semibold">by {product.vendor}</p>
            <p className="text-4xl font-black text-green-600 mt-3">{product.price}</p>
          </div>
          
          {product.description && (
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-gray-700 font-semibold">{product.description}</p>
            </div>
          )}
          
          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="card-bubble text-center px-2 py-3 bg-gradient-to-br from-purple-50 to-purple-100 min-h-[90px] flex flex-col justify-center">
              <span className="text-lg">🏆</span>
              <p className="text-xl font-black text-purple-600 whitespace-nowrap">{score}</p>
              <p className="text-xs font-bold text-purple-700">SCORE</p>
            </div>
            <div className="card-bubble text-center px-2 py-3 bg-gradient-to-br from-blue-50 to-blue-100 min-h-[90px] flex flex-col justify-center">
              <span className="text-lg">🔍</span>
              <p className="text-xl font-black text-blue-600 whitespace-nowrap">{attempts}</p>
              <p className="text-xs font-bold text-blue-700">CLUES</p>
            </div>
            <div className="card-bubble text-center px-2 py-3 bg-gradient-to-br from-green-50 to-green-100 min-h-[90px] flex flex-col justify-center">
              <span className="text-lg">⏱️</span>
              <p className="text-sm font-black text-green-600 whitespace-nowrap">
                {timeToSolve ? formatTime(timeToSolve) : '--:--'}
              </p>
              <p className="text-xs font-bold text-green-700">TIME</p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onShare}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              style={{ fontSize: '18px', padding: '14px 24px' }}
            >
              <span>🚀</span> Share Victory
            </button>
            <button
              onClick={async () => {
                // Navigate to product in Shop app
                console.log('🛍️ View in Shop clicked:', product.id);
                
                try {
                  // For demo products, show a friendly message
                  if (product.id === 'prod_demo') {
                    // Show demo message
                    const message = document.createElement('div');
                    message.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-slide-down font-bold';
                    message.innerHTML = '<span class="mr-2">🛍️</span> Demo Product - In real app, this opens in Shop!';
                    document.body.appendChild(message);
                    setTimeout(() => message.remove(), 3000);
                    
                    console.log('📱 Demo product - navigation simulated');
                    return;
                  }
                  
                  // Use the real Shopify ID if available
                  let productGid = product.shopifyId || product.id;
                  
                  // Check if it's already a GID format
                  if (!productGid.startsWith('gid://')) {
                    // Create a proper Shopify GID
                    productGid = `gid://shopify/Product/${productGid}`;
                  }
                  
                  console.log('📱 Navigating to product GID:', productGid);
                  
                  // Use the official Shop navigation if available
                  if (shopNavigation?.navigateToProduct) {
                    await shopNavigation.navigateToProduct({ 
                      productId: productGid 
                    });
                    console.log('✅ Navigation call successful');
                    
                    // Show success feedback
                    const message = document.createElement('div');
                    message.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-slide-down font-bold';
                    message.innerHTML = '<span class="mr-2">✨</span> Opening in Shop...';
                    document.body.appendChild(message);
                    setTimeout(() => message.remove(), 2000);
                  } else {
                    console.warn('⚠️ Shop navigation not available');
                    // Show demo message for development
                    const message = document.createElement('div');
                    message.className = 'fixed top-4 right-4 bg-yellow-500 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-slide-down font-bold';
                    message.innerHTML = '<span class="mr-2">⚠️</span> Shop navigation not available in dev mode';
                    document.body.appendChild(message);
                    setTimeout(() => message.remove(), 3000);
                  }
                  
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  
                  // Show error feedback
                  const message = document.createElement('div');
                  message.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-full shadow-xl z-50 animate-slide-down font-bold';
                  message.innerHTML = '<span class="mr-2">⚠️</span> Could not open product';
                  document.body.appendChild(message);
                  setTimeout(() => message.remove(), 3000);
                }
              }}
              className="btn-secondary flex-1 flex items-center justify-center gap-2"
              style={{ fontSize: '18px', padding: '14px 24px' }}
            >
              <span>🛍️</span> View in Shop
            </button>
          </div>
          
          {/* Fun achievement badges */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {attempts <= 3 && (
              <span className="badge badge-warning animate-bounce-in">
                ⚡ QUICK SOLVER
              </span>
            )}
            {timeToSolve && timeToSolve < 30 && (
              <span className="badge badge-info animate-bounce-in" style={{ animationDelay: '0.1s' }}>
                🚀 SPEED DEMON
              </span>
            )}
            {score && score >= 80 && (
              <span className="badge badge-success animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                🎯 PERFECT SCORE
              </span>
            )}
          </div>
          
          {/* Next challenge teaser */}
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl text-center">
            <p className="text-lg font-bold text-gray-800">
              <span className="text-2xl mr-2">🔥</span>
              Come back tomorrow for a new mystery!
            </p>
            <p className="text-sm text-gray-600 font-semibold mt-1">
              Keep your streak alive!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};