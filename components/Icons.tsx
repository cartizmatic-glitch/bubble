import React from 'react';
import { Shape, Color } from '../types';
import { COLOR_MAP, STROKE_MAP } from '../constants';

interface ShapeIconProps {
  shape: Shape;
  color?: Color;
  className?: string;
  size?: number;
  filled?: boolean;
}

export const ShapeIcon: React.FC<ShapeIconProps> = ({ shape, color, className = "", size = 24, filled = true }) => {
  const colorClass = color ? COLOR_MAP[color] : 'text-gray-400 fill-gray-400';
  const strokeClass = color ? STROKE_MAP[color] : 'stroke-gray-500';
  
  // Tailwind overrides if color is explicitly null (for dice blank face)
  const finalClass = color === undefined ? className : `${colorClass} ${strokeClass} ${className}`;

  const commonProps = {
    width: size,
    height: size,
    strokeWidth: 2,
    className: finalClass,
    style: { fillOpacity: filled ? 0.8 : 0, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  };

  switch (shape) {
    case 'circle':
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <circle cx="12" cy="12" r="10" />
        </svg>
      );
    case 'square':
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        </svg>
      );
    case 'triangle':
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M12 2L2 22h20L12 2z" />
        </svg>
      );
    case 'hexagon':
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <path d="M21 16V8l-9-5-9 5v8l9 5 9-5z" />
        </svg>
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" {...commonProps}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    default:
      return null;
  }
};
