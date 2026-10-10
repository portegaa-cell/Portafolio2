import React from 'react';
import { AppMode, AppLanguage } from '../types/telemetry';
import { Award, Volume2, VolumeX, Globe } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface HeaderProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  lang: AppLanguage;
  onToggleLang: () => void;
  onOpenReport: () => void;
  onOpenGarage: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  lang,
  onToggleLang,
  onOpenReport,
  onOpenGarage,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectMode('simulator');
          }}
          className="text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 hover:text-cyan-400 transition-colors"
        >
          Quadratic Racing Challenge
        </a>
      </div>

      {/* Zone 2: 4 concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => onSelectMode('simulator')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-left ${
            currentMode === 'simulator' ? 'text-cyan-400 font-semibold underline underline-offset-4' : ''
          }`}
        >
          {lang === 'es' ? 'Simulador' : 'Simulator'}
        </button>

        <button
          onClick={() => onSelectMode('challenge')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-left ${
            currentMode === 'challenge' ? 'text-cyan-400 font-semibold underline underline-offset-4' : ''
          }`}
        >
          {lang === 'es' ? 'Reto Pit-Stop' : 'Pit Stop'}
        </button>

        <button
          onClick={() => onSelectMode('time_attack')}
          className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-left ${
            currentMode === 'time_attack' ? 'text-cyan-400 font-semibold underline underline-offset-4' : ''
          }`}
        >
          {lang === 'es' ? 'Time Attack' : 'Time Attack'}
        </button>

        <button
          onClick={onOpenGarage}
          className="hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 text-left"
        >
          {lang === 'es' ? 'Garaje' : 'Garage'}
        </button>
      </nav>

      {/* Zone 3: 1 Primary Action + Quick Utilities */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Language switch */}
        <button
          onClick={onToggleLang}
          title={lang === 'es' ? 'Cambiar a Inglés' : 'Switch to Spanish'}
          className="px-2 py-1 text-xs font-mono text-slate-400 hover:text-slate-200 border border-slate-800 rounded hover:bg-slate-900 transition-colors flex items-center gap-1"
        >
          <Globe className="w-3 h-3 text-cyan-400" />
          <span>{lang.toUpperCase()}</span>
        </button>

        {/* Audio Mute switch */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="p-1.5 text-slate-400 hover:text-slate-200 border border-slate-800 rounded hover:bg-slate-900 transition-colors"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onOpenReport}
          className="px-3.5 py-1.5 text-xs font-mono font-semibold text-slate-900 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-md shadow-cyan-950"
        >
          <Award className="w-3.5 h-3.5" />
          <span>{lang === 'es' ? 'Reporte Telemetría' : 'Telemetry Report'}</span>
        </button>
      </div>
    </header>
  );
};
