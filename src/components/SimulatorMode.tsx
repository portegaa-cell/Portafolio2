import React, { useState } from 'react';
import { SportsCar, QuadraticCoefficients } from '../types/telemetry';
import { SPORTS_CARS } from '../data/cars';
import { analyzeQuadratic } from '../utils/mathQuadratic';
import { ParabolaCanvas } from './ParabolaCanvas';
import { TelemetryGauges } from './TelemetryGauges';
import { Sliders, Sparkles, BookOpen, Car, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface SimulatorModeProps {
  selectedCar: SportsCar;
  onSelectCar: (car: SportsCar) => void;
  lang: 'es' | 'en';
}

export const SimulatorMode: React.FC<SimulatorModeProps> = ({
  selectedCar,
  onSelectCar,
  lang,
}) => {
  const [coefficients, setCoefficients] = useState<QuadraticCoefficients>({
    a: 1,
    b: -4,
    c: 3,
  });

  const [activeConceptTab, setActiveConceptTab] = useState<'a' | 'b' | 'c'>('a');

  const analysis = analyzeQuadratic(coefficients);

  // Quick presets representing authentic racing conditions
  const presets = [
    {
      name: lang === 'es' ? 'Ferrari 488: Curva Parabolica' : 'Ferrari 488: Parabolica Arc',
      carId: 'ferrari_488',
      coefs: { a: 1, b: -6, c: 5 },
      desc: lang === 'es' ? 'Frenada con dos cruces de pista reales (x=1, x=5).' : 'Braking curve with two real track exits (x=1, x=5).',
    },
    {
      name: lang === 'es' ? 'Porsche GT3: Ápice Tangente' : 'Porsche GT3: Apex Tangent',
      carId: 'porsche_gt3',
      coefs: { a: 1, b: -6, c: 9 },
      desc: lang === 'es' ? 'Toque tangencial perfecto en el vértice (x=3, Δ=0).' : 'Single apex touch at vertex (x=3, Δ=0).',
    },
    {
      name: lang === 'es' ? 'Lamborghini: Salto Aerodinámico' : 'Lamborghini: Aero Slingshot',
      carId: 'lambo_revuelto',
      coefs: { a: -1, b: 8, c: -12 },
      desc: lang === 'es' ? 'Parábola invertida con concavidad hacia abajo (a < 0).' : 'Inverted trajectory with downward concavity (a < 0).',
    },
    {
      name: lang === 'es' ? 'BMW M4: Margen Seguro' : 'BMW M4: Safe Margin',
      carId: 'bmw_m4',
      coefs: { a: 1, b: -2, c: 5 },
      desc: lang === 'es' ? 'Trayectoria sin cruzar el asfalto (Δ < 0, sin raíces reales).' : 'Trajectory clears track without contact (Δ < 0).',
    },
    {
      name: lang === 'es' ? 'Nissan GT-R: Evasión Suzuka' : 'Nissan GT-R: Suzuka Evasion',
      carId: 'nissan_gtr',
      coefs: { a: 1, b: -4, c: -12 },
      desc: lang === 'es' ? 'Desvío de obstáculos amplio con raíces en -2 y 6.' : 'Wide obstacle evasion with roots at -2 and 6.',
    },
  ];

  const handleUpdateA = (val: number) => {
    // Prevent a = 0 for quadratic equation definition
    const safeA = val === 0 ? 0.5 : val;
    setCoefficients((prev) => ({ ...prev, a: safeA }));
    sounds.playRatchet();
  };

  const handleUpdateB = (val: number) => {
    setCoefficients((prev) => ({ ...prev, b: val }));
    sounds.playRatchet();
  };

  const handleUpdateC = (val: number) => {
    setCoefficients((prev) => ({ ...prev, c: val }));
    sounds.playRatchet();
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setCoefficients(preset.coefs);
    const carMatch = SPORTS_CARS.find((c) => c.id === preset.carId);
    if (carMatch) {
      onSelectCar(carMatch);
    }
    sounds.playEngineRev();
  };

  return (
    <div className="space-y-4">
      {/* Real-time Telemetry Dashboard Gauges */}
      <TelemetryGauges analysis={analysis} car={selectedCar} lang={lang} />

      {/* Main Two-Zone Sandbox Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Zone: Interactive Stage (Dynamic Canvas) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="h-[460px] w-full">
            <ParabolaCanvas
              coefficients={coefficients}
              car={selectedCar}
              lang={lang}
              highlightRoots={true}
              highlightVertex={true}
              interactive={true}
            />
          </div>

          {/* Quick Racing Trajectory Presets */}
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'es' ? 'CONFIGURACIONES DE PISTA PREESTABLECIDAS' : 'PRESET TRACK TELEMETRY CONFIGS'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {lang === 'es' ? 'Carga rápida de telemetría' : 'One-click scenario load'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(p)}
                  className="text-left p-2.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800/60 hover:border-slate-700 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      a={p.coefs.a}, b={p.coefs.b}, c={p.coefs.c}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {p.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Zone: Telemetry Control Deck */}
        <div className="lg:col-span-4 space-y-3">
          {/* Sports Car Selection Strip */}
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === 'es' ? 'VEHÍCULO EN PISTA' : 'ACTIVE SPORTS CAR'}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {SPORTS_CARS.length} {lang === 'es' ? 'modelos icónicos' : 'supercars'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {SPORTS_CARS.map((c) => {
                const isSelected = c.id === selectedCar.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCar(c);
                      sounds.playRatchet();
                    }}
                    className={`text-left px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200 shadow-sm'
                        : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-semibold truncate">{c.name}</div>
                      <div className="text-[10px] text-slate-500">{c.horsepower} HP</div>
                    </div>
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0 ml-1.5"
                      style={{ backgroundColor: c.signatureColor }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coefficient Sliders Deck */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === 'es' ? 'CALIBRACIÓN DE PARÁMETROS' : 'TELEMETRY CALIBRATION'}</span>
              </span>
              <button
                onClick={() => {
                  setCoefficients({ a: 1, b: -4, c: 3 });
                  sounds.playBlip(500);
                }}
                className="text-[10px] font-mono text-slate-400 hover:text-cyan-300 underline"
              >
                {lang === 'es' ? 'Restablecer' : 'Reset'}
              </button>
            </div>

            {/* Slider A */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-cyan-400">a</span>
                  <span className="text-slate-400">
                    ({lang === 'es' ? 'Curvatura / Carga Aero' : 'Curvature / Downforce'})
                  </span>
                </div>
                <span className="font-bold text-slate-100 tabular-nums bg-slate-800/80 px-2 py-0.5 rounded">
                  {coefficients.a}
                </span>
              </div>
              <input
                type="range"
                min="-3"
                max="3"
                step="0.5"
                value={coefficients.a}
                onChange={(e) => handleUpdateA(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>{lang === 'es' ? '-3 (Invertida ∩)' : '-3 (Inverted ∩)'}</span>
                <span>{lang === 'es' ? 'a ≠ 0' : 'a ≠ 0'}</span>
                <span>{lang === 'es' ? '+3 (Cóncava ∪)' : '+3 (Concave ∪)'}</span>
              </div>
            </div>

            {/* Slider B */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-amber-400">b</span>
                  <span className="text-slate-400">
                    ({lang === 'es' ? 'Desvío Lateral / Dirección' : 'Lateral Steering Angle'})
                  </span>
                </div>
                <span className="font-bold text-slate-100 tabular-nums bg-slate-800/80 px-2 py-0.5 rounded">
                  {coefficients.b}
                </span>
              </div>
              <input
                type="range"
                min="-10"
                max="10"
                step="1"
                value={coefficients.b}
                onChange={(e) => handleUpdateB(parseFloat(e.target.value))}
                className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-10 ({lang === 'es' ? 'Desvío Derecha' : 'Right Shift'})</span>
                <span>0 ({lang === 'es' ? 'Centrado' : 'Centered'})</span>
                <span>+10 ({lang === 'es' ? 'Desvío Izquierda' : 'Left Shift'})</span>
              </div>
            </div>

            {/* Slider C */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-purple-400">c</span>
                  <span className="text-slate-400">
                    ({lang === 'es' ? 'Elevación Inicial / Compuerta' : 'Starting Elevation'})
                  </span>
                </div>
                <span className="font-bold text-slate-100 tabular-nums bg-slate-800/80 px-2 py-0.5 rounded">
                  {coefficients.c}
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={coefficients.c}
                onChange={(e) => handleUpdateC(parseFloat(e.target.value))}
                className="w-full accent-purple-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-12 ({lang === 'es' ? 'Bajo asfalto' : 'Sub-surface'})</span>
                <span>0 ({lang === 'es' ? 'En el origen' : 'At origin'})</span>
                <span>+12 ({lang === 'es' ? 'Elevado' : 'Elevated'})</span>
              </div>
            </div>
          </div>

          {/* Interactive Pedagogical Insights */}
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === 'es' ? 'DIAGNÓSTICO DEL AGENTE MATEMÁTICO' : 'MATHEMATICAL TUTOR INSIGHT'}</span>
              </span>
            </div>

            {/* Segmented controls for learning tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveConceptTab('a')}
                className={`flex-1 py-1 text-xs font-mono font-medium rounded transition-colors ${
                  activeConceptTab === 'a'
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'es' ? 'Efecto de a' : 'Effect of a'}
              </button>
              <button
                onClick={() => setActiveConceptTab('b')}
                className={`flex-1 py-1 text-xs font-mono font-medium rounded transition-colors ${
                  activeConceptTab === 'b'
                    ? 'bg-slate-800 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'es' ? 'Efecto de b' : 'Effect of b'}
              </button>
              <button
                onClick={() => setActiveConceptTab('c')}
                className={`flex-1 py-1 text-xs font-mono font-medium rounded transition-colors ${
                  activeConceptTab === 'c'
                    ? 'bg-slate-800 text-purple-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'es' ? 'Efecto de c' : 'Effect of c'}
              </button>
            </div>

            {/* Dynamic content per tab */}
            <div className="text-xs text-slate-300 leading-relaxed font-sans p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
              {activeConceptTab === 'a' && (
                <div>
                  <p className="font-semibold text-cyan-400 mb-1">
                    {coefficients.a > 0
                      ? lang === 'es'
                        ? 'Carga Aerodinámica Positiva (∪)'
                        : 'Positive Downforce Arc (∪)'
                      : lang === 'es'
                      ? 'Trayectoria de Salto Invertida (∩)'
                      : 'Inverted Jump Trajectory (∩)'}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {lang === 'es'
                      ? `El valor actual de a = ${coefficients.a} controla la apertura de la curva. Si |a| es grande, la parábola es muy estrecha (curva cerrada). Si a > 0, el vértice es un punto mínimo; si a < 0, es un punto máximo.`
                      : `The current value a = ${coefficients.a} governs the curvature width. As |a| increases, the curve steepens. a > 0 creates a minimum vertex; a < 0 creates a maximum apex.`}
                  </p>
                </div>
              )}

              {activeConceptTab === 'b' && (
                <div>
                  <p className="font-semibold text-amber-400 mb-1">
                    {lang === 'es' ? `Desplazamiento del Vértice: x = ${analysis.vertexX}` : `Vertex Lateral Shift: x = ${analysis.vertexX}`}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {lang === 'es'
                      ? `El coeficiente b = ${coefficients.b} desplaza el eje de simetría según la fórmula x = -b / (2a) = -(${coefficients.b}) / (2·${coefficients.a}) = ${analysis.vertexX}. Modificar b sin alterar a o c cambia el ángulo de entrada al viraje.`
                      : `Coefficient b = ${coefficients.b} shifts the symmetry axis via x = -b / (2a) = -(${coefficients.b}) / (2·${coefficients.a}) = ${analysis.vertexX}. Tweaking b alters steering apex entry timing.`}
                  </p>
                </div>
              )}

              {activeConceptTab === 'c' && (
                <div>
                  <p className="font-semibold text-purple-400 mb-1">
                    {lang === 'es' ? `Corte con el Eje Y: (0, ${coefficients.c})` : `Y-Intercept Clearance: (0, ${coefficients.c})`}
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {lang === 'es'
                      ? `El término c = ${coefficients.c} traslada verticalmente toda la trayectoria sin alterar su forma ni su eje de simetría. Al elevar c, la curva sube y puede hacer que Δ pase de positivo a negativo (despegue de pista).`
                      : `Constant c = ${coefficients.c} translates the whole trajectory vertically without altering shape. Increasing c lifts the parabola, potentially shifting Δ from positive to negative.`}
                  </p>
                </div>
              )}
            </div>

            {/* Formula display */}
            <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="text-slate-500">Fórmula General:</span>
              <span className="text-slate-200 font-semibold">x = (-b ± √Δ) / 2a</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
