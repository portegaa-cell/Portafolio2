import React, { useState } from 'react';
import { SportsCar } from '../types/telemetry';
import { SPORTS_CARS } from '../data/cars';
import { Car, Zap, Gauge, Wind, ShieldCheck, Check } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface CarShowcaseModalProps {
  currentCar: SportsCar;
  onSelectCar: (car: SportsCar) => void;
  lang: 'es' | 'en';
  onClose: () => void;
}

export const CarShowcaseModal: React.FC<CarShowcaseModalProps> = ({
  currentCar,
  onSelectCar,
  lang,
  onClose,
}) => {
  const [activeCarId, setActiveCarId] = useState<string>(currentCar.id);
  const activeCar = SPORTS_CARS.find((c) => c.id === activeCarId) || SPORTS_CARS[0];

  const handleChoose = (car: SportsCar) => {
    setActiveCarId(car.id);
    onSelectCar(car);
    sounds.playEngineRev();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-slate-100">
                {lang === 'es' ? 'GARAJE DE SUPERDEPORTIVOS & TELEMETRÍA' : 'SUPERCAR TELEMETRY PADDOCK'}
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                {lang === 'es'
                  ? '7 iconos de alto rendimiento para modelar curvas cuadráticas'
                  : '7 high-performance icons for quadratic trajectory modeling'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 font-mono text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            ✕ {lang === 'es' ? 'Cerrar' : 'Close'}
          </button>
        </div>

        {/* Modal Body: Car List & Selected Car Deep Dive */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 overflow-y-auto pr-1">
          {/* Car Selection Sidebar */}
          <div className="md:col-span-5 space-y-1.5">
            {SPORTS_CARS.map((c) => {
              const isCurrent = c.id === activeCarId;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCarId(c.id);
                    sounds.playRatchet();
                  }}
                  className={`w-full text-left p-3 rounded-lg border font-mono text-xs transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-slate-800 border-cyan-500 text-cyan-200 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-bold truncate text-slate-100">{c.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{c.horsepower} HP</span>
                      <span>·</span>
                      <span>{c.acceleration0to100}s (0-100)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: c.signatureColor }}
                    />
                    {currentCar.id === c.id && (
                      <span className="text-[10px] text-emerald-400 font-bold">✓ {lang === 'es' ? 'Activo' : 'Active'}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Car Deep Dive View */}
          <div className="md:col-span-7 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${activeCar.signatureColor}20`, color: activeCar.signatureColor }}
                  >
                    {activeCar.classTag}
                  </span>
                  <h3 className="text-xl font-bold font-mono text-slate-100 mt-1">
                    {activeCar.name}
                  </h3>
                </div>

                <div className="text-right font-mono">
                  <div className="text-lg font-bold text-amber-400 tabular-nums">
                    {activeCar.topSpeedKmh} km/h
                  </div>
                  <div className="text-[10px] text-slate-500">{lang === 'es' ? 'Velocidad Máx.' : 'Top Speed'}</div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">{lang === 'es' ? 'POTENCIA' : 'POWER'}</span>
                  <span className="font-bold text-slate-200">{activeCar.horsepower} HP</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">0-100 KM/H</span>
                  <span className="font-bold text-slate-200">{activeCar.acceleration0to100} s</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">{lang === 'es' ? 'FABRICANTE' : 'BRAND'}</span>
                  <span className="font-bold text-cyan-400">{activeCar.manufacturer}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-sans text-slate-300">
                <p className="leading-relaxed">{activeCar.description}</p>
                <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-200 font-mono text-[11px] leading-relaxed">
                  <span className="font-bold">{lang === 'es' ? 'Modelado Matemático: ' : 'Mathematical Modeling: '}</span>
                  {activeCar.idealCurvatureRole}
                </div>
              </div>
            </div>

            {/* Select Button */}
            <div className="pt-2">
              <button
                onClick={() => handleChoose(activeCar)}
                className="w-full py-2.5 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-900/40"
              >
                <Check className="w-4 h-4" />
                <span>
                  {currentCar.id === activeCar.id
                    ? lang === 'es'
                      ? 'Vehículo Seleccionado en Pista'
                      : 'Car Currently Active on Track'
                    : lang === 'es'
                    ? `Elegir ${activeCar.name} para la Pista`
                    : `Deploy ${activeCar.name} to Track`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
