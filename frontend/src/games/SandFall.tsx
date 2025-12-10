import { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Button3D from '../components/Button3D';
import Layout from '../components/Layout';
import client from '../api/client';

// --- CONFIG & CONSTANTS ---
const CONFIG = {
  grid: {
    width: 200,      // Higher res for smoother sand
    height: 320,
    blockSize: 12,   // Macro-block size (pixels per block segment)
  },
  gameplay: {
    dropIntervals: {
      easy: 35,
      medium: 25,
      hard: 8,
    },
    fastDropInterval: 1,
    moveStep: 5,
    inputSensitivity: 0.8,
  },
  physics: {
    sandTickRate: 1, // Update sand every frame (or higher for slower)
  },
  visuals: {
    shakeIntensity: 5,
    colors: [
      "#FF3855", // Red
      "#00D2FF", // Cyan
      "#88FF00", // Lime
      "#FFD600", // Yellow
      "#BD00FF", // Purple
    ],
    pieceTemplates: [
      [[1, 1, 1, 1]], // I
      [
        [1, 1],
        [1, 1],
      ], // O
      [
        [0, 1, 0],
        [1, 1, 1],
      ], // T
      [
        [1, 0, 0],
        [1, 1, 1],
      ], // L
      [
        [0, 0, 1],
        [1, 1, 1],
      ], // J
      [
        [0, 1, 1],
        [1, 1, 0],
      ], // S
      [
        [1, 1, 0],
        [0, 1, 1],
      ], // Z
    ],
  },
};

type GameState = "MENU" | "PLAYING" | "GAMEOVER";

class SandFallEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  nextCanvas?: HTMLCanvasElement;
  nextCtx?: CanvasRenderingContext2D;
  
  grid: (string | null)[][] = [];
  
  // State
  score: number = 0;
  highScore: number = 0;
  state: GameState = "MENU";
  difficulty: number = 2; // 1=Easy, 2=Medium, 3=Hard
  
  // Loop vars
  currentDropInterval: number = CONFIG.gameplay.dropIntervals.medium;
  frameCount: number = 0;
  sandPhysicsTick: number = 0;
  animationFrameId: number | null = null;
  
  // Piece
  activePieceGrid: (string | null)[][] = [];
  pieceX: number = 0;
  pieceY: number = 0;
  pieceColor: string = "";
  
  // Next Piece
  nextPieceTemplate: number[][] | null = null;
  nextPieceColor: string | null = null;
  
  // Inputs
  softDropActive: boolean = false;
  
  // Particles
  particles: { x: number, y: number, vx: number, vy: number, color: string, life: number, maxLife: number, isTrail: boolean }[] = [];

  // Callbacks to React
  onScoreUpdate: (score: number) => void;
  onGameOver: (finalScore: number) => void;

  constructor(
    canvas: HTMLCanvasElement, 
    onScoreUpdate: (s: number) => void, 
    onGameOver: (s: number) => void
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;
    this.onScoreUpdate = onScoreUpdate;
    this.onGameOver = onGameOver;
    
    // Default High Score
    const saved = localStorage.getItem("sandFallHighScore");
    this.highScore = saved ? parseInt(saved) : 0;
    
    this.initGrid();
    this.resize();
  }
  
  setNextCanvas(canvas: HTMLCanvasElement) {
    this.nextCanvas = canvas;
    this.nextCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
  }

  initGrid() {
    this.grid = Array(CONFIG.grid.height).fill(null).map(() => Array(CONFIG.grid.width).fill(null));
  }

  resize() {
      // In this React version, we rely on the container size, but we must enforce 
      // internal logical resolution for the physics to work right.
      this.canvas.width = CONFIG.grid.width;
      this.canvas.height = CONFIG.grid.height;
      this.ctx.imageSmoothingEnabled = false;
      
      if (this.nextCanvas) {
          // ensure next canvas size if needed, though usually fixed in CSS/HTML
          // this.nextCanvas.width = 40; 
          // this.nextCanvas.height = 40;
      }
  }

  startGame(difficulty: number) {
    this.difficulty = difficulty;
    this.initGrid();
    this.score = 0;
    this.onScoreUpdate(0);
    
    if (difficulty === 1) this.currentDropInterval = CONFIG.gameplay.dropIntervals.easy;
    else if (difficulty === 2) this.currentDropInterval = CONFIG.gameplay.dropIntervals.medium;
    else this.currentDropInterval = CONFIG.gameplay.dropIntervals.hard;
    
    this.state = "PLAYING";
    this.particles = [];
    this.randomizeNextPiece();
    this.spawnPiece();
    
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.loop();
  }

  stop() {
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      this.state = "MENU";
  }

  // --- LOGIC ---

  randomizeNextPiece() {
    const templates = CONFIG.visuals.pieceTemplates;
    const colors = CONFIG.visuals.colors;

    const typeIdx = Math.floor(Math.random() * templates.length);
    const colorIdx = Math.floor(Math.random() * colors.length);

    this.nextPieceTemplate = templates[typeIdx];
    this.nextPieceColor = colors[colorIdx];
    this.drawNextPiece();
  }

  generatePieceGrid(template: number[][], color: string) {
    const bs = CONFIG.grid.blockSize;
    const rows = template.length;
    const cols = template[0].length;
    const pH = rows * bs;
    const pW = cols * bs;

    let newGrid = Array(pH).fill(null).map(() => Array(pW).fill(null));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (template[r][c]) {
          for (let y = 0; y < bs; y++) {
            for (let x = 0; x < bs; x++) {
              newGrid[r * bs + y][c * bs + x] = color;
            }
          }
        }
      }
    }
    return newGrid;
  }
  
  drawNextPiece() {
      if (!this.nextCtx || !this.nextCanvas || !this.nextPieceTemplate || !this.nextPieceColor) return;
      
      const ctx = this.nextCtx;
      const w = this.nextCanvas.width;
      const h = this.nextCanvas.height;
      
      ctx.fillStyle = "#2d3436";
      ctx.fillRect(0, 0, w, h);

      const pW = this.nextPieceTemplate[0].length;
      const pH = this.nextPieceTemplate.length;
      const cellSize = 8;
      const offsetX = (w - pW * cellSize) / 2;
      const offsetY = (h - pH * cellSize) / 2;

      ctx.fillStyle = this.nextPieceColor;
      for (let r = 0; r < pH; r++) {
        for (let c = 0; c < pW; c++) {
          if (this.nextPieceTemplate[r][c]) {
            ctx.fillStyle = this.nextPieceColor!;
            ctx.fillRect(offsetX + c * cellSize, offsetY + r * cellSize, cellSize - 1, cellSize - 1);
            
            // Border
            ctx.fillStyle = "rgba(255,255,255,0.3)";
            ctx.fillRect(offsetX + c * cellSize, offsetY + r * cellSize, 1, cellSize);
            ctx.fillRect(offsetX + c * cellSize, offsetY + r * cellSize, cellSize, 1);
          }
        }
      }
  }

  spawnPiece() {
    if (!this.nextPieceTemplate || !this.nextPieceColor) return;

    this.activePieceGrid = this.generatePieceGrid(this.nextPieceTemplate, this.nextPieceColor);
    this.pieceColor = this.nextPieceColor;

    this.pieceX = Math.floor(CONFIG.grid.width / 2) - Math.floor(this.activePieceGrid[0].length / 2);
    this.pieceY = 0;

    this.randomizeNextPiece();

    if (this.checkCollision(this.pieceX, this.pieceY, this.activePieceGrid)) {
      this.gameOver();
    }
  }
  
  checkCollision(x: number, y: number, pGrid: (string | null)[][]) {
    const rows = pGrid.length;
    const cols = pGrid[0].length;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (pGrid[r][c]) {
          const nx = x + c;
          const ny = y + r;
          if (nx < 0 || nx >= CONFIG.grid.width || ny >= CONFIG.grid.height)
            return true;
          if (ny >= 0 && this.grid[ny][nx]) return true;
        }
      }
    }
    return false;
  }
  
  movePiece(dx: number, dy: number) {
     if (!this.activePieceGrid.length) return false;

     if (!this.checkCollision(this.pieceX + dx, this.pieceY + dy, this.activePieceGrid)) {
       this.pieceX += dx;
       this.pieceY += dy;
       if (dx !== 0) this.spawnTrail();
       return true;
     } else if (dy > 0) {
       // Locking logic
       // Try one more distinct step if simple collision? No, standard logic.
       // Actually, maybe we can slide? Reference does this:
       if (dy > 1 && !this.checkCollision(this.pieceX, this.pieceY + 1, this.activePieceGrid)) {
         this.pieceY += 1;
         return true;
       }
       this.lockPiece();
       return false;
     }
     return false;
  }

  rotatePiece() {
    if (!this.activePieceGrid.length) return;
    const rows = this.activePieceGrid.length;
    const cols = this.activePieceGrid[0].length;
    
    // Transpose + Reverse rows = Rotate 90 CW
    let newGrid = Array(cols).fill(null).map(() => Array(rows).fill(null));

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newGrid[c][rows - 1 - r] = this.activePieceGrid[r][c];
      }
    }

    if (!this.checkCollision(this.pieceX, this.pieceY, newGrid)) {
      this.activePieceGrid = newGrid;
    } else {
      // Wall Kick
      const kick = 5;
      if (!this.checkCollision(this.pieceX - kick, this.pieceY, newGrid)) {
        this.pieceX -= kick;
        this.activePieceGrid = newGrid;
      } else if (!this.checkCollision(this.pieceX + kick, this.pieceY, newGrid)) {
        this.pieceX += kick;
        this.activePieceGrid = newGrid;
      }
    }
  }

  hardDrop() {
      while (this.movePiece(0, 1));
      this.shakeScreen(CONFIG.visuals.shakeIntensity);
  }
  
  shakeScreen(intensity: number) {
      // In React, we might want to set a state or manipulate DOM.
      // For now, let's manipulate the canvas style directly for perf
      const canvas = this.canvas;
      canvas.style.transform = `translate(${Math.random()*intensity - intensity/2}px, ${Math.random()*intensity - intensity/2}px)`;
      setTimeout(() => {
          canvas.style.transform = 'translate(0,0)';
      }, 50);
  }

  lockPiece() {
    let minY = CONFIG.grid.height;
    const rows = this.activePieceGrid.length;
    const cols = this.activePieceGrid[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (this.activePieceGrid[r][c]) {
          const gx = this.pieceX + c;
          const gy = this.pieceY + r;
          if (gy >= 0 && gy < CONFIG.grid.height && gx >= 0 && gx < CONFIG.grid.width) {
            this.grid[gy][gx] = this.activePieceGrid[r][c];
            if (gy < minY) minY = gy;
          }
        }
      }
    }

    // Loose condition
    if (minY < 20) {
      this.gameOver();
      return;
    }

    this.checkLines();
    this.spawnPiece();
  }

  checkLines() {
    // Simple flood fill to detect full left-to-right connections
    let visited = new Uint8Array(CONFIG.grid.width * CONFIG.grid.height);
    let groupsToClear: {x:number, y:number, c:string}[][] = [];
    let scoreMulti = 0;

    for (let y = CONFIG.grid.height - 1; y >= 0; y--) {
      for (let x = 0; x < CONFIG.grid.width; x++) {
        const idx = y * CONFIG.grid.width + x;
        if (this.grid[y][x] && !visited[idx]) {
          let color = this.grid[y][x]!;
          let q = [idx];
          visited[idx] = 1;
          let minX = x, maxX = x;
          let group = [];

          let head = 0;
          while (head < q.length) {
            let curr = q[head++];
            let cx = curr % CONFIG.grid.width;
            let cy = Math.floor(curr / CONFIG.grid.width);

            group.push({ x: cx, y: cy, c: color });
            if (cx < minX) minX = cx;
            if (cx > maxX) maxX = cx;
            
            // Neighbors: Up, Down, Left, Right
            const neighbors = [curr + 1, curr - 1, curr + CONFIG.grid.width, curr - CONFIG.grid.width];
            
            // Validate bounds for left/right wrap
            // Left edge
            if (cx === 0) neighbors[1] = -1;
            // Right edge
            if (cx === CONFIG.grid.width - 1) neighbors[0] = -1;

            for (let nIdx of neighbors) {
                if (nIdx >= 0 && nIdx < visited.length && !visited[nIdx]) {
                    let ny = Math.floor(nIdx / CONFIG.grid.width);
                    let nx = nIdx % CONFIG.grid.width;
                    if (this.grid[ny][nx] === color) {
                        visited[nIdx] = 1;
                        q.push(nIdx);
                    }
                }
            }
          }

          if (minX === 0 && maxX === CONFIG.grid.width - 1) {
            groupsToClear.push(group);
            scoreMulti++;
          }
        }
      }
    }

    if (groupsToClear.length > 0) {
      let totalPixels = 0;
      groupsToClear.forEach((group) => {
        group.forEach((p) => {
          this.grid[p.y][p.x] = null;
          if (Math.random() > 0.6) {
            this.particles.push({
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 2,
              vy: (Math.random() - 1) * 2,
              color: p.c,
              life: 30,
              maxLife: 30,
              isTrail: false,
            });
          }
        });
        totalPixels += group.length;
      });

      const pts = Math.floor(totalPixels / 2) * (scoreMulti * 2);
      this.score += pts;
      this.onScoreUpdate(this.score);
    }
  }

  updateSand() {
    const w = CONFIG.grid.width;
    const h = CONFIG.grid.height;

    for (let y = h - 2; y >= 0; y--) {
      // Randomize scan direction to prevent bias
      let xStart = Math.random() < 0.5 ? 0 : w - 1;
      let xDir = xStart === 0 ? 1 : -1;

      for (let i = 0; i < w; i++) {
        let x = xStart + i * xDir;
        if (this.grid[y][x]) {
          const color = this.grid[y][x]!;

          if (!this.grid[y + 1][x]) {
            this.grid[y + 1][x] = color;
            this.grid[y][x] = null;
          } else {
            // Slippery sand logic
            let openLeft = x > 0 && !this.grid[y + 1][x - 1];
            let openRight = x < w - 1 && !this.grid[y + 1][x + 1];

            if (openLeft && openRight) {
              const dest = Math.random() < 0.5 ? x - 1 : x + 1;
              this.grid[y + 1][dest] = color;
              this.grid[y][x] = null;
            } else if (openLeft) {
              this.grid[y + 1][x - 1] = color;
              this.grid[y][x] = null;
            } else if (openRight) {
              this.grid[y + 1][x + 1] = color;
              this.grid[y][x] = null;
            }
          }
        }
      }
    }
  }
  
  spawnTrail() {
    if (!this.activePieceGrid.length) return;
    const rows = this.activePieceGrid.length;
    const cols = this.activePieceGrid[0].length;
    for (let i = 0; i < 3; i++) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (this.activePieceGrid[r][c]) {
        this.particles.push({
          x: this.pieceX + c,
          y: this.pieceY + r,
          vx: 0,
          vy: 0,
          color: this.activePieceGrid[r][c]!,
          life: 10,
          maxLife: 10,
          isTrail: true,
        });
      }
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      let p = this.particles[i];
      if (p.isTrail) {
        p.life -= 1;
      } else {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.life--;
      }
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // BG
    ctx.fillStyle = "#1e1e1e";
    ctx.fillRect(0, 0, w, h);

    // Danger Line
    ctx.strokeStyle = "#e74c3c";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(w, 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sand
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (this.grid[y][x]) {
          ctx.fillStyle = this.grid[y][x]!;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Active Piece
    if (this.activePieceGrid.length && this.state === "PLAYING") {
      const rows = this.activePieceGrid.length;
      const cols = this.activePieceGrid[0].length;

      // Ghost
      let ghostY = this.pieceY;
      while (!this.checkCollision(this.pieceX, ghostY + 1, this.activePieceGrid)) ghostY++;

      ctx.globalAlpha = 0.2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (this.activePieceGrid[r][c]) {
            ctx.fillStyle = this.activePieceGrid[r][c]!;
            ctx.fillRect(this.pieceX + c, ghostY + r, 1, 1);
          }
        }
      }
      ctx.globalAlpha = 1.0;

      // Piece
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (this.activePieceGrid[r][c]) {
            ctx.fillStyle = this.activePieceGrid[r][c]!;
            ctx.fillRect(this.pieceX + c, this.pieceY + r, 1, 1);

            // "Macro-block" internal borders
            if (r % CONFIG.grid.blockSize === 0 || c % CONFIG.grid.blockSize === 0) {
              ctx.fillStyle = "rgba(255,255,255,0.15)";
              ctx.fillRect(this.pieceX + c, this.pieceY + r, 1, 1);
            }
          }
        }
      }
    }

    // Particles
    this.particles.forEach((p) => {
      if (p.isTrail) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 20;
        ctx.fillRect(p.x, p.y, 1, 1);
        ctx.globalAlpha = 1.0;
      } else {
        // Flash white on spawn
        if (p.life > p.maxLife - 5) ctx.fillStyle = "#fff";
        else ctx.fillStyle = p.color;

        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillRect(p.x, p.y, 1, 1);
        ctx.globalAlpha = 1.0;
      }
    });
  }

  loop = () => {
      if (this.state === "PLAYING") {
          this.sandPhysicsTick++;
          if (this.sandPhysicsTick % CONFIG.physics.sandTickRate === 0) {
              this.updateSand();
          }
          if (this.sandPhysicsTick % 10 === 0) this.checkLines();
          this.updateParticles();
          
          this.frameCount++;
          if (this.frameCount >= this.currentDropInterval) {
              this.movePiece(0, 1);
              this.frameCount = 0;
          }
      }
      
      this.draw();
      this.animationFrameId = requestAnimationFrame(this.loop);
  }

  gameOver() {
      this.state = "GAMEOVER";
      this.onGameOver(this.score);
      if (this.score > this.highScore) {
          this.highScore = this.score;
          localStorage.setItem("sandFallHighScore", this.highScore.toString());
      }
  }

  destroy() {
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
  }
}

// --- REACT COMPONENT ---

const SandFall = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nextCanvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<SandFallEngine | null>(null);
  
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [started, setStarted] = useState(false);

  useEffect(() => {
     // Init High Score
     const saved = localStorage.getItem("sandFallHighScore");
     if (saved) setHighScore(parseInt(saved));
  }, []);

  useEffect(() => {
      if (!canvasRef.current) return;
      
      const engine = new SandFallEngine(
          canvasRef.current,
          (s) => setScore(s),
          (final) => {
              setGameOver(true);
              // Submit score API
              client.post('/games/submit', { 
                  sessionId: `sand-${Date.now()}`,
                  score: final 
              }).catch(() => {});
          }
      );
      
      if (nextCanvasRef.current) engine.setNextCanvas(nextCanvasRef.current);
      
      engineRef.current = engine;
      engine.draw(); // Initial draw

      // Client init call
      client.post('/games/start', { userId: user?.userId, gameName: 'sandfall' }).catch(console.error);

      return () => {
          engine.destroy();
      };
  }, []);

  useEffect(() => {
      if (nextCanvasRef.current && engineRef.current) {
           engineRef.current.setNextCanvas(nextCanvasRef.current);
           engineRef.current.drawNextPiece();
      }
  }, [nextCanvasRef.current]);

  const startGame = () => {
      if (!engineRef.current) return;
      setGameOver(false);
      setStarted(true);
      
      let diffVal = 2;
      if (difficulty === 'EASY') diffVal = 1;
      if (difficulty === 'HARD') diffVal = 3;
      
      engineRef.current.startGame(diffVal);
  };

  const restartGame = () => {
      startGame();
  };

  // Keyboard Inputs
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (!engineRef.current || !started || gameOver) return;
          const eng = engineRef.current;
          
          if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(e.key)) e.preventDefault();

          const step = CONFIG.gameplay.moveStep;
          if (e.key === "ArrowLeft") eng.movePiece(-step, 0);
          if (e.key === "ArrowRight") eng.movePiece(step, 0);
          if (e.key === "ArrowUp") eng.rotatePiece();
          if (e.key === " ") eng.hardDrop();
          if (e.key === "ArrowDown") {
              eng.softDropActive = true;
              eng.currentDropInterval = CONFIG.gameplay.fastDropInterval;
          }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
           if (!engineRef.current) return;
           if (e.key === "ArrowDown") {
              const eng = engineRef.current;
              eng.softDropActive = false;
              // restore
              if (eng.difficulty === 1) eng.currentDropInterval = CONFIG.gameplay.dropIntervals.easy;
              else if (eng.difficulty === 2) eng.currentDropInterval = CONFIG.gameplay.dropIntervals.medium;
              else eng.currentDropInterval = CONFIG.gameplay.dropIntervals.hard;
           }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
      };
  }, [started, gameOver]);
  
  // Touch Handling (Basic wrapper)
  // Logic inside Engine class was better but trying to keep it clean.
  // Actually, we can just forward events to the engine if we implemented methods there, 
  // or handle here. Reference used global variables. 
  // Let's implement valid touch here using the engine's public methods.
  const touchRef = useRef<{start: number, last: number, dragging: boolean}>({ start: 0, last: 0, dragging: false });
  
  const handleTouchStart = (e: React.TouchEvent) => {
      const t = e.touches[0];
      touchRef.current = { start: t.clientX, last: t.clientX, dragging: false };
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
      if (!engineRef.current || !started || gameOver) return;
      const t = e.touches[0];
      const dx = t.clientX - touchRef.current.last;
      const step = CONFIG.gameplay.moveStep;
      
      const sensitivity = (window.innerWidth / CONFIG.grid.width) * CONFIG.gameplay.inputSensitivity;

      if (Math.abs(dx) > sensitivity) {
          const dir = dx > 0 ? step : -step;
          engineRef.current.movePiece(dir, 0);
          touchRef.current.last = t.clientX;
          touchRef.current.dragging = true;
      }
      
      // Swipe down? Not easily detectable with just local state here ideally.
      // But we can check clientY inside engine or similar. 
  };
  
  const handleTouchEnd = () => {
       if (!engineRef.current || !started || gameOver) return;
       // Tap to rotate
       if (!touchRef.current.dragging) {
           engineRef.current.rotatePiece();
       }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center w-full h-full max-h-[90vh] overflow-hidden">
        
        {/* Header / HUD */}
        <div className="flex justify-between w-full max-w-[480px] px-4 pt-4 mb-2 z-10 shrink-0">
             <div className="flex flex-col bg-white/90 border-2 border-slate-300 px-4 py-2 rounded-full shadow-lg">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Score</span>
                 <span className="text-xl text-slate-800 font-black font-titan leading-none">{score}</span>
             </div>
             
             <div className="flex flex-col items-center">
                 <h1 className="font-titan text-3xl text-yellow-400 stroke-text drop-shadow-md">SAND FALL</h1>
             </div>

             <div className="flex flex-col bg-white/90 border-2 border-slate-300 px-4 py-2 rounded-full shadow-lg">
                 <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Best</span>
                 <span className="text-xl text-yellow-500 font-black font-titan leading-none">{highScore}</span>
             </div>
        </div>

        {/* Game Container */}
        <div className="relative flex-1 w-full max-w-[480px] flex justify-center items-start overflow-hidden">
            <div className="relative border-[8px] border-slate-700 rounded-3xl shadow-2xl bg-[#2d3436] overflow-hidden"
                 style={{ width: '100%', height: 'auto', aspectRatio: '200/320', maxHeight: '100%' }}>
                
                <canvas 
                    ref={canvasRef} 
                    className="w-full h-full block touch-none"
                    style={{ imageRendering: 'pixelated' }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                />
                
                {/* Next Piece Overlay */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-slate-800 border-2 border-white rounded-lg flex items-center justify-center shadow-lg pointer-events-none">
                     <canvas ref={nextCanvasRef} width={40} height={40} className="" style={{ imageRendering: 'pixelated' }} />
                </div>

                {/* Overlays */}
                {!started && !gameOver && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                         <div className="bg-[#fff9e6] border-[6px] border-white rounded-[30px] p-8 flex flex-col items-center shadow-2xl animate-bounce-in max-w-[80%]">
                             <div className="text-6xl mb-2 animate-bounce">😈</div>
                             <div className="font-titan text-4xl text-[#ff9f43] stroke-text-white mb-1">SAND FALL</div>
                             <div className="font-nunito text-xs font-black text-slate-500 uppercase tracking-[2px] mb-6">Puzzle Adventure</div>
                             
                             <div className="w-full bg-slate-100/50 p-4 rounded-xl mb-4">
                                 <div className="flex justify-between mb-2 text-xs font-bold text-slate-500">
                                     <span>DIFFICULTY</span>
                                     <span className={`
                                        ${difficulty === 'EASY' ? 'text-green-500' : ''}
                                        ${difficulty === 'MEDIUM' ? 'text-yellow-500' : ''}
                                        ${difficulty === 'HARD' ? 'text-red-500' : ''}
                                     `}>{difficulty}</span>
                                 </div>
                                 <input 
                                     type="range" min="1" max="3" step="1"
                                     value={difficulty === 'EASY' ? 1 : difficulty === 'MEDIUM' ? 2 : 3}
                                     onChange={(e) => {
                                         const v = parseInt(e.target.value);
                                         setDifficulty(v === 1 ? 'EASY' : v === 2 ? 'MEDIUM' : 'HARD');
                                     }}
                                     className="w-full accent-yellow-400 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                 />
                             </div>

                             <button 
                                onClick={startGame}
                                className="w-full py-4 rounded-full bg-gradient-to-b from-[#2ecc71] to-[#27ae60] text-white font-titan text-2xl shadow-[0_6px_0_#1e8449] active:top-[6px] active:shadow-none relative transition-all"
                             >
                                 PLAY NOW
                             </button>
                         </div>
                    </div>
                )}

                {gameOver && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30">
                         <div className="bg-[#fff9e6] border-[6px] border-white rounded-[30px] p-8 flex flex-col items-center shadow-2xl max-w-[80%]">
                             <div className="text-6xl mb-2">💀</div>
                             <div className="font-titan text-4xl text-[#ff7675] stroke-text-white mb-4 leading-none text-center">GAME<br/>OVER</div>
                             
                             <div className="bg-white rounded-xl border-2 border-slate-200 p-4 w-full mb-6 text-center">
                                 <div className="text-xs font-bold text-slate-400 mb-1">FINAL SCORE</div>
                                 <div className="font-titan text-5xl text-slate-800">{score}</div>
                             </div>

                             <Button3D 
                                label="TRY AGAIN" 
                                onClick={restartGame} 
                                variant="blue" 
                             />
                         </div>
                    </div>
                )}

            </div>
        </div>
        
        <div className="mt-2 text-[10px] font-bold text-slate-500 opacity-60">
             ARROWS to Move • UP to Rotate • SPACE to Drop
        </div>

      </div>
    </Layout>
  );
};

export default SandFall;
