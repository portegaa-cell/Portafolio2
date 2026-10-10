import React, { useState, useEffect } from 'react';
import { SportsCar, AppMode, AppLanguage, AttemptLog } from './types/telemetry';
import { SPORTS_CARS } from './data/cars';
import { sounds } from './utils/soundEffects';
import { Header } from './components/Header';
import { SimulatorMode } from './components/SimulatorMode';
import { PitStopChallengeMode } from './components/PitStopChallengeMode';
import { TimeAttackMode } from './components/TimeAttackMode';
import { PerformanceReportModal } from './components/PerformanceReportModal';
import { CarShowcaseModal } from './components/CarShowcaseModal';
import {
  Gauge,
  Wrench,
  Zap,
  Car,
  ChevronRight,
  ShieldAlert,
  Flame,
  Award,
} from 'lucide-react';

export default function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('simulator');
  const [selectedCar, setSelectedCar] = useState<SportsCar>(SPORTS_CARS[0]);
  const [lang, setLang] = useState<AppLanguage>('es');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [attemptLogs, setAttemptLogs] = useState<AttemptLog[]>(() => {
    try {
      const saved = localStorage.getItem('quadratic_racing_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [showGarageModal, setShowGarageModal] = useState<boolean>(false);

  // Sync logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('quadratic_racing_logs', JSON.stringify(attemptLogs));
    } catch {
      // Storage fallback
    }
  }, [attemptLogs]);

  const handleToggleLang = () => {
    sounds.playBlip(650);
    setLang((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sounds.isMuted = nextMuted;
    if (!nextMuted) sounds.playBlip(700);
  };

  const handleLogAttempt = (log: AttemptLog) => {
    setAttemptLogs((prev) => [log, ...prev]);
  };

  const handleClearHistory = () => {
    setAttemptLogs([]);
    try {
      localStorage.removeItem('quadratic_racing_logs');
    } catch {
      // Storage fallback
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Strict 3-zone Header Contract */}
      <Header
        currentMode={currentMode}
        onSelectMode={(mode) => {
          sounds.playRatchet();
          setCurrentMode(mode);
        }}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenReport={() => {
          sounds.playBlip(600);
          setShowReportModal(true);
        }}
        onOpenGarage={() => {
          sounds.playBlip(600);
          setShowGarageModal(true);
        }}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Hero Banner with Generated Motorsport Artwork */}
      <div className="relative border-b border-slate-800 overflow-hidden bg-slate-900">
        <img
          src="/src/assets/images/racing_track_hero_1791651200397.jpg"
          alt="Quadratic telemetry race track"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-25 filter blur-[0.5px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-6 md:py-8 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <span className="font-semibold uppercase tracking-wider">
                  Agente Matemático / Carros
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">f(x) = ax² + bx + c</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-100">
                {lang === 'es'
                  ? 'Desafío de Ecuaciones Cuadráticas & Telemetría'
                  : 'Quadratic Equations Racing Challenge'}
              </h1>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
                {lang === 'es'
                  ? 'Aprende y domina la fórmula cuadrática, el discriminante Δ y las trayectorias parabólicas utilizando superdeportivos icónicos: Ferrari, Lamborghini, Porsche, Nissan GT-R y más.'
                  : 'Master the quadratic formula, discriminant Δ, and parabolic trajectory modeling using high-performance sports cars: Ferrari, Lamborghini, Porsche, Nissan GT-R, and more.'}
              </p>
            </div>

            {/* Quick Car Livery Tag */}
            <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-800 shrink-0">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
                style={{
                  borderColor: `${selectedCar.signatureColor}60`,
                  backgroundColor: `${selectedCar.signatureColor}20`,
                }}
              >
                <Car className="w-5 h-5" style={{ color: selectedCar.signatureColor }} />
              </div>
              <div className="font-mono text-xs pr-2">
                <div className="text-slate-400 text-[10px]">{lang === 'es' ? 'AUTO ACTIVO' : 'ACTIVE CAR'}</div>
                <div className="font-bold text-slate-100">{selectedCar.name}</div>
                <div className="text-[10px] text-cyan-400">{selectedCar.horsepower} HP · {selectedCar.acceleration0to100}s</div>
              </div>
              <button
                onClick={() => setShowGarageModal(true)}
                className="px-2 py-1 text-[11px] font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
              >
                {lang === 'es' ? 'Cambiar' : 'Change'}
              </button>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-800 w-fit">
            <button
              onClick={() => {
                sounds.playRatchet();
                setCurrentMode('simulator');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                currentMode === 'simulator'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{lang === 'es' ? '1. Simulador de Telemetría' : '1. Telemetry Simulator'}</span>
            </button>

            <button
              onClick={() => {
                sounds.playRatchet();
                setCurrentMode('challenge');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                currentMode === 'challenge'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>{lang === 'es' ? '2. Reto Pit-Stop Guiado' : '2. Guided Pit-Stop Challenge'}</span>
            </button>

            <button
              onClick={() => {
                sounds.playRatchet();
                setCurrentMode('time_attack');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all ${
                currentMode === 'time_attack'
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{lang === 'es' ? '3. Drag Strip Time Attack' : '3. Drag Strip Time Attack'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
        {currentMode === 'simulator' && (
          <SimulatorMode
            selectedCar={selectedCar}
            onSelectCar={(c) => setSelectedCar(c)}
            lang={lang}
          />
        )}

        {currentMode === 'challenge' && (
          <PitStopChallengeMode
            lang={lang}
            onLogAttempt={handleLogAttempt}
            onOpenReport={() => setShowReportModal(true)}
          />
        )}

        {currentMode === 'time_attack' && (
          <TimeAttackMode car={selectedCar} lang={lang} />
        )}
      </main>

      {/* Modals */}
      {showReportModal && (
        <PerformanceReportModal
          logs={attemptLogs}
          lang={lang}
          onClose={() => setShowReportModal(false)}
          onClearHistory={handleClearHistory}
        />
      )}

      {showGarageModal && (
        <CarShowcaseModal
          currentCar={selectedCar}
          onSelectCar={(c) => {
            setSelectedCar(c);
            setShowGarageModal(false);
          }}
          lang={lang}
          onClose={() => setShowGarageModal(false)}
        />
      )}

      {/* Clean Footer (Complies with Anti-Slop Discipline) */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>Agente Matemático / Carros</span>
          <span>·</span>
          <span>Quadratic Equations Racing Challenge</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <button
            onClick={() => setShowReportModal(true)}
            className="hover:text-cyan-400 transition-colors"
          >
            {lang === 'es' ? 'Ver Auditoría' : 'Audit Log'} ({attemptLogs.length})
          </button>
          <button
            onClick={() => setShowGarageModal(true)}
            className="hover:text-cyan-400 transition-colors"
          >
            {lang === 'es' ? 'Paddock de Superautos' : 'Supercar Paddock'}
          </button>
        </div>
      </footer>
    </div>
  );
}
