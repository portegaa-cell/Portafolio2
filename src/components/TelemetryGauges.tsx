import React from 'react';
import { SportsCar, QuadraticAnalysis } from '../types/telemetry';
import { Gauge, Zap, Crosshair, ArrowUpDown } from 'lucide-react';

interface TelemetryGaugesProps {
  analysis: QuadraticAnalysis;
  car: SportsCar;
  lang: 'es' | 'en';
}

export const TelemetryGauges: React.FC<TelemetryGaugesProps> = ({ analysis, car, lang }) => {
  const { a, b, c, discriminant, vertexX, vertexY, roots, rootType } = analysis;

  // Discriminant gauge angle (map delta from -36 to +64 to -90deg to +90deg)
  const clampedDelta = Math.max(-36, Math.min(64, discriminant));
  const gaugeAngle = ((clampedDelta + 36) / 100) * 180 - 90;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* 1. Discriminant Speedometer Dial */}
      <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold text-slate-200">
              {lang === 'es' ? 'DISCRIMINANTE Δ' : 'DISCRIMINANT Δ'}
            </span>
          </span>
          <span className="text-[11px] text-slate-500">b² - 4ac</span>
        </div>

        <div className="flex items-center justify-between gap-3 my-1">
          {/* Circular dial gauge indicator */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  discriminant > 0
                    ? 'text-emerald-500'
                    : discriminant === 0
                    ? 'text-amber-500'
                    : 'text-indigo-400'
                }
                strokeDasharray="100, 100"
                strokeDashoffset={Math.max(0, 100 - ((clampedDelta + 36) / 100) * 100)}
                strokeLinecap="round"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div
              className="absolute w-0.5 h-6 bg-cyan-300 origin-bottom transition-transform duration-300 rounded"
              style={{
                bottom: '50%',
                transform: `rotate(${gaugeAngle}deg)`,
              }}
            />
            <div className="absolute w-2 h-2 rounded-full bg-cyan-400" />
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight tabular-nums">
              {discriminant}
            </div>
            <div
              className={`text-[11px] font-mono font-medium tracking-tight ${
                discriminant > 0
                  ? 'text-emerald-400'
                  : discriminant === 0
                  ? 'text-amber-400'
                  : 'text-indigo-300'
              }`}
            >
              {discriminant > 0
                ? lang === 'es'
                  ? '2 Raíces Reales'
                  : '2 Real Roots'
                : discriminant === 0
                ? lang === 'es'
                  ? '1 Raíz Doble'
                  : '1 Double Root'
                : lang === 'es'
                ? '0 Raíces Reales'
                : 'No Real Roots'}
            </div>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 truncate">
          <span>{`(${b})² - 4·(${a})·(${c}) = ${b * b} - ${4 * a * c} = ${discriminant}`}</span>
        </div>
      </div>

      {/* 2. Vertex Apex Coordinates */}
      <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
          <span className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200">
              {lang === 'es' ? 'ÁPICE / VÉRTICE' : 'APEX VERTEX'}
            </span>
          </span>
          <span className="text-[11px] text-slate-500">-b / (2a)</span>
        </div>

        <div className="my-1">
          <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
            V({vertexX}, {vertexY})
          </div>
          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            {lang === 'es' ? 'Eje de simetría' : 'Axis of symmetry'}: <span className="text-slate-200 font-semibold">x = {vertexX}</span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
          <span>{a > 0 ? (lang === 'es' ? 'Punto Mínimo' : 'Minimum Point') : (lang === 'es' ? 'Punto Máximo' : 'Maximum Point')}</span>
          <span className="text-slate-500">{lang === 'es' ? 'Corte Y' : 'Y-Int'}: (0, {c})</span>
        </div>
      </div>

      {/* 3. Trajectory Roots (x1, x2) */}
      <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-200">
              {lang === 'es' ? 'RAÍCES DE PISTA' : 'TRACK ROOTS'}
            </span>
          </span>
          <span className="text-[11px] text-slate-500">f(x) = 0</span>
        </div>

        <div className="my-1">
          {rootType === 'two_real' && roots.length === 2 ? (
            <div className="flex items-baseline gap-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400">x₁ = </span>
                <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">{roots[0]}</span>
              </div>
              <span className="text-slate-600">·</span>
              <div>
                <span className="text-[10px] font-mono text-slate-400">x₂ = </span>
                <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">{roots[1]}</span>
              </div>
            </div>
          ) : rootType === 'one_real' && roots.length === 1 ? (
            <div>
              <span className="text-[10px] font-mono text-slate-400">x = </span>
              <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">{roots[0]}</span>
              <span className="text-xs text-slate-400 ml-2">({lang === 'es' ? 'tangente' : 'tangent'})</span>
            </div>
          ) : (
            <div className="text-base font-mono text-indigo-300 font-semibold py-1">
              {lang === 'es' ? 'Sin corte en el asfalto' : 'Clears track limits'}
            </div>
          )}

          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
            {rootType === 'two_real'
              ? `${lang === 'es' ? 'Amplitud de cruce' : 'Spread'}: ${Math.abs(roots[1] - roots[0]).toFixed(2)} m`
              : rootType === 'one_real'
              ? lang === 'es'
                ? 'Contacto tangencial en 1 punto'
                : '1-point tangential contact'
              : lang === 'es'
              ? 'Δ < 0, √Δ no es real'
              : 'Δ < 0, √Δ is not real'}
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 truncate">
          <span>{analysis.factoredFormStr || analysis.vertexFormStr}</span>
        </div>
      </div>

      {/* 4. Telemetry Vehicle Specs & Concavity */}
      <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
          <span className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5" style={{ color: car.signatureColor }} />
            <span className="font-semibold text-slate-200">
              {lang === 'es' ? 'AERODINÁMICA' : 'AERODYNAMICS'}
            </span>
          </span>
          <span
            className="text-[11px] font-bold font-mono px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${car.signatureColor}20`, color: car.signatureColor }}
          >
            {car.manufacturer}
          </span>
        </div>

        <div className="my-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">{lang === 'es' ? 'Concavidad' : 'Concavity'}:</span>
            <span className={`font-semibold ${a > 0 ? 'text-cyan-400' : 'text-rose-400'}`}>
              {a > 0 ? (lang === 'es' ? 'Hacia arriba (∪)' : 'Upward (∪)') : (lang === 'es' ? 'Hacia abajo (∩)' : 'Downward (∩)')}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono mt-1">
            <span className="text-slate-400">{lang === 'es' ? 'Potencia' : 'Power'}:</span>
            <span className="text-slate-200 font-bold tabular-nums">{car.horsepower} HP</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono mt-1">
            <span className="text-slate-400">0-100 km/h:</span>
            <span className="text-slate-200 font-bold tabular-nums">{car.acceleration0to100}s</span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 truncate">
          <span>{car.tagline}</span>
        </div>
      </div>
    </div>
  );
};
