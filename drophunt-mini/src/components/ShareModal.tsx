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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="card-bubble bg-white max-w-md w-full transform transition-all animate-bounce-in" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-t-3xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white text-3xl font-bold transition-colors"
          >
            ×
          </button>
          
          <div className="text-center">
            <span className="emoji-2xl animate-celebrate" style={{ fontSize: '4rem' }}>🏆</span>
            <h3 className="text-3xl font-black mt-3">Share Your Victory!</h3>
            <p className="text-lg font-semibold opacity-90 mt-2">
              Let your friends know how awesome you are!
            </p>
          </div>
          
          {/* Achievement badges */}
          <div className="flex justify-center gap-2 mt-4">
            {stats.won && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.3)', color: 'white' }}>
                🎯 SOLVED
              </span>
            )}
            {stats.streak > 0 && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.3)', color: 'white' }}>
                🔥 {stats.streak} STREAK
              </span>
            )}
            {stats.score && stats.score >= 80 && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.3)', color: 'white' }}>
                ⭐ HIGH SCORE
              </span>
            )}
          </div>
        </div>
        
        {/* Score preview */}
        <div className="p-6">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 mb-6">
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 font-bold text-center">{generateShareText()}</pre>
          </div>
          
          {/* Stats summary */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
              <span className="text-2xl">🏆</span>
              <p className="text-2xl font-black text-purple-600">{stats.score || 0}</p>
              <p className="text-xs font-bold text-purple-700">Score</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100">
              <span className="text-2xl">🔥</span>
              <p className="text-2xl font-black text-orange-600">{stats.streak}</p>
              <p className="text-xs font-bold text-orange-700">Streak</p>
            </div>
            <div className="text-center p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
              <span className="text-2xl">⏱️</span>
              <p className="text-2xl font-black text-blue-600">
                {stats.timeToSolve ? formatShareTime(stats.timeToSolve) : '--'}
              </p>
              <p className="text-xs font-bold text-blue-700">Time</p>
            </div>
          </div>
          
          {/* Share buttons */}
          <div className="space-y-3">
            <h4 className="text-center text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">
              Share with friends
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleShare('twitter')}
                className="btn-secondary flex items-center justify-center gap-2"
                style={{ 
                  background: 'linear-gradient(135deg, #1DA1F2 0%, #0c8dd6 100%)',
                  boxShadow: '0 4px 0 #0c7abd'
                }}
              >
                <span>🐦</span>
                <span className="font-bold">Twitter</span>
              </button>
              
              <button
                onClick={() => handleShare('messages')}
                className="btn-secondary flex items-center justify-center gap-2"
                style={{ 
                  background: 'linear-gradient(135deg, #25D366 0%, #20b857 100%)',
                  boxShadow: '0 4px 0 #1a9647'
                }}
              >
                <span>💬</span>
                <span className="font-bold">Messages</span>
              </button>
            </div>
            
            <button
              onClick={handleCopy}
              className={`w-full flex items-center justify-center gap-2 ${copied ? 'btn-primary' : 'btn-warning'} transition-all`}
              style={{ fontSize: '16px', padding: '14px' }}
            >
              {copied ? (
                <>
                  <span className="animate-bounce">✅</span>
                  <span className="font-black">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <span>📋</span>
                  <span className="font-black">Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
          
          {/* Fun message */}
          <div className="mt-6 text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
            <p className="text-sm font-bold text-gray-700">
              <span className="text-lg mr-1">💪</span>
              Challenge your friends to beat your score!
            </p>
            <p className="text-xs text-gray-600 font-semibold mt-1">
              Share your daily results and compete for the best streak
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};