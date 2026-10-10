import React, { useState } from 'react';
import { AttemptLog } from '../types/telemetry';
import { generateMathematicalProof } from '../utils/mathQuadratic';
import {
  Trophy,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Zap,
  ChevronDown,
  ChevronUp,
  Award,
} from 'lucide-react';

interface PerformanceReportModalProps {
  logs: AttemptLog[];
  lang: 'es' | 'en';
  onClose: () => void;
  onClearHistory: () => void;
}

export const PerformanceReportModal: React.FC<PerformanceReportModalProps> = ({
  logs,
  lang,
  onClose,
  onClearHistory,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const totalAttempted = logs.length;
  const totalSolved = logs.filter((l) => l.solved).length;
  const accuracy = totalAttempted > 0 ? Math.round((totalSolved / totalAttempted) * 100) : 0;
  const totalMistakes = logs.reduce((acc, curr) => acc + curr.mistakesCount, 0);

  // Diagnostic classification counts
  let signBErrors = 0;
  let squareNegErrors = 0;
  let sign4acErrors = 0;
  let denom2aErrors = 0;

  logs.forEach((l) => {
    l.diagnosticMistakes.forEach((err) => {
      if (err === 'sign_b') signBErrors++;
      if (err === 'square_negative') squareNegErrors++;
      if (err === 'sign_4ac') sign4acErrors++;
      if (err === 'denom_2a') denom2aErrors++;
    });
  });

  // Calculate telemetry engineer rating tier
  let rankTitle = lang === 'es' ? 'Piloto en Prácticas' : 'Rookie Test Driver';
  let rankBadgeColor = 'text-slate-400';
  if (accuracy >= 90 && totalSolved >= 3) {
    rankTitle = lang === 'es' ? 'Jefe de Telemetría Scuderia (S-Tier)' : 'Scuderia Chief Telemetrist (S-Tier)';
    rankBadgeColor = 'text-amber-400';
  } else if (accuracy >= 75 && totalSolved >= 2) {
    rankTitle = lang === 'es' ? 'Ingeniero de Pista de Grand Prix (A-Tier)' : 'Grand Prix Race Engineer (A-Tier)';
    rankBadgeColor = 'text-cyan-400';
  } else if (totalSolved >= 1) {
    rankTitle = lang === 'es' ? 'Especialista en Ápices y Frenada (B-Tier)' : 'Apex & Braking Specialist (B-Tier)';
    rankBadgeColor = 'text-emerald-400';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-slate-100">
                {lang === 'es' ? 'REPORTE DE RENDIMIENTO EN PISTA' : 'TRACK TELEMETRY PERFORMANCE REPORT'}
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                {lang === 'es' ? 'Auditoría matemática del Agente de Pits' : 'Mathematical audit by Pit Agent'}
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

        {/* Scrollable Body */}
        <div className="overflow-y-auto space-y-4 pr-1 text-slate-200">
          {/* Top KPI Cards Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-mono">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">{lang === 'es' ? 'PRECISIÓN' : 'ACCURACY'}</span>
              <span className="text-xl font-bold text-emerald-400 tabular-nums">{accuracy}%</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">{lang === 'es' ? 'RESUELTOS' : 'SOLVED'}</span>
              <span className="text-xl font-bold text-cyan-400 tabular-nums">
                {totalSolved} / {totalAttempted}
              </span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">{lang === 'es' ? 'TOTAL FALLOS' : 'TOTAL ERRORS'}</span>
              <span className="text-xl font-bold text-rose-400 tabular-nums">{totalMistakes}</span>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">{lang === 'es' ? 'RANGO' : 'RANK'}</span>
              <span className={`text-xs font-bold truncate block mt-1 ${rankBadgeColor}`}>
                {rankTitle}
              </span>
            </div>
          </div>

          {/* Diagnostic Error Breakdown (Root & Sign Confusions) */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>
                  {lang === 'es' ? 'ANÁLISIS DIAGNÓSTICO DE ERRORES' : 'DIAGNOSTIC ERROR & CONFUSION ANALYSIS'}
                </span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {lang === 'es' ? 'Detección automática de trampas de signos' : 'Automated sign trap detection'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {/* Trap 1: Sign in -b */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">{lang === 'es' ? 'Error de Signo en -b' : 'Sign Inversion on -b'}</div>
                  <div className="text-[10px] text-slate-500">
                    {lang === 'es' ? 'Ejemplo: confundir -(-6) con -6' : 'e.g. confusing -(-6) with -6'}
                  </div>
                </div>
                <span className={`font-bold tabular-nums px-2 py-0.5 rounded text-xs ${signBErrors > 0 ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                  {signBErrors}
                </span>
              </div>

              {/* Trap 2: Square negative */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">{lang === 'es' ? 'Cuadrado Negativo en b²' : 'Negative in b²'}</div>
                  <div className="text-[10px] text-slate-500">
                    {lang === 'es' ? '(-b)² siempre es positivo' : '(-b)² is strictly positive'}
                  </div>
                </div>
                <span className={`font-bold tabular-nums px-2 py-0.5 rounded text-xs ${squareNegErrors > 0 ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                  {squareNegErrors}
                </span>
              </div>

              {/* Trap 3: Sign in -4ac */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">{lang === 'es' ? 'Trampa de Signo en -4ac' : 'Sign Trap on -4ac'}</div>
                  <div className="text-[10px] text-slate-500">
                    {lang === 'es' ? 'Resta con factores negativos' : 'Subtracting negative products'}
                  </div>
                </div>
                <span className={`font-bold tabular-nums px-2 py-0.5 rounded text-xs ${sign4acErrors > 0 ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                  {sign4acErrors}
                </span>
              </div>

              {/* Trap 4: Denominator 2a */}
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-200">{lang === 'es' ? 'Olvido de 2a en Denominador' : 'Denominator 2a Omission'}</div>
                  <div className="text-[10px] text-slate-500">
                    {lang === 'es' ? 'Dividir entre a en vez de 2a' : 'Dividing by a instead of 2a'}
                  </div>
                </div>
                <span className={`font-bold tabular-nums px-2 py-0.5 rounded text-xs ${denom2aErrors > 0 ? 'bg-rose-950 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                  {denom2aErrors}
                </span>
              </div>
            </div>

            {/* Pedagogical Advice Box */}
            <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-800/40 text-xs font-sans text-cyan-200 leading-relaxed">
              <span className="font-bold font-mono">
                {lang === 'es' ? 'Recomendación del Tutor: ' : 'Tutor Recommendation: '}
              </span>
              {signBErrors > 0
                ? lang === 'es'
                  ? 'Recuerda que en el volante de la fórmula general (-b) actúa como un inversor de signo: si b ya es negativo, el signo menos lo convierte en positivo.'
                  : 'Remember that (-b) inverts steering sign: if b is already negative, the leading negative makes it positive!'
                : squareNegErrors > 0
                ? lang === 'es'
                  ? 'Atención al calcular b²: el cuadrado de cualquier número real nunca puede ser negativo.'
                  : 'Pay attention when evaluating b²: the square of any real scalar is strictly non-negative.'
                : lang === 'es'
                ? '¡Excelente precisión de telemetría! Mantén la concentración en los signos cuando el coeficiente a sea diferente de 1.'
                : 'Outstanding telemetry precision! Keep focus on denominator signs when a ≠ 1.'}
            </div>
          </div>

          {/* Solved Problems Mathematical Proofs Accordion */}
          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>
                  {lang === 'es' ? 'DEMOSTRACIONES MATEMÁTICAS REGISTRADAS' : 'RECORDED MATHEMATICAL PROOFS'}
                </span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                {logs.length} {lang === 'es' ? 'registros de parada' : 'pit records'}
              </span>
            </div>

            {logs.length === 0 ? (
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-center text-xs font-mono text-slate-500">
                {lang === 'es'
                  ? 'No hay problemas registrados aún. Completa una parada en el Reto Pit-Stop para ver las demostraciones aquí.'
                  : 'No records logged yet. Complete a pit stop in Challenge mode to review proofs here.'}
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log, idx) => {
                  const isExpanded = expandedIndex === idx;
                  const proof = generateMathematicalProof(log.coefficients, lang);

                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800 bg-slate-950 overflow-hidden text-xs font-mono"
                    >
                      <button
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="w-full p-3 flex items-center justify-between hover:bg-slate-900/60 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <span className="font-bold text-slate-100">{log.problemTitle}</span>
                            <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>{log.carName}</span>
                              <span>·</span>
                              <span>
                                {log.userTimeSeconds}s {lang === 'es' ? 'tiempo' : 'time'}
                              </span>
                              <span>·</span>
                              <span className={log.mistakesCount > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                                {log.mistakesCount} {lang === 'es' ? 'errores' : 'mistakes'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-slate-400">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-3 bg-slate-900/60 border-t border-slate-800 space-y-2 text-slate-300">
                          <div className="p-2 rounded bg-slate-950 border border-slate-800/80 whitespace-pre-line leading-relaxed text-[11px]">
                            <span className="text-cyan-400 font-bold">1. </span>
                            {proof.step1}
                          </div>

                          <div className="p-2 rounded bg-slate-950 border border-slate-800/80 whitespace-pre-line leading-relaxed text-[11px]">
                            <span className="text-amber-400 font-bold">2. </span>
                            {proof.step2}
                          </div>

                          <div className="p-2 rounded bg-slate-950 border border-slate-800/80 whitespace-pre-line leading-relaxed text-[11px]">
                            <span className="text-purple-400 font-bold">3. </span>
                            {proof.step3}
                          </div>

                          <div className="p-2 rounded bg-slate-950 border border-slate-800/80 whitespace-pre-line leading-relaxed text-[11px]">
                            <span className="text-emerald-400 font-bold">4. </span>
                            {proof.step4}
                          </div>

                          <div className="p-2 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-200 text-[11px]">
                            {proof.conclusion}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={onClearHistory}
            className="text-[11px] font-mono text-slate-500 hover:text-rose-400 transition-colors"
          >
            {lang === 'es' ? 'Limpiar historial de sesión' : 'Clear session history'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono text-xs rounded-lg transition-colors"
          >
            {lang === 'es' ? 'Continuar Competición' : 'Back to Circuit'}
          </button>
        </div>
      </div>
    </div>
  );
};
