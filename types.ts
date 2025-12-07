export type Color = 'red' | 'blue' | 'yellow' | 'green' | 'purple';
export type Shape = 'circle' | 'square' | 'triangle' | 'star' | 'hexagon';

export type DieColor = Color | null; // null represents Blank
export type DieShape = Shape | null; // null represents Blank

export interface Disc {
  id: string;
  color: Color;
  shape: Shape;
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  rotation: number;
}

export interface Player {
  id: number;
  name: string;
  score: number;
  color: string; // UI color for the player zone
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export type GamePhase = 'setup' | 'playing' | 'ended';

export interface DragState {
  active: boolean;
  discId: string | null;
  currentX: number;
  currentY: number;
  startX: number;
  startY: number;
}
