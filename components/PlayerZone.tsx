import React from 'react';
import { Player } from '../types';

interface PlayerZoneProps {
  player: Player;
  isActiveDrop?: boolean;
}

export const PlayerZone: React.FC<PlayerZoneProps> = ({ player, isActiveDrop }) => {
  // Determine positioning classes
  const positionClasses = {
    'top-left': 'top-0 left-0 rounded-br-3xl border-r-4 border-b-4',
    'top-right': 'top-0 right-0 rounded-bl-3xl border-l-4 border-b-4',
    'bottom-left': 'bottom-0 left-0 rounded-tr-3xl border-r-4 border-t-4',
    'bottom-right': 'bottom-0 right-0 rounded-tl-3xl border-l-4 border-t-4',
  };

  return (
    <div 
      data-player-id={player.id}
      className={`absolute ${positionClasses[player.position]} w-32 h-32 sm:w-40 sm:h-40 z-10 
        flex flex-col items-center justify-center transition-all duration-200
        ${player.color} border-white/20 shadow-lg backdrop-blur-sm
        ${isActiveDrop ? 'scale-110 brightness-110 border-white ring-4 ring-white/50' : 'opacity-90'}
      `}
    >
      <div className="text-white font-bold text-lg drop-shadow-md">{player.name}</div>
      <div className="text-4xl font-black text-white drop-shadow-md mt-1">{player.score}</div>
      <div className="text-xs text-white/80 uppercase tracking-widest mt-2 font-semibold">Zone</div>
    </div>
  );
};
