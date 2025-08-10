import React, { useState, useEffect } from 'react';
import { Product } from '../types/game';
import { formatTime } from '../utils/gameUtils';

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
              onClick={() => {
                // Navigate to product in Shop app
                console.log('🛍️ View in Shop clicked:', product.id);
                
                // Try to use window.postMessage for Shop Mini navigation
                if (window.parent !== window) {
                  window.parent.postMessage({
                    type: 'shop:navigate',
                    action: 'viewProduct',
                    productId: product.id,
                    productTitle: product.title
                  }, '*');
                }
                
                // For demo/development, show a confirmation
                console.log(`📱 Opening product in Shop:
                  Title: ${product.title}
                  ID: ${product.id}
                  Vendor: ${product.vendor}
                  Price: ${product.price}`);
                
                // In production, the Shop app would handle this navigation
                // For now, we'll show a nice feedback message
                const message = document.createElement('div');
                message.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in-right';
                message.textContent = '✨ Opening in Shop...';
                document.body.appendChild(message);
                setTimeout(() => message.remove(), 2000);
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
