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
      <div className="relative w-full h-64 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center text-white">
          <div className="text-6xl mb-2">❓</div>
          <p className="text-lg font-semibold">Mystery Product</p>
          <p className="text-sm opacity-90">Reveal more clues to discover!</p>
        </div>
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      </div>
    );
  }
  
  return (
    <div className="relative">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 1}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            >
              {['🎉', '🎊', '✨', '🌟'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}
      
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-700 scale-100">
        <div className="relative h-64 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            SOLVED! 🎯
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
          <p className="text-gray-600 mb-1">by {product.vendor}</p>
          <p className="text-3xl font-bold text-purple-600 mb-4">{product.price}</p>
          
          {product.description && (
            <p className="text-gray-700 mb-4">{product.description}</p>
          )}
          
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{score}</p>
              <p className="text-xs text-gray-600">Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{attempts}</p>
              <p className="text-xs text-gray-600">Clues Used</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {timeToSolve ? formatTime(timeToSolve) : '--'}
              </p>
              <p className="text-xs text-gray-600">Time</p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onShare}
              className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>📤</span> Share Score
            </button>
            <button
              onClick={async () => {
                // Navigate to product in Shop app
                console.log('🛍️ View in Shop clicked:', product.id);
                
                try {
                  // Use the real Shopify ID if available, otherwise use the demo ID
                  let productGid = product.shopifyId || product.id;
                  
                  // Check if it's already a GID format
                  if (!productGid.startsWith('gid://')) {
                    // For demo purposes, create a mock GID
                    // In production, this would be a real Shopify product GID
                    productGid = `gid://shopify/Product/${productGid}`;
                  }
                  
                  console.log('📱 Navigating to product GID:', productGid);
                  console.log('Product details:', {
                    title: product.title,
                    vendor: product.vendor,
                    price: product.price,
                    shopifyId: product.shopifyId,
                    demoId: product.id
                  });
                  
                  // Use the official Shop navigation if available
                  if (shopNavigation?.navigateToProduct) {
                    await shopNavigation.navigateToProduct({ 
                      productId: productGid 
                    });
                    console.log('✅ Navigation call successful');
                  } else {
                    console.warn('⚠️ Shop navigation not available, trying fallback...');
                    // Fallback: Try to open in a new window/tab
                    if (window.parent !== window) {
                      // We're in an iframe, send message to parent
                      window.parent.postMessage({
                        type: 'shop:navigate',
                        action: 'viewProduct',
                        productId: productGid
                      }, '*');
                    }
                  }
                  
                  // Show success feedback
                  const message = document.createElement('div');
                  message.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in-right';
                  message.textContent = '✨ Opening in Shop...';
                  document.body.appendChild(message);
                  setTimeout(() => message.remove(), 2000);
                  
                } catch (error) {
                  console.error('❌ Navigation error:', error);
                  
                  // Show error feedback
                  const message = document.createElement('div');
                  message.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in-right';
                  message.textContent = '⚠️ Could not open product';
                  document.body.appendChild(message);
                  setTimeout(() => message.remove(), 3000);
                }
              }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <span>🛍️</span> View in Shop
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 text-center">
              🔥 Come back tomorrow for a new mystery drop!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
