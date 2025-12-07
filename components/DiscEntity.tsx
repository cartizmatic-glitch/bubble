
import React from 'react';
import { Disc } from '../types';
import { ShapeIcon } from './Icons';

interface DiscEntityProps {
  disc: Disc;
  isDragging: boolean;
  style: React.CSSProperties;
  onPointerDown: (e: React.PointerEvent) => void;
  feedback?: boolean;
}

export const DiscEntity: React.FC<DiscEntityProps> = ({ disc, isDragging, style, onPointerDown, feedback }) => {
  return (
    <div
      className="absolute touch-none"
      style={style}
      onPointerDown={onPointerDown}
    >
      <div className={`
        relative w-16 h-16 sm:w-20 sm:h-20
        transition-all duration-200
        ${isDragging ? 'scale-110' : 'hover:scale-105'}
      `}>
        {/* Token Body (3D Chip Look) */}
        <div className={`
          absolute inset-0 rounded-full 
          bg-slate-100 
          shadow-[0_4px_6px_rgba(0,0,0,0.3),inset_0_-4px_4px_rgba(0,0,0,0.1)]
          border-4 border-slate-200
          flex items-center justify-center
          ${isDragging ? 'shadow-[0_15px_25px_rgba(0,0,0,0.4)] translate-y-[-5px]' : ''}
        `}>
          {/* Inner ring for detail */}
          <div className="absolute inset-1 rounded-full border border-slate-300 opacity-50 pointer-events-none"></div>
          
          {/* Icon */}
          <ShapeIcon 
            shape={disc.shape} 
            color={disc.color} 
            size={40} 
            className="filter drop-shadow-sm"
          />
        </div>

        {/* Feedback Ripple for wrong move */}
        {feedback && (
          <div className="absolute inset-0 flex items-center justify-center animate-ping pointer-events-none">
            <div className="w-full h-full rounded-full bg-red-500 opacity-50"></div>
          </div>
        )}
      </div>
    </div>
  );
};
