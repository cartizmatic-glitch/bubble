
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Player, Disc, Color, Shape, DieColor, DieShape, 
  GamePhase, DragState 
} from './types';
import { COLORS, SHAPES, PLAYER_CONFIGS, TOTAL_DISCS } from './constants';
import { PlayerZone } from './components/PlayerZone';
import { Dice } from './components/Dice';
import { DiscEntity } from './components/DiscEntity';
import { Settings, RefreshCcw, Trophy, Users, Info, Volume2, VolumeX } from 'lucide-react';
import { soundManager } from './utils/sound';

export default function App() {
  // Game Configuration State
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [isMuted, setIsMuted] = useState(false);
  
  // Gameplay State
  const [players, setPlayers] = useState<Player[]>([]);
  const [discs, setDiscs] = useState<Disc[]>([]);
  const [colorDie, setColorDie] = useState<DieColor>(null);
  const [shapeDie, setShapeDie] = useState<DieShape>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [winningPlayer, setWinningPlayer] = useState<Player | null>(null);
  const [ruleText, setRuleText] = useState<string>("Roll to start!");
  const [wrongMoveFeedback, setWrongMoveFeedback] = useState<{id: string, x: number, y: number} | null>(null);

  // Dragging State Refs for performance
  const dragRef = useRef<DragState>({
    active: false,
    discId: null,
    currentX: 0,
    currentY: 0,
    startX: 0,
    startY: 0
  });
  const [activeDragId, setActiveDragId] = useState<string | null>(null); // For React rendering updates
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 }); // Visual update

  // --- Initialization Logic ---

  const generateDiscs = () => {
    const newDiscs: Disc[] = [];
    // Adjusted boundaries to avoid Top HUD (Dice) and Corner Players
    // Y: Start lower (25%) to clear Dice, end earlier (80%) to clear bottom players
    // X: 15-85% is safe for center, but corners are occupied.
    const minX = 10;
    const maxX = 90;
    const minY = 22; // Clears the Top Bar
    const maxY = 78; // Clears the Bottom area

    for (let i = 0; i < TOTAL_DISCS; i++) {
      newDiscs.push({
        id: `disc-${i}-${Date.now()}`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        x: Math.random() * (maxX - minX) + minX,
        y: Math.random() * (maxY - minY) + minY,
        rotation: Math.random() * 360,
      });
    }
    return newDiscs;
  };

  const startGame = () => {
    soundManager.startMusic();
    soundManager.playClick();
    
    const newPlayers = PLAYER_CONFIGS.slice(0, playerCount).map((config, index) => ({
      ...config,
      score: 0,
      name: `P${index + 1}`
    }));
    setPlayers(newPlayers);
    setDiscs(generateDiscs());
    setColorDie(null);
    setShapeDie(null);
    setPhase('playing');
    setRuleText("Roll the dice!");
  };

  const resetGame = () => {
    soundManager.playClick();
    setPhase('setup');
    setWinningPlayer(null);
  };

  const toggleAudio = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // --- Core Game Logic ---

  const rollDice = () => {
    if (isRolling) return;
    soundManager.playClick();
    setIsRolling(true);

    // Animation frames
    let frames = 0;
    const interval = setInterval(() => {
      // Play rattle sound occasionally
      if (frames % 4 === 0) soundManager.playRoll();

      // Show random faces during roll
      setColorDie(Math.random() > 0.8 ? null : COLORS[Math.floor(Math.random() * COLORS.length)]);
      setShapeDie(Math.random() > 0.8 ? null : SHAPES[Math.floor(Math.random() * SHAPES.length)]);
      frames++;
      if (frames > 15) {
        clearInterval(interval);
        finalizeRoll();
      }
    }, 80);
  };

  const finalizeRoll = () => {
    setIsRolling(false);
    
    // 1 in 6 chance for blank (approx)
    const rolledColor = Math.random() > 0.83 ? null : COLORS[Math.floor(Math.random() * COLORS.length)];
    const rolledShape = Math.random() > 0.83 ? null : SHAPES[Math.floor(Math.random() * SHAPES.length)];

    setColorDie(rolledColor);
    setShapeDie(rolledShape);

    // Update rule text
    if (rolledColor && rolledShape) {
      setRuleText(`Find ${rolledColor} ${rolledShape}s!`);
    } else if (!rolledColor && rolledShape) {
      setRuleText(`Find ANY ${rolledShape}!`);
    } else if (rolledColor && !rolledShape) {
      setRuleText(`Find ANY ${rolledColor} item!`);
    } else {
      setRuleText("Free for all! Grab anything!");
    }
  };

  const isValidMatch = (disc: Disc): boolean => {
    // Rule 4: Both Blank -> Match Anything
    if (colorDie === null && shapeDie === null) return true;

    // Rule 2: Color Blank, Shape Set -> Match Shape
    if (colorDie === null && shapeDie !== null) {
      return disc.shape === shapeDie;
    }

    // Rule 3: Shape Blank, Color Set -> Match Color
    if (shapeDie === null && colorDie !== null) {
      return disc.color === colorDie;
    }

    // Rule 1: Both Set -> Match Both
    if (colorDie !== null && shapeDie !== null) {
      return disc.color === colorDie && disc.shape === shapeDie;
    }

    return false;
  };

  // --- Interaction Logic (Drag & Drop) ---

  const handlePointerDown = (e: React.PointerEvent, disc: Disc) => {
    if (phase !== 'playing' || isRolling) return;
    
    soundManager.playPop();

    // Prevent default touch actions like scrolling
    e.preventDefault();
    e.stopPropagation();

    // We can't easily rely on getBoundingClientRect of target here because transform changes logic
    // So we use the visual coordinates we already know (disc.x/y) as starting point, but 
    // actually, we just need the mouse offset.
    
    dragRef.current = {
      active: true,
      discId: disc.id,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    };
    
    setActiveDragId(disc.id);
    setDragPosition({ x: e.clientX, y: e.clientY });

    // Capture pointer to ensure we get move events even if mouse leaves element
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    
    e.preventDefault();

    dragRef.current.currentX = e.clientX;
    dragRef.current.currentY = e.clientY;
    
    // Update visual position
    setDragPosition({ x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.active) return;
    
    const { discId, currentX, currentY } = dragRef.current;
    dragRef.current.active = false;
    setActiveDragId(null);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);

    // Calculate new percentage position
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const newX = (currentX / winW) * 100;
    const newY = (currentY / winH) * 100;

    // Check collision with player zones
    const hitPlayer = checkDropZone(currentX, currentY);

    if (hitPlayer) {
      const disc = discs.find(d => d.id === discId);
      if (disc) {
        if (isValidMatch(disc)) {
          handleScore(hitPlayer.id, disc.id);
          return; // Disc is removed, no need to update position
        } else {
          soundManager.playError();
          setWrongMoveFeedback({ id: disc.id, x: currentX, y: currentY });
          setTimeout(() => setWrongMoveFeedback(null), 500);
          return; // Return here so we DON'T update the position; disc snaps back
        }
      }
    }

    // Update disc position permanently (unless it was consumed by scoring or rejected)
    setDiscs(prevDiscs => prevDiscs.map(d => {
      if (d.id === discId) {
        return { ...d, x: newX, y: newY };
      }
      return d;
    }));
  };

  const checkDropZone = (x: number, y: number): Player | undefined => {
    const elements = document.elementsFromPoint(x, y);
    const zone = elements.find(el => el.hasAttribute('data-player-id'));
    
    if (zone) {
      const id = parseInt(zone.getAttribute('data-player-id') || '0');
      return players.find(p => p.id === id);
    }
    return undefined;
  };

  const handleScore = (playerId: number, discId: string) => {
    soundManager.playSuccess();
    
    // Remove disc
    setDiscs(prev => prev.filter(d => d.id !== discId));
    
    // Increment score
    setPlayers(prev => prev.map(p => 
      p.id === playerId ? { ...p, score: p.score + 1 } : p
    ));

    // Check end condition
    if (discs.length <= 1) { 
      endGame();
    }
  };

  const endGame = () => {
    soundManager.playWin();
    soundManager.stopMusic();
    const winner = [...players].sort((a, b) => b.score - a.score)[0];
    setWinningPlayer(winner);
    setPhase('ended');
  };

  // --- Renders ---

  // Common Background Elements (The "Attractive" part)
  const Background = () => (
    <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#312e81] to-[#4c1d95] -z-20 overflow-hidden">
      {/* Animated Bubbles */}
      <ul className="circles">
        <li></li><li></li><li></li><li></li><li></li>
        <li></li><li></li><li></li><li></li><li></li>
      </ul>
      {/* Mesh/Grid Overlay for texture */}
      <div className="absolute inset-0 opacity-10" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }}>
      </div>
    </div>
  );

  if (phase === 'setup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden text-white">
        <Background />
        
        <div className="z-10 bg-white/10 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full text-center relative">
          
          {/* Audio Toggle in Menu */}
          <button onClick={toggleAudio} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition text-slate-300">
             {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>

          <div className="mb-6 flex justify-center text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
            <Trophy size={64} strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight drop-shadow-md">BUBBLE MATCH</h1>
          <p className="text-blue-200 mb-8 font-medium">Fast-paced pattern matching chaos.</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-blue-200 uppercase tracking-wider mb-3">
                Number of Players
              </label>
              <div className="flex justify-center gap-4">
                {[2, 3, 4].map(num => (
                  <button
                    key={num}
                    onClick={() => { soundManager.playClick(); setPlayerCount(num); }}
                    className={`
                      w-14 h-14 rounded-2xl font-bold text-xl flex items-center justify-center transition-all duration-300
                      ${playerCount === num 
                        ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] scale-110 border-2 border-blue-300' 
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 border border-slate-700'}
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl font-black text-xl text-white shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all active:scale-95"
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#2a303c] overflow-hidden select-none touch-none font-sans">
      <Background />

      {/* Audio Toggle In-Game */}
      <button 
        onClick={toggleAudio} 
        className="absolute top-6 left-1/2 -translate-x-[200px] sm:-translate-x-[250px] z-30 p-2 rounded-full bg-black/20 text-white/50 hover:text-white hover:bg-black/40 transition"
      >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>
      
      {/* Players HUD */}
      {players.map(player => (
        <PlayerZone key={player.id} player={player} />
      ))}

      {/* Top HUD: Dice & Rules - MOVED FROM CENTER TO TOP */}
      <div className="absolute top-4 sm:top-8 left-0 right-0 flex flex-col items-center z-30 pointer-events-none">
        {phase === 'playing' && (
          <Dice 
            colorDie={colorDie} 
            shapeDie={shapeDie} 
            rolling={isRolling} 
            onRoll={rollDice} 
          />
        )}
        
        {/* Rule Text Removed */}
      </div>

      {/* End Game Modal */}
      {phase === 'ended' && winningPlayer && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="bg-gradient-to-b from-slate-800 to-slate-900 p-8 rounded-[2rem] border border-white/10 text-center max-w-sm mx-4 shadow-2xl transform scale-100">
            <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-6 animate-bounce drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]" />
            <h2 className="text-3xl font-black text-white mb-2">WINNER!</h2>
            <div className={`text-6xl font-black mb-8 ${winningPlayer.color.replace('bg-', 'text-')} drop-shadow-md`}>
              {winningPlayer.name}
            </div>
            <p className="text-slate-400 mb-8 text-xl">
              Score: <span className="text-white font-bold text-2xl ml-2">{winningPlayer.score}</span>
            </p>
            <div className="flex gap-4 justify-center pointer-events-auto">
               <button 
                onClick={startGame}
                className="flex items-center gap-2 px-6 py-4 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-500 hover:scale-105 transition shadow-lg shadow-blue-600/30"
              >
                <RefreshCcw size={20} /> Play Again
              </button>
              <button 
                onClick={resetGame}
                className="flex items-center gap-2 px-6 py-4 bg-slate-700 rounded-xl font-bold text-white hover:bg-slate-600 hover:scale-105 transition shadow-lg"
              >
                <Settings size={20} /> Lobby
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Board / Discs Layer */}
      <div className="absolute inset-0 z-10" onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
        {discs.map((disc) => {
          const isDragging = activeDragId === disc.id;
          
          return (
             <DiscEntity 
              key={disc.id}
              disc={disc}
              isDragging={isDragging}
              onPointerDown={(e) => handlePointerDown(e, disc)}
              feedback={wrongMoveFeedback?.id === disc.id}
              style={{
                left: isDragging ? dragPosition.x : `${disc.x}%`,
                top: isDragging ? dragPosition.y : `${disc.y}%`,
                transform: `translate(-50%, -50%) rotate(${isDragging ? 0 : disc.rotation}deg)`,
                zIndex: isDragging ? 50 : 1,
              }}
             />
          );
        })}
      </div>

    </div>
  );
}
