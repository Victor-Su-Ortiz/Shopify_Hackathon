import React, { useState } from 'react';
import { DailyStats } from '../types/game';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: DailyStats | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, stats }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen || !stats) return null;
  
  const generateShareText = () => {
    const emoji = stats.won ? '🎯' : '❌';
    const clueEmojis = '🔍'.repeat(Math.min(stats.attempts, 5));
    const timeEmoji = stats.timeToSolve && stats.timeToSolve < 60 ? '⚡' : '⏱️';
    
    return `DropHunt ${stats.date} ${emoji}

${clueEmojis} (${stats.attempts} clues)
${timeEmoji} ${stats.timeToSolve ? formatShareTime(stats.timeToSolve) : 'DNF'}
🏆 Score: ${stats.score || 0}
🔥 Streak: ${stats.streak}

Play at shop.app/drophunt`;
  };
  
  const formatShareTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleCopy = async () => {
    const text = generateShareText();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleShare = async (platform: 'twitter' | 'instagram' | 'messages') => {
    const text = generateShareText();
    
    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'messages':
        if (navigator.share) {
          await navigator.share({ text });
        }
        break;
      default:
        handleCopy();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 transform transition-all scale-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Share Your Score!</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-4 mb-4 font-mono text-sm">
          <pre className="whitespace-pre-wrap">{generateShareText()}</pre>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => handleShare('twitter')}
            className="bg-blue-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>🐦</span> Twitter
          </button>
          <button
            onClick={() => handleShare('messages')}
            className="bg-green-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <span>💬</span> Messages
          </button>
        </div>
        
        <button
          onClick={handleCopy}
          className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          {copied ? (
            <>
              <span>✅</span> Copied!
            </>
          ) : (
            <>
              <span>📋</span> Copy to Clipboard
            </>
          )}
        </button>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Challenge your friends to beat your score!
          </p>
        </div>
      </div>
    </div>
  );
};
