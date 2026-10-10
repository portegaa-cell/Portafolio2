import React, { useRef, useEffect, useState, useCallback } from 'react';
import { QuadraticCoefficients, SportsCar } from '../types/telemetry';
import { analyzeQuadratic, evaluateQuadratic, evaluateDerivative } from '../utils/mathQuadratic';
import { Play, Pause, RotateCcw, ZoomIn, ZoomOut, Compass } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface ParabolaCanvasProps {
  coefficients: QuadraticCoefficients;
  car: SportsCar;
  lang: 'es' | 'en';
  highlightRoots?: boolean;
  highlightVertex?: boolean;
  interactive?: boolean;
  onPointHover?: (point: { x: number; y: number } | null) => void;
}

export const ParabolaCanvas: React.FC<ParabolaCanvasProps> = ({
  coefficients,
  car,
  lang,
  highlightRoots = true,
  highlightVertex = true,
  interactive = true,
  onPointHover,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Viewport bounds in math space
  const [scale, setScale] = useState<number>(32); // pixels per unit
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); // offset in pixels from center

  // Car animation along curve
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [carXProgress, setCarXProgress] = useState<number>(-5); // x position of car
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; slope: number } | null>(null);

  const animFrameRef = useRef<number | null>(null);
  const analysis = analyzeQuadratic(coefficients);

  // Auto-center on vertex whenever coefficients change
  useEffect(() => {
    // Center camera roughly on vertex
    const targetVx = isFinite(analysis.vertexX) ? analysis.vertexX : 0;
    const targetVy = isFinite(analysis.vertexY) ? analysis.vertexY : 0;
    setOffset({
      x: -targetVx * scale,
      y: targetVy * scale * 0.4,
    });
    setCarXProgress(targetVx - 6);
  }, [coefficients.a, coefficients.b, coefficients.c, scale]);

  // Car animation loop
  useEffect(() => {
    if (!isDriving) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let lastTime = performance.now();
    const driveSpeed = 4.2; // units per second

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setCarXProgress((prev) => {
        let nextX = prev + driveSpeed * delta;
        const rightBound = analysis.vertexX + 8;
        if (nextX > rightBound) {
          nextX = analysis.vertexX - 8;
        }
        return nextX;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isDriving, analysis.vertexX]);

  // Drawing routine
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Math origin in canvas pixel coordinates
    const originX = width / 2 + offset.x;
    const originY = height / 2 + offset.y;

    // Coordinate conversion functions
    const toScreenX = (x: number) => originX + x * scale;
    const toScreenY = (y: number) => originY - y * scale;
    const toMathX = (px: number) => (px - originX) / scale;
    const toMathY = (py: number) => (originY - py) / scale;

    const minMathX = toMathX(0);
    const maxMathX = toMathX(width);
    const minMathY = toMathY(height);
    const maxMathY = toMathY(0);

    // 1. Draw Asphalt background & subtle track grid
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1 * dpr;

    // Grid spacing based on scale
    let step = 1;
    if (scale < 15) step = 5;
    else if (scale < 28) step = 2;
    else if (scale > 70) step = 0.5;

    // Vertical grid lines
    const startX = Math.floor(minMathX / step) * step;
    const endX = Math.ceil(maxMathX / step) * step;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = `${10 * dpr}px 'JetBrains Mono', monospace`;

    for (let x = startX; x <= endX; x += step) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, height);
      ctx.strokeStyle = Math.abs(x) < 0.001 ? '#38bdf8' : '#172554';
      ctx.lineWidth = Math.abs(x) < 0.001 ? 1.5 * dpr : 0.8 * dpr;
      ctx.stroke();

      if (Math.abs(x) > 0.001 && sx > 20 && sx < width - 20) {
        ctx.fillStyle = '#64748b';
        ctx.fillText(Number(x.toFixed(1)).toString(), sx, Math.min(Math.max(toScreenY(0) + 4 * dpr, 10 * dpr), height - 20 * dpr));
      }
    }

    // Horizontal grid lines
    const startY = Math.floor(minMathY / step) * step;
    const endY = Math.ceil(maxMathY / step) * step;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let y = startY; y <= endY; y += step) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(0, sy);
      ctx.lineTo(width, sy);
      ctx.strokeStyle = Math.abs(y) < 0.001 ? '#38bdf8' : '#172554';
      ctx.lineWidth = Math.abs(y) < 0.001 ? 1.5 * dpr : 0.8 * dpr;
      ctx.stroke();

      if (Math.abs(y) > 0.001 && sy > 20 && sy < height - 20) {
        ctx.fillStyle = '#64748b';
        ctx.fillText(Number(y.toFixed(1)).toString(), Math.min(Math.max(toScreenX(0) - 6 * dpr, 25 * dpr), width - 10 * dpr), sy);
      }
    }

    // 2. Track curb markings on X-axis (y = 0)
    const curbY = toScreenY(0);
    const curbWidth = 12 * dpr;
    const curbHeight = 4 * dpr;
    for (let x = startX; x <= endX; x += 0.5) {
      const sx = toScreenX(x);
      const isRed = Math.floor(x * 2) % 2 === 0;
      ctx.fillStyle = isRed ? '#ef4444' : '#f8fafc';
      ctx.fillRect(sx - curbWidth / 2, curbY - curbHeight / 2, curbWidth, curbHeight);
    }

    // Main X and Y axis glowing lines
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(0, toScreenY(0));
    ctx.lineTo(width, toScreenY(0));
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(toScreenX(0), 0);
    ctx.lineTo(toScreenX(0), height);
    ctx.stroke();

    // 3. Axis of Symmetry (vertical dashed line x = -b/(2a))
    const symX = analysis.axisOfSymmetry;
    const screenSymX = toScreenX(symX);
    ctx.save();
    ctx.setLineDash([6 * dpr, 6 * dpr]);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.moveTo(screenSymX, 0);
    ctx.lineTo(screenSymX, height);
    ctx.stroke();
    ctx.restore();

    // Symmetry label
    ctx.fillStyle = '#f59e0b';
    ctx.font = `${10 * dpr}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(`x = ${symX} (${lang === 'es' ? 'Eje' : 'Axis'})`, screenSymX + 6 * dpr, 24 * dpr);

    // 4. Draw Parabola Curve f(x) = ax^2 + bx + c
    ctx.save();
    ctx.shadowColor = car.signatureColor;
    ctx.shadowBlur = 12 * dpr;
    ctx.strokeStyle = car.signatureColor;
    ctx.lineWidth = 3.5 * dpr;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const pixelStep = 2; // draw every 2 canvas pixels for crisp smooth curve
    let started = false;

    for (let px = 0; px <= width; px += pixelStep) {
      const mx = toMathX(px);
      const my = evaluateQuadratic(coefficients, mx);
      const py = toScreenY(my);

      // Clamp excessively large points
      if (py > -1000 && py < height + 1000) {
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      } else {
        started = false;
      }
    }
    ctx.stroke();
    ctx.restore();

    // 5. Draw Y-Intercept point (0, c)
    const yIntX = toScreenX(0);
    const yIntY = toScreenY(analysis.yIntercept);
    ctx.fillStyle = '#a855f7';
    ctx.beginPath();
    ctx.arc(yIntX, yIntY, 5 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5 * dpr;
    ctx.stroke();

    ctx.fillStyle = '#c084fc';
    ctx.font = `${10 * dpr}px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(`(0, ${analysis.yIntercept})`, yIntX + 8 * dpr, yIntY - 8 * dpr);

    // 6. Draw Vertex V(vx, vy)
    if (highlightVertex && isFinite(analysis.vertexX) && isFinite(analysis.vertexY)) {
      const vx = toScreenX(analysis.vertexX);
      const vy = toScreenY(analysis.vertexY);

      // Vertex outer beacon ring
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();
      ctx.arc(vx, vy, 8 * dpr, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(vx, vy, 4 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // Vertex label
      ctx.fillStyle = '#fbbf24';
      ctx.font = `bold ${11 * dpr}px 'JetBrains Mono', monospace`;
      const vertexLabel = `V(${analysis.vertexX}, ${analysis.vertexY})`;
      const vOffsetY = coefficients.a > 0 ? 18 * dpr : -12 * dpr;
      ctx.fillText(vertexLabel, vx + 8 * dpr, vy + vOffsetY);
    }

    // 7. Draw Real Roots (x1, 0) and (x2, 0)
    if (highlightRoots && analysis.roots.length > 0) {
      analysis.roots.forEach((rootVal, idx) => {
        const rx = toScreenX(rootVal);
        const ry = toScreenY(0);

        // Neon root beacon
        ctx.save();
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 10 * dpr;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(rx, ry, 6 * dpr, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
        ctx.restore();

        // Flag beacon tag
        ctx.fillStyle = '#34d399';
        ctx.font = `bold ${11 * dpr}px 'JetBrains Mono', monospace`;
        ctx.textAlign = 'center';
        const rootLabel = `x${idx + 1} = ${rootVal}`;
        ctx.fillText(rootLabel, rx, ry + 18 * dpr);
      });
    }

    // 8. Animated Sports Car on Trajectory
    const carMathX = carXProgress;
    const carMathY = evaluateQuadratic(coefficients, carMathX);
    const carScreenX = toScreenX(carMathX);
    const carScreenY = toScreenY(carMathY);

    if (carScreenX >= -40 && carScreenX <= width + 40 && carScreenY >= -40 && carScreenY <= height + 40) {
      // Calculate tangent slope angle theta: tan(theta) = dy/dx = 2ax + b
      // Note that in screen space, Y is inverted, so screen dy/dx is -scale * (2ax + b) / scale
      const mathSlope = evaluateDerivative(coefficients, carMathX);
      const angle = -Math.atan(mathSlope); // screen rotation

      ctx.save();
      ctx.translate(carScreenX, carScreenY);
      ctx.rotate(angle);

      // Exhaust glow trail
      const exhaustGrad = ctx.createLinearGradient(-30 * dpr, 0, -10 * dpr, 0);
      exhaustGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      exhaustGrad.addColorStop(1, 'rgba(239, 68, 68, 0.8)');
      ctx.fillStyle = exhaustGrad;
      ctx.fillRect(-35 * dpr, -3 * dpr, 25 * dpr, 6 * dpr);

      // Car body silhouette (aerodynamic sleek GT profile)
      ctx.fillStyle = car.signatureColor;
      ctx.beginPath();
      // Nose
      ctx.moveTo(18 * dpr, 0);
      // Front fender
      ctx.lineTo(12 * dpr, -6 * dpr);
      // Windshield & Roof
      ctx.lineTo(2 * dpr, -7 * dpr);
      ctx.lineTo(-6 * dpr, -7 * dpr);
      // Rear wing
      ctx.lineTo(-14 * dpr, -9 * dpr);
      ctx.lineTo(-17 * dpr, -5 * dpr);
      ctx.lineTo(-18 * dpr, 0);
      // Lower body (mirrored)
      ctx.lineTo(-17 * dpr, 5 * dpr);
      ctx.lineTo(-14 * dpr, 9 * dpr);
      ctx.lineTo(-6 * dpr, 7 * dpr);
      ctx.lineTo(2 * dpr, 7 * dpr);
      ctx.lineTo(12 * dpr, 6 * dpr);
      ctx.closePath();
      ctx.fill();

      // Cockpit windshield
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(6 * dpr, -4 * dpr);
      ctx.lineTo(-4 * dpr, -4 * dpr);
      ctx.lineTo(-4 * dpr, 4 * dpr);
      ctx.lineTo(6 * dpr, 4 * dpr);
      ctx.closePath();
      ctx.fill();

      // Headlight beams
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(16 * dpr, -4 * dpr, 1.8 * dpr, 0, Math.PI * 2);
      ctx.arc(16 * dpr, 4 * dpr, 1.8 * dpr, 0, Math.PI * 2);
      ctx.fill();

      // Taillights
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-17 * dpr, -5 * dpr, 2 * dpr, 10 * dpr);

      ctx.restore();
    }

    // 9. Hovered point overlay if mouse is active
    if (hoveredPoint) {
      const hx = toScreenX(hoveredPoint.x);
      const hy = toScreenY(hoveredPoint.y);

      // Marker crosshair
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.2 * dpr;
      ctx.beginPath();
      ctx.arc(hx, hy, 5 * dpr, 0, Math.PI * 2);
      ctx.stroke();

      // Tooltip box
      const boxW = 140 * dpr;
      const boxH = 48 * dpr;
      const boxX = Math.min(Math.max(hx + 12 * dpr, 10 * dpr), width - boxW - 10 * dpr);
      const boxY = Math.min(Math.max(hy - 54 * dpr, 10 * dpr), height - boxH - 10 * dpr);

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 4 * dpr);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = `bold ${10 * dpr}px 'JetBrains Mono', monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(`x: ${hoveredPoint.x.toFixed(2)}`, boxX + 8 * dpr, boxY + 16 * dpr);
      ctx.fillText(`y = f(x): ${hoveredPoint.y.toFixed(2)}`, boxX + 8 * dpr, boxY + 30 * dpr);
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${9 * dpr}px 'JetBrains Mono', monospace`;
      ctx.fillText(`f'(x) = ${hoveredPoint.slope.toFixed(2)}`, boxX + 8 * dpr, boxY + 42 * dpr);
    }

    ctx.restore();
  }, [
    scale,
    offset,
    coefficients,
    car,
    lang,
    highlightRoots,
    highlightVertex,
    carXProgress,
    analysis,
    hoveredPoint,
  ]);

  // Sync canvas size to container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      draw();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse handlers for scrubbing, hover, pan
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mousePx = e.clientX - rect.left;
    const mousePy = e.clientY - rect.top;

    if (isDraggingRef.current) {
      setOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
      return;
    }

    if (interactive) {
      const originX = rect.width / 2 + offset.x;
      const originY = rect.height / 2 + offset.y;
      const mathX = (mousePx - originX) / scale;
      const mathY = evaluateQuadratic(coefficients, mathX);
      const slope = evaluateDerivative(coefficients, mathX);

      const point = { x: mathX, y: mathY, slope };
      setHoveredPoint(point);
      if (onPointHover) onPointHover(point);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
    setHoveredPoint(null);
    if (onPointHover) onPointHover(null);
  };

  const handleResetCamera = () => {
    sounds.playBlip(700);
    const targetVx = isFinite(analysis.vertexX) ? analysis.vertexX : 0;
    const targetVy = isFinite(analysis.vertexY) ? analysis.vertexY : 0;
    setScale(32);
    setOffset({
      x: -targetVx * 32,
      y: targetVy * 32 * 0.4,
    });
  };

  const toggleDriving = () => {
    if (!isDriving) {
      sounds.playEngineRev();
    } else {
      sounds.playBlip(440);
    }
    setIsDriving(!isDriving);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[360px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col"
    >
      {/* Top Floating Telemetry Overlay Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 pointer-events-auto">
          <span className="text-cyan-400 font-bold">{car.name}</span>
          <span className="text-slate-600">·</span>
          <span>{analysis.equationStr}</span>
        </div>

        {/* Camera and Sim Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/85 backdrop-blur-md p-1 rounded-lg border border-slate-800">
          <button
            onClick={toggleDriving}
            title={isDriving ? 'Pause Simulation' : 'Launch Simulation'}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
              isDriving
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
            }`}
          >
            {isDriving ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isDriving ? (lang === 'es' ? 'Pausar' : 'Pause') : (lang === 'es' ? 'Test Drive' : 'Test Drive')}</span>
          </button>

          <button
            onClick={() => {
              setScale((s) => Math.min(s * 1.25, 90));
              sounds.playBlip(600);
            }}
            title="Zoom In"
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setScale((s) => Math.max(s * 0.8, 12));
              sounds.playBlip(500);
            }}
            title="Zoom Out"
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleResetCamera}
            title="Center Camera"
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full cursor-crosshair select-none block"
      />

      {/* Bottom Floating Legend / Indicator */}
      <div className="absolute bottom-2.5 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none text-[11px] font-mono">
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-800/80 text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50" />
            <span>{lang === 'es' ? 'Raíces (x₁, x₂)' : 'Roots (x₁, x₂)'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm shadow-amber-400/50" />
            <span>{lang === 'es' ? 'Vértice Ápice' : 'Vertex Apex'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block shadow-sm shadow-purple-400/50" />
            <span>{lang === 'es' ? 'Intersección Y' : 'Y-Intercept'}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded border border-slate-800/80 text-slate-400 flex items-center gap-1.5">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>{lang === 'es' ? 'Arrastra para mover la cámara' : 'Drag to pan camera'}</span>
        </div>
      </div>
    </div>
  );
};
