import React, { useState, useEffect } from 'react';
import { formatTime } from '../utils/gameUtils';

interface GameHeaderProps {
  streak: number;
  todayPlayed: boolean;
  startTime: number;
  isGameWon: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  streak,
  todayPlayed,
  startTime,
  isGameWon
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  useEffect(() => {
    if (!isGameWon && todayPlayed) {
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);
      return () => clearInterval(interval);
    }
    return () => {}; // Return empty cleanup function
  }, [isGameWon, todayPlayed]);
  
  const elapsedTime = Math.floor((currentTime - startTime) / 1000);
  
  return (
    <div className="mb-8">
      {/* Top bar with logo and streak */}
      <div className="flex items-center justify-between mb-4 animate-slide-down">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg animate-wiggle-hover">
            <span className="text-2xl">🎯</span>
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-800">DropHunt</h1>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Mystery Product Game</p>
          </div>
        </div>
        
        {/* Streak indicator */}
        <div className="flex items-center gap-4">
          {streak > 0 && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce-in">
              <span className="text-2xl streak-fire">🔥</span>
              <div className="text-center">
                <p className="text-2xl font-black">{streak}</p>
                <p className="text-xs font-bold">Day Streak</p>
              </div>
            </div>
          )}
          
          {/* Timer */}
          {!isGameWon && todayPlayed && (
            <div className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg">
              <p className="text-lg font-black font-mono">{formatTime(elapsedTime)}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Status banner */}
      <div className="card-bubble bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="emoji-lg animate-float">
              {isGameWon ? '🎉' : todayPlayed ? '🎮' : '✨'}
            </span>
            <div>
              <p className="text-xl font-black">
                {todayPlayed 
                  ? (isGameWon ? "Victory! You solved today's mystery! 🏆" : "Let's solve today's mystery!")
                  : "Ready for today's challenge?"}
              </p>
              <p className="text-sm font-semibold opacity-90">
                {isGameWon 
                  ? "Share your score with friends!" 
                  : "Use clues wisely to maximize your score"}
              </p>
            </div>
          </div>
          
          {/* Achievement badges */}
          {isGameWon && (
            <div className="flex gap-2">
              <span className="badge badge-success animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                SOLVED
              </span>
              {elapsedTime < 60 && (
                <span className="badge badge-warning animate-bounce-in" style={{ animationDelay: '0.3s' }}>
                  SPEED RUN
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Fun decorative elements */}
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-sparkle opacity-50"></div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full animate-sparkle opacity-50" style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      {/* Daily challenge info */}
      {!todayPlayed && (
        <div className="mascot-bubble mt-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-lg font-bold text-gray-800">
            <span className="text-2xl mr-2">👋</span>
            Welcome back! Today's mystery product is waiting for you!
          </p>
        </div>
      )}
    </div>
  );
};