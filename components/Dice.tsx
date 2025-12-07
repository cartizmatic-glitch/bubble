
import React from 'react';
import { DieColor, DieShape } from '../types';
import { ShapeIcon } from './Icons';

interface DiceProps {
  colorDie: DieColor;
  shapeDie: DieShape;
  rolling: boolean;
  onRoll: () => void;
}

export const Dice: React.FC<DiceProps> = ({ colorDie, shapeDie, rolling, onRoll }) => {
  // Helper for full background colors
  const getBgColor = (c: DieColor) => {
    switch (c) {
      case 'red': return 'bg-red-500 border-red-600';
      case 'blue': return 'bg-blue-500 border-blue-600';
      case 'green': return 'bg-green-500 border-green-600';
      case 'yellow': return 'bg-yellow-400 border-yellow-500';
      case 'purple': return 'bg-purple-500 border-purple-600';
      default: return 'bg-slate-100 border-slate-300';
    }
  };

  return (
    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-white/20 pointer-events-auto">
      {/* Dice Container */}
      <div className="flex gap-3">
        {/* Color Die - Full Face Color */}
        <div className={`
            w-14 h-14 sm:w-16 sm:h-16 rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] border-b-4 
            flex items-center justify-center transition-all duration-300
            ${rolling ? 'animate-spin' : ''}
            ${getBgColor(colorDie)}
          `}>
          {rolling ? (
            <div className="text-white/50 font-bold text-xl">?</div>
          ) : colorDie === null ? (
            <div className="text-slate-400 font-bold text-xs uppercase tracking-wider">Blank</div>
          ) : (
            // Empty div because the background is the color
            <div />
          )}
        </div>

        {/* Shape Die - Black/Gray Shape on White */}
        <div className={`
            w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] border-b-4 border-slate-300
            flex items-center justify-center transition-all duration-300
            ${rolling ? 'animate-spin' : ''}
          `}>
          {rolling ? (
            <div className="text-slate-300 font-bold text-xl">?</div>
          ) : shapeDie === null ? (
             <div className="text-slate-400 font-bold text-xs uppercase tracking-wider">Blank</div>
          ) : (
            // Neutral dark color for the shape so it doesn't confuse with Color Die
            <ShapeIcon 
              shape={shapeDie} 
              color={undefined} // No color prop to avoid default colored mapping
              size={36} 
              className="text-slate-800 fill-slate-800" 
              filled={true}
            />
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onRoll}
        disabled={rolling}
        className={`
          h-14 sm:h-16 px-6 rounded-xl font-bold text-base sm:text-lg uppercase tracking-wider shadow-[0_4px_0_rgba(0,0,0,0.2)] border-b-4 transform transition-all active:translate-y-1 active:shadow-none active:border-b-0
          ${rolling 
            ? 'bg-slate-600 border-slate-700 text-slate-400 cursor-not-allowed' 
            : 'bg-gradient-to-b from-orange-400 to-orange-500 border-orange-600 text-white hover:brightness-110'}
        `}
      >
        {rolling ? '...' : 'Roll'}
      </button>
    </div>
  );
};
