import React from 'react';
import { Clue } from '../types/game';

interface ClueCardProps {
  clue: Clue;
  isRevealed: boolean;
  index: number;
}

export const ClueCard: React.FC<ClueCardProps> = ({ clue, isRevealed, index }) => {
  // Log when card renders
  console.log(`🃏 ClueCard ${index + 1} rendered:`, {
    clueId: clue.id,
    isRevealed,
    clueText: isRevealed ? clue.text : 'Hidden'
  });
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return {
          bg: 'from-green-400 to-green-600',
          badge: 'bg-green-500',
          icon: '🌱',
          points: '+10'
        };
      case 'medium':
        return {
          bg: 'from-yellow-400 to-orange-500',
          badge: 'bg-yellow-500',
          icon: '⚡',
          points: '+20'
        };
      case 'hard':
        return {
          bg: 'from-red-400 to-pink-500',
          badge: 'bg-red-500',
          icon: '🔥',
          points: '+30'
        };
      default:
        return {
          bg: 'from-gray-400 to-gray-600',
          badge: 'bg-gray-500',
          icon: '✨',
          points: '+10'
        };
    }
  };
  
  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: { emoji: string; label: string } } = {
      category: { emoji: '📦', label: 'Category' },
      brand: { emoji: '🏷️', label: 'Brand' },
      price: { emoji: '💰', label: 'Price' },
      feature: { emoji: '✨', label: 'Feature' },
      rating: { emoji: '⭐', label: 'Rating' },
      location: { emoji: '📍', label: 'Location' },
      style: { emoji: '🎨', label: 'Style' }
    };
    return icons[type] || { emoji: '🔍', label: 'Clue' };
  };
  
  const difficultyInfo = getDifficultyColor(clue.difficulty);
  const typeInfo = getTypeIcon(clue.type);
  
  return (
    <div className="relative">
      {isRevealed ? (
        <div 
          className="card-bubble bg-white relative overflow-hidden animate-bounce-in transform hover:scale-[1.02] transition-all"
          style={{
            animationDelay: `${index * 100}ms`,
            padding: '20px'
          }}
        >
          {/* Gradient accent on left side */}
          <div 
            className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${difficultyInfo.bg}`}
          />
          
          <div className="flex items-start justify-between mb-3 pl-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${difficultyInfo.bg} flex items-center justify-center shadow-md animate-wiggle-hover`}>
                <span className="text-2xl">{typeInfo.emoji}</span>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-600">
                  Clue #{index + 1}
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {typeInfo.label}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`${difficultyInfo.badge} text-white px-3 py-1 rounded-full text-xs font-black shadow-md`}>
                {difficultyInfo.icon} {clue.difficulty.toUpperCase()}
              </span>
              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-md">
                {difficultyInfo.points}
              </span>
            </div>
          </div>
          
          <div className="pl-4 pr-2">
            <p className="text-base font-semibold text-gray-800 leading-relaxed">
              {clue.text}
            </p>
          </div>
          
          {/* Fun decorative element */}
          <div 
            className={`absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-br ${difficultyInfo.bg} rounded-full opacity-10`}
          />
        </div>
      ) : (
        <div className="card-bubble bg-gray-100 relative overflow-hidden hover:bg-gray-200 transition-all cursor-not-allowed">
          <div className="flex items-center justify-center py-6">
            <div className="text-center">
              <div className="flex gap-2 justify-center mb-2">
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" />
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
              <p className="text-sm font-bold text-gray-500">
                <span className="text-lg mr-1">🔒</span>
                Clue #{index + 1} - Locked
              </p>
              <p className="text-xs text-gray-400 mt-1 font-semibold">
                Reveal more clues to unlock
              </p>
            </div>
          </div>
          
          {/* Decorative locked pattern */}
          <div className="absolute inset-0 opacity-5">
            {[...Array(20)].map((_, i) => (
              <span 
                key={i} 
                className="absolute text-4xl text-gray-600"
                style={{
                  left: `${(i % 5) * 25}%`,
                  top: `${Math.floor(i / 5) * 25}%`,
                  transform: 'rotate(-15deg)'
                }}
              >
                🔒
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};