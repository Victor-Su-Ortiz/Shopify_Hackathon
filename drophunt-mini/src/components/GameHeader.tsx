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
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-2xl mb-6 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🎯</span>
          <h1 className="text-2xl font-bold">DropHunt</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold">🔥 {streak}</p>
            <p className="text-xs opacity-90">Streak</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-sm opacity-90">
          {todayPlayed 
            ? (isGameWon ? "You solved today's drop! 🎉" : "Solve today's mystery drop")
            : "Ready for today's challenge?"}
        </p>
        {!isGameWon && todayPlayed && (
          <div className="bg-white/20 px-3 py-1 rounded-full">
            <p className="text-sm font-mono">{formatTime(elapsedTime)}</p>
          </div>
        )}
      </div>
    </div>
  );
};
