import React, { useState, useEffect, useRef } from 'react';
import { SportsCar } from '../types/telemetry';
import { Timer, Zap, Trophy, RotateCcw, Check, X, Flame } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface TimeAttackModeProps {
  car: SportsCar;
  lang: 'es' | 'en';
}

interface QuickDrill {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const TimeAttackMode: React.FC<TimeAttackModeProps> = ({ car, lang }) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [multiplier, setMultiplier] = useState<number>(1);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState<boolean | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const drills: QuickDrill[] = [
    {
      prompt: lang === 'es' ? 'Para x² - 6x + 5 = 0, ¿cuál es el valor de b?' : 'For x² - 6x + 5 = 0, what is b?',
      options: ['-6', '6', '5', '1'],
      correctIndex: 0,
      explanation: lang === 'es' ? 'El coeficiente b acompaña a x, por lo que b = -6.' : 'Coefficient b is with x, so b = -6.',
    },
    {
      prompt: lang === 'es' ? 'Calcula Δ para x² - 4x + 4 = 0 (b² - 4ac):' : 'Calculate Δ for x² - 4x + 4 = 0:',
      options: ['0', '16', '-16', '8'],
      correctIndex: 0,
      explanation: 'Δ = (-4)² - 4(1)(4) = 16 - 16 = 0.',
    },
    {
      prompt: lang === 'es' ? 'Si Δ = -9, ¿cuántas soluciones reales existen?' : 'If Δ = -9, how many real roots exist?',
      options: [
        lang === 'es' ? '0 soluciones reales' : '0 real roots',
        lang === 'es' ? '1 solución real' : '1 real root',
        lang === 'es' ? '2 soluciones reales' : '2 real roots',
        lang === 'es' ? 'Infinitas' : 'Infinite',
      ],
      correctIndex: 0,
      explanation: lang === 'es' ? 'Como Δ < 0, no hay raíces reales en ℝ.' : 'Since Δ < 0, no real roots in ℝ.',
    },
    {
      prompt: lang === 'es' ? 'Para y = 2x² - 8x + 3, ¿cuál es el eje de simetría x = -b/(2a)?' : 'For y = 2x² - 8x + 3, find symmetry axis x = -b/(2a):',
      options: ['x = 2', 'x = -2', 'x = 4', 'x = -4'],
      correctIndex: 0,
      explanation: 'x = -(-8) / (2·2) = 8 / 4 = 2.',
    },
    {
      prompt: lang === 'es' ? '¿Cuánto vale (-5)² en el cálculo de b²?' : 'What is (-5)² when calculating b²?',
      options: ['25', '-25', '-10', '10'],
      correctIndex: 0,
      explanation: lang === 'es' ? 'El cuadrado de cualquier número real es positivo: (-5)² = 25.' : 'Square of any real number is positive: (-5)² = 25.',
    },
    {
      prompt: lang === 'es' ? 'Para x² - 9 = 0, ¿cuáles son las raíces x₁ y x₂?' : 'For x² - 9 = 0, find roots x₁ and x₂:',
      options: ['-3 y 3', '0 y 9', '-9 y 9', '3 y 3'],
      correctIndex: 0,
      explanation: 'x² = 9 ⟹ x = ±3.',
    },
    {
      prompt: lang === 'es' ? 'En la fórmula x = (-b ± √Δ) / 2a, si b = -4, ¿cuánto es -b?' : 'In x = (-b ± √Δ) / 2a, if b = -4, what is -b?',
      options: ['+4', '-4', '16', '-16'],
      correctIndex: 0,
      explanation: '-(-4) = +4.',
    },
    {
      prompt: lang === 'es' ? 'Para f(x) = -x² + 4x - 3, la concavidad es:' : 'For f(x) = -x² + 4x - 3, concavity is:',
      options: [
        lang === 'es' ? 'Hacia abajo (a < 0)' : 'Downward (a < 0)',
        lang === 'es' ? 'Hacia arriba (a > 0)' : 'Upward (a > 0)',
        lang === 'es' ? 'Plana' : 'Flat',
        lang === 'es' ? 'Lineal' : 'Linear',
      ],
      correctIndex: 0,
      explanation: 'Como a = -1 < 0, la curva abre hacia abajo (∩).',
    },
  ];

  const currentDrill = drills[currentIndex % drills.length];

  const handleStart = () => {
    sounds.playEngineRev();
    setIsActive(true);
    setTimeLeft(60);
    setScore(0);
    setStreak(0);
    setMultiplier(1);
    setCurrentIndex(0);
    setIsGameOver(false);
    setLastAnswerCorrect(null);
  };

  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsActive(false);
          setIsGameOver(true);
          sounds.playSuccessChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const handleSelectOption = (idx: number) => {
    if (!isActive) return;

    if (idx === currentDrill.correctIndex) {
      sounds.playBlip(800);
      setLastAnswerCorrect(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      const newMult = Math.min(4, 1 + Math.floor(newStreak / 3));
      setMultiplier(newMult);
      setScore((s) => s + 100 * newMult);
    } else {
      sounds.playErrorAlert();
      setLastAnswerCorrect(false);
      setStreak(0);
      setMultiplier(1);
    }

    setCurrentIndex((i) => i + 1);
  };

  // Gear visualization based on streak
  const currentGear = Math.min(6, Math.max(1, 1 + Math.floor(streak / 2)));

  return (
    <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-4 max-w-2xl mx-auto shadow-2xl">
      {/* Time Attack Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100">
              {lang === 'es' ? 'DRAG STRIP: TIME ATTACK' : 'DRAG STRIP: TIME ATTACK'}
            </h2>
            <p className="text-[11px] font-mono text-slate-400">
              {lang === 'es'
                ? '60 segundos de reflejos y cálculo mental de telemetría'
                : '60 seconds of rapid telemetry mental drills'}
            </p>
          </div>
        </div>

        {/* Live Timer Gauge */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-sm">
          <Timer className={`w-4 h-4 ${timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-cyan-400'}`} />
          <span className={`font-bold tabular-nums ${timeLeft <= 10 ? 'text-rose-400' : 'text-slate-100'}`}>
            0:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </span>
        </div>
      </div>

      {!isActive && !isGameOver && (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400 flex items-center justify-center mx-auto shadow-lg">
            <Flame className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-bold font-mono text-slate-100">
              {lang === 'es' ? '¿Listo para el arranque en la recta?' : 'Ready for the drag strip launch?'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {lang === 'es'
                ? 'Responde la mayor cantidad de preguntas de discriminante, coeficientes y raíces en 60 segundos. ¡Cada racha de aciertos sube de marcha y multiplica tus puntos!'
                : 'Answer as many discriminant, coefficient, and root questions as you can in 60 seconds. Consecutive streaks shift gears and multiply score!'}
            </p>
          </div>

          <button
            onClick={handleStart}
            className="py-2.5 px-6 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-900/40 inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>{lang === 'es' ? 'Comenzar Time Attack' : 'Start Time Attack'}</span>
          </button>
        </div>
      )}

      {isActive && (
        <div className="space-y-4">
          {/* Telemetry HUD: Gear, Score, Streak Multiplier */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">{lang === 'es' ? 'MARCHA' : 'GEAR'}</span>
              <span className="text-lg font-bold text-amber-400 tabular-nums">
                {currentGear}ª {lang === 'es' ? 'Vel.' : 'Gear'}
              </span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">{lang === 'es' ? 'PUNTUACIÓN' : 'SCORE'}</span>
              <span className="text-lg font-bold text-cyan-400 tabular-nums">{score}</span>
            </div>

            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">{lang === 'es' ? 'RACHA' : 'STREAK'}</span>
              <span className="text-lg font-bold text-emerald-400 tabular-nums">
                {streak}x <span className="text-xs text-slate-400">({multiplier}x pts)</span>
              </span>
            </div>
          </div>

          {/* Drill Question Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
              <span>{lang === 'es' ? 'Pregunta' : 'Question'} #{currentIndex + 1}</span>
              {lastAnswerCorrect !== null && (
                <span className={`text-[11px] font-bold ${lastAnswerCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {lastAnswerCorrect ? '✓ Correcto' : '✕ Error'}
                </span>
              )}
            </div>

            <h3 className="text-sm font-mono font-bold text-slate-100 min-h-[40px] flex items-center">
              {currentDrill.prompt}
            </h3>

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {currentDrill.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className="p-3 text-left rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500 hover:bg-slate-850 text-xs font-mono text-slate-200 transition-all active:scale-[0.98]"
                >
                  <span className="text-slate-500 mr-2">{String.fromCharCode(65 + idx)}.</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isGameOver && (
        <div className="text-center py-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
            <Trophy className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold font-mono text-slate-100">
              {lang === 'es' ? '¡BANDERA A CUADROS!' : 'CHECKERED FLAG!'}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              {lang === 'es' ? 'Sesión de Time Attack finalizada.' : 'Time Attack sprint concluded.'}
            </p>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 max-w-sm mx-auto space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">{lang === 'es' ? 'Puntos Totales' : 'Total Score'}:</span>
              <span className="text-cyan-400 font-bold tabular-nums">{score} pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">{lang === 'es' ? 'Mejor Racha' : 'Max Streak'}:</span>
              <span className="text-emerald-400 font-bold tabular-nums">{streak}</span>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="py-2 px-5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-cyan-900/30 inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Intentar de Nuevo' : 'Play Again'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
