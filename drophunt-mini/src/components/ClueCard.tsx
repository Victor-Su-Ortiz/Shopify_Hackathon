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
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'category':
        return '📦';
      case 'brand':
        return '🏷️';
      case 'price':
        return '💰';
      case 'feature':
        return '✨';
      case 'rating':
        return '⭐';
      case 'location':
        return '📍';
      case 'style':
        return '👗';
      default:
        return '🔍';
    }
  };
  
  return (
    <div className="mb-3">
      {isRevealed ? (
        <div 
          className={`p-4 rounded-lg border-2 ${getDifficultyColor(clue.difficulty)} animate-slide-in`}
          style={{
            animationDelay: `${index * 100}ms`
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getTypeIcon(clue.type)}</span>
              <span className="text-xs font-semibold uppercase tracking-wider">
                Clue {index + 1}
              </span>
            </div>
            <span className="text-xs px-2 py-1 bg-white/50 rounded-full">
              {clue.difficulty}
            </span>
          </div>
          <p className="text-sm font-medium leading-relaxed">
            {clue.text}
          </p>
        </div>
      ) : (
        <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-200">
          <div className="flex items-center justify-center h-12">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
