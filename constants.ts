import { Color, Shape, Player } from './types';

export const COLORS: Color[] = ['red', 'blue', 'yellow', 'green', 'purple'];
export const SHAPES: Shape[] = ['circle', 'square', 'triangle', 'star', 'hexagon'];

// Map game colors to Tailwind classes
export const COLOR_MAP: Record<Color, string> = {
  red: 'text-red-500 fill-red-500',
  blue: 'text-blue-500 fill-blue-500',
  yellow: 'text-yellow-400 fill-yellow-400',
  green: 'text-green-500 fill-green-500',
  purple: 'text-purple-500 fill-purple-500',
};

export const STROKE_MAP: Record<Color, string> = {
  red: 'stroke-red-600',
  blue: 'stroke-blue-600',
  yellow: 'stroke-yellow-600',
  green: 'stroke-green-600',
  purple: 'stroke-purple-600',
};

export const PLAYER_CONFIGS: Omit<Player, 'score' | 'name'>[] = [
  { id: 1, color: 'bg-rose-600', position: 'top-left' },
  { id: 2, color: 'bg-sky-600', position: 'top-right' },
  { id: 3, color: 'bg-emerald-600', position: 'bottom-left' },
  { id: 4, color: 'bg-amber-600', position: 'bottom-right' },
];

export const TOTAL_DISCS = 40;
