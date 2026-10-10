import React, { useState, useEffect } from 'react';
import {
  TelemetryProblem,
  SportsCar,
  ChallengeStep,
  AttemptLog,
  QuadraticCoefficients,
} from '../types/telemetry';
import { CURATED_PROBLEMS, generateRandomProblem } from '../data/problems';
import { getCarById } from '../data/cars';
import {
  analyzeQuadratic,
  diagnoseCoefficients,
  diagnoseDiscriminant,
  diagnoseRoots,
  generateMathematicalProof,
} from '../utils/mathQuadratic';
import { ParabolaCanvas } from './ParabolaCanvas';
import { TelemetryGauges } from './TelemetryGauges';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  RotateCcw,
  Flag,
  FileText,
  HelpCircle,
  Trophy,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface PitStopChallengeModeProps {
  lang: 'es' | 'en';
  onLogAttempt: (log: AttemptLog) => void;
  onOpenReport: () => void;
}

export const PitStopChallengeMode: React.FC<PitStopChallengeModeProps> = ({
  lang,
  onLogAttempt,
  onOpenReport,
}) => {
  const [difficulty, setDifficulty] = useState<'Rookie' | 'Pro' | 'GrandPrix'>('Rookie');
  const [problemIndex, setProblemIndex] = useState<number>(0);

  // Available problems list filtered or supplemented
  const [problemList, setProblemList] = useState<TelemetryProblem[]>(CURATED_PROBLEMS);
  const currentProblem = problemList[problemIndex % problemList.length];
  const activeCar = getCarById(currentProblem.carId);

  // Active step in guided pipeline: 'coefficients' -> 'discriminant' -> 'roots' -> 'completed'
  const [currentStep, setCurrentStep] = useState<ChallengeStep>('coefficients');

  // Inputs for Step 1: Coefficients
  const [inputA, setInputA] = useState<string>('');
  const [inputB, setInputB] = useState<string>('');
  const [inputC, setInputC] = useState<string>('');

  // Inputs for Step 2: Discriminant
  const [inputDisc, setInputDisc] = useState<string>('');
  const [inputRootType, setInputRootType] = useState<string>('two_real');

  // Inputs for Step 3: Roots
  const [inputR1, setInputR1] = useState<string>('');
  const [inputR2, setInputR2] = useState<string>('');
  const [hasNoRootsCheck, setHasNoRootsCheck] = useState<boolean>(false);

  // Diagnostic feedback messages & states
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'hint' | null;
    message: string;
    details?: string;
  }>({ type: null, message: '' });

  const [mistakesThisProblem, setMistakesThisProblem] = useState<number>(0);
  const [diagnosticErrorsList, setDiagnosticErrorsList] = useState<string[]>([]);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showProofModal, setShowProofModal] = useState<boolean>(false);

  // Reset inputs when switching problems
  useEffect(() => {
    setCurrentStep('coefficients');
    setInputA('');
    setInputB('');
    setInputC('');
    setInputDisc('');
    setInputRootType('two_real');
    setInputR1('');
    setInputR2('');
    setHasNoRootsCheck(false);
    setFeedback({ type: null, message: '' });
    setMistakesThisProblem(0);
    setDiagnosticErrorsList([]);
    setStartTime(Date.now());
  }, [problemIndex, difficulty]);

  // Derived analysis for current problem
  const targetCoefs = currentProblem.coefficients;
  const analysis = analyzeQuadratic(targetCoefs);

  // Handler for Step 1: Coefficients
  const handleVerifyCoefficients = () => {
    sounds.playRatchet();
    const parsedA = inputA.trim() === '' ? null : parseFloat(inputA);
    const parsedB = inputB.trim() === '' ? null : parseFloat(inputB);
    const parsedC = inputC.trim() === '' ? null : parseFloat(inputC);

    const diag = diagnoseCoefficients(
      { a: parsedA, b: parsedB, c: parsedC },
      targetCoefs,
      lang
    );

    if (diag.isCorrect) {
      sounds.playSuccessChime();
      setFeedback({
        type: 'success',
        message: diag.message,
      });
      setCurrentStep('discriminant');
    } else {
      sounds.playErrorAlert();
      setMistakesThisProblem((m) => m + 1);
      if (diag.diagnosticType !== 'none') {
        setDiagnosticErrorsList((prev) => [...prev, diag.diagnosticType]);
      }
      setFeedback({
        type: 'error',
        message: diag.message,
      });
    }
  };

  // Handler for Step 2: Discriminant
  const handleVerifyDiscriminant = () => {
    sounds.playRatchet();
    const parsedDisc = inputDisc.trim() === '' ? null : parseFloat(inputDisc);

    const diag = diagnoseDiscriminant(
      parsedDisc,
      inputRootType,
      targetCoefs,
      lang
    );

    if (diag.isCorrect) {
      sounds.playSuccessChime();
      setFeedback({
        type: 'success',
        message: diag.message,
      });
      setCurrentStep('roots');
    } else {
      sounds.playErrorAlert();
      setMistakesThisProblem((m) => m + 1);
      if (diag.diagnosticType !== 'none') {
        setDiagnosticErrorsList((prev) => [...prev, diag.diagnosticType]);
      }
      setFeedback({
        type: 'error',
        message: diag.message,
      });
    }
  };

  // Handler for Step 3: Roots
  const handleVerifyRoots = () => {
    sounds.playRatchet();
    const parsedR1 = inputR1.trim() === '' ? null : parseFloat(inputR1);
    const parsedR2 = inputR2.trim() === '' ? null : parseFloat(inputR2);

    const diag = diagnoseRoots(
      parsedR1,
      parsedR2,
      hasNoRootsCheck,
      targetCoefs,
      lang
    );

    if (diag.isCorrect) {
      sounds.playEngineRev();
      setFeedback({
        type: 'success',
        message: diag.message,
      });
      setCurrentStep('completed');

      // Log attempt
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      onLogAttempt({
        problemId: currentProblem.id,
        problemTitle: currentProblem.title,
        carName: activeCar.name,
        difficulty: currentProblem.difficulty,
        coefficients: targetCoefs,
        discriminant: analysis.discriminant,
        roots: analysis.roots,
        userTimeSeconds: elapsed,
        mistakesCount: mistakesThisProblem,
        diagnosticMistakes: diagnosticErrorsList,
        solved: true,
      });
    } else {
      sounds.playErrorAlert();
      setMistakesThisProblem((m) => m + 1);
      if (diag.diagnosticType !== 'none') {
        setDiagnosticErrorsList((prev) => [...prev, diag.diagnosticType]);
      }
      setFeedback({
        type: 'error',
        message: diag.message,
      });
    }
  };

  const handleNextProblem = () => {
    sounds.playBlip(700);
    setProblemIndex((idx) => idx + 1);
  };

  const handleGenerateFreshProblem = () => {
    sounds.playBlip(750);
    const fresh = generateRandomProblem(activeCar.id, difficulty);
    setProblemList((prev) => [fresh, ...prev]);
    setProblemIndex(0);
  };

  const proof = generateMathematicalProof(targetCoefs, lang);

  return (
    <div className="space-y-4">
      {/* Top Header Strip: Problem Context & Difficulty Selector */}
      <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border"
            style={{
              borderColor: `${activeCar.signatureColor}60`,
              backgroundColor: `${activeCar.signatureColor}20`,
            }}
          >
            <Wrench className="w-5 h-5" style={{ color: activeCar.signatureColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="font-semibold text-cyan-400">{activeCar.name}</span>
              <span>·</span>
              <span className="text-slate-300">{currentProblem.difficulty} Cup</span>
              <span>·</span>
              <span>
                {lang === 'es' ? 'Parada en Pits' : 'Pit Stop'} #{problemIndex + 1}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              {currentProblem.title}
            </h2>
          </div>
        </div>

        {/* Difficulty Selector Tabs & Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            {(['Rookie', 'Pro', 'GrandPrix'] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => {
                  setDifficulty(tier);
                  sounds.playBlip(550);
                }}
                className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-colors ${
                  difficulty === tier
                    ? 'bg-slate-800 text-cyan-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tier}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateFreshProblem}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'es' ? 'Nuevo Reto' : 'New Scenario'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Telemetry Dashboard for this equation */}
      <TelemetryGauges analysis={analysis} car={activeCar} lang={lang} />

      {/* Split Workspace: Stage (Canvas) + Guided Step-by-Step Pit Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Zone: Live Parabola Telemetry Canvas */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="h-[430px] w-full">
            <ParabolaCanvas
              coefficients={targetCoefs}
              car={activeCar}
              lang={lang}
              highlightRoots={currentStep === 'roots' || currentStep === 'completed'}
              highlightVertex={true}
              interactive={true}
            />
          </div>

          {/* Scenario Context Card */}
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800">
            <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
              <span className="font-semibold text-slate-200">
                {lang === 'es' ? 'INFORME DE TELEMETRÍA EN PISTA' : 'TRACK TELEMETRY REPORT'}
              </span>
              <span className="text-cyan-400 font-bold">{analysis.equationStr}</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {currentProblem.scenarioDescription}
            </p>
            <div className="mt-2 text-[11px] font-mono text-amber-300/90 bg-amber-950/20 p-2 rounded border border-amber-900/30">
              {currentProblem.realWorldContext}
            </div>
          </div>
        </div>

        {/* Right Zone: Guided Step-by-Step Pit Stop Pipeline */}
        <div className="lg:col-span-5 space-y-3">
          {/* Step Progress Tracker */}
          <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
              <span className="font-semibold text-slate-200">
                {lang === 'es' ? 'SECUENCIA DE PIT-STOP' : 'PIT-STOP SEQUENCE'}
              </span>
              <span>
                {currentStep === 'coefficients'
                  ? 'Paso 1 / 3'
                  : currentStep === 'discriminant'
                  ? 'Paso 2 / 3'
                  : currentStep === 'roots'
                  ? 'Paso 3 / 3'
                  : lang === 'es'
                  ? '¡Completado!'
                  : 'Complete!'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center text-[11px] font-mono">
              <div
                className={`py-1.5 px-1 rounded border transition-colors ${
                  currentStep === 'coefficients'
                    ? 'border-cyan-500 bg-cyan-950/50 text-cyan-200 font-semibold'
                    : currentStep === 'discriminant' || currentStep === 'roots' || currentStep === 'completed'
                    ? 'border-emerald-600/50 bg-emerald-950/30 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-500'
                }`}
              >
                1. {lang === 'es' ? 'Coeficientes' : 'Coefficients'}
              </div>

              <div
                className={`py-1.5 px-1 rounded border transition-colors ${
                  currentStep === 'discriminant'
                    ? 'border-cyan-500 bg-cyan-950/50 text-cyan-200 font-semibold'
                    : currentStep === 'roots' || currentStep === 'completed'
                    ? 'border-emerald-600/50 bg-emerald-950/30 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-500'
                }`}
              >
                2. {lang === 'es' ? 'Discriminante Δ' : 'Discriminant Δ'}
              </div>

              <div
                className={`py-1.5 px-1 rounded border transition-colors ${
                  currentStep === 'roots'
                    ? 'border-cyan-500 bg-cyan-950/50 text-cyan-200 font-semibold'
                    : currentStep === 'completed'
                    ? 'border-emerald-600/50 bg-emerald-950/30 text-emerald-300'
                    : 'border-slate-800 bg-slate-950 text-slate-500'
                }`}
              >
                3. {lang === 'es' ? 'Raíces x₁, x₂' : 'Roots x₁, x₂'}
              </div>
            </div>
          </div>

          {/* Active Step Interactive Card */}
          <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-4">
            {/* STEP 1: Identify Coefficients */}
            {currentStep === 'coefficients' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-semibold text-cyan-400">
                    {lang === 'es' ? 'PASO 1: IDENTIFICAR a, b, c' : 'STEP 1: IDENTIFY a, b, c'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">ax² + bx + c = 0</span>
                </div>

                <p className="text-xs text-slate-300">
                  {lang === 'es'
                    ? 'Extrae los coeficientes de la ecuación de telemetría:'
                    : 'Extract the coefficients from the telemetry equation:'}
                </p>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-sm text-cyan-300 font-bold">
                  {analysis.equationStr}
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      a ({lang === 'es' ? 'cuadrático' : 'quadratic'})
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 1"
                      value={inputA}
                      onChange={(e) => setInputA(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      b ({lang === 'es' ? 'lineal' : 'linear'})
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. -6"
                      value={inputB}
                      onChange={(e) => setInputB(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      c ({lang === 'es' ? 'constante' : 'constant'})
                    </label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 5"
                      value={inputC}
                      onChange={(e) => setInputC(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleVerifyCoefficients}
                  className="w-full py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-900/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === 'es' ? 'Verificar Coeficientes' : 'Verify Coefficients'}</span>
                </button>
              </div>
            )}

            {/* STEP 2: Calculate Discriminant */}
            {currentStep === 'discriminant' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-semibold text-cyan-400">
                    {lang === 'es' ? 'PASO 2: CALCULAR DISCRIMINANTE Δ' : 'STEP 2: CALCULATE DISCRIMINANT Δ'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">Δ = b² - 4ac</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                  <div>
                    {lang === 'es' ? 'Coeficientes verificados' : 'Verified Coefficients'}:{' '}
                    <span className="text-cyan-300 font-bold">
                      a = {targetCoefs.a}, b = {targetCoefs.b}, c = {targetCoefs.c}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {lang === 'es' ? 'Fórmula' : 'Formula'}: Δ = ({targetCoefs.b})² - 4·({targetCoefs.a})·({targetCoefs.c})
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    {lang === 'es' ? 'Valor numérico de Δ' : 'Numerical value of Δ'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 16"
                    value={inputDisc}
                    onChange={(e) => setInputDisc(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    {lang === 'es' ? 'Naturaleza de las soluciones según Δ' : 'Nature of roots according to Δ'}
                  </label>
                  <select
                    value={inputRootType}
                    onChange={(e) => setInputRootType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="two_real">
                      {lang === 'es' ? 'Δ > 0 → Dos raíces reales distintas (2 cortes)' : 'Δ > 0 → Two distinct real roots'}
                    </option>
                    <option value="one_real">
                      {lang === 'es' ? 'Δ = 0 → Una raíz real doble (1 toque tangente)' : 'Δ = 0 → One real double root (tangent)'}
                    </option>
                    <option value="no_real">
                      {lang === 'es' ? 'Δ < 0 → Sin raíces reales (no toca la pista)' : 'Δ < 0 → No real roots (clears track)'}
                    </option>
                  </select>
                </div>

                <button
                  onClick={handleVerifyDiscriminant}
                  className="w-full py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-900/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === 'es' ? 'Verificar Discriminante' : 'Verify Discriminant'}</span>
                </button>
              </div>
            )}

            {/* STEP 3: Calculate Roots */}
            {currentStep === 'roots' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-mono font-semibold text-cyan-400">
                    {lang === 'es' ? 'PASO 3: RAÍCES DE TRAYECTORIA' : 'STEP 3: TRAJECTORY ROOTS'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">x = (-b ± √Δ) / 2a</span>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
                  <div>
                    Δ = <span className="text-emerald-400 font-bold">{analysis.discriminant}</span>
                    {analysis.discriminant >= 0 && (
                      <span className="text-slate-400 ml-2">
                        (√Δ = {Number(Math.sqrt(analysis.discriminant).toFixed(3))})
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    x = [-({targetCoefs.b}) ± √{analysis.discriminant}] / [2·({targetCoefs.a})]
                  </div>
                </div>

                {/* Option for no real roots */}
                <div className="flex items-center gap-2 p-2 rounded bg-slate-950 border border-slate-800">
                  <input
                    type="checkbox"
                    id="noRootsCheckbox"
                    checked={hasNoRootsCheck}
                    onChange={(e) => setHasNoRootsCheck(e.target.checked)}
                    className="accent-cyan-400"
                  />
                  <label htmlFor="noRootsCheckbox" className="text-xs font-mono text-slate-300 cursor-pointer">
                    {lang === 'es'
                      ? 'Sin soluciones reales (Δ < 0, trayectoria libre)'
                      : 'No real solutions (Δ < 0, clears track)'}
                  </label>
                </div>

                {!hasNoRootsCheck && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        x₁ ({lang === 'es' ? 'primera raíz' : 'first root'})
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 1"
                        value={inputR1}
                        onChange={(e) => setInputR1(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-slate-400 mb-1">
                        x₂ ({lang === 'es' ? 'segunda raíz' : 'second root'})
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 5"
                        value={inputR2}
                        onChange={(e) => setInputR2(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}

                <button
                  onClick={handleVerifyRoots}
                  className="w-full py-2 px-4 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-900/30"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{lang === 'es' ? 'Verificar Raíces y Completar' : 'Verify Roots & Complete'}</span>
                </button>
              </div>
            )}

            {/* STEP 4: Completed State */}
            {currentStep === 'completed' && (
              <div className="space-y-3 text-center py-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <Flag className="w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-base font-bold font-mono text-emerald-300">
                    {lang === 'es' ? '¡PARADA EN PITS COMPLETADA!' : 'PIT STOP COMPLETE!'}
                  </h3>
                  <p className="text-xs text-slate-300 font-sans mt-1">
                    {lang === 'es'
                      ? 'La telemetría ha sido calibrada a la perfección. El vehículo regresa a pista a máxima velocidad.'
                      : 'Telemetry calibrated to perfection. The sports car re-enters the circuit at full throttle.'}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 space-y-1 text-left">
                  <div className="text-cyan-300 font-bold">{analysis.equationStr}</div>
                  <div>Δ = {analysis.discriminant}</div>
                  <div>
                    {analysis.roots.length > 0
                      ? `${lang === 'es' ? 'Raíces' : 'Roots'}: ${analysis.roots.join(', ')}`
                      : lang === 'es'
                      ? 'Sin raíces reales'
                      : 'No real roots'}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setShowProofModal(true)}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{lang === 'es' ? 'Ver Demostración' : 'View Proof'}</span>
                  </button>

                  <button
                    onClick={handleNextProblem}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-900/30"
                  >
                    <span>{lang === 'es' ? 'Siguiente Reto' : 'Next Scenario'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Instant Feedback Diagnostic Banner */}
            {feedback.type && (
              <div
                className={`p-3 rounded-lg border text-xs font-sans leading-relaxed flex items-start gap-2.5 transition-all ${
                  feedback.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold font-mono text-[11px] mb-0.5">
                    {feedback.type === 'success'
                      ? lang === 'es'
                        ? 'TELEMETRÍA APROBADA'
                        : 'TELEMETRY APPROVED'
                      : lang === 'es'
                      ? 'ALERTA DEL JEFE DE EQUIPO / INGENIERO'
                      : 'PIT ENGINEER DIAGNOSTIC ALERT'}
                  </div>
                  <div>{feedback.message}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mathematical Proof Modal */}
      {showProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm font-bold">
                <FileText className="w-4 h-4" />
                <span>{lang === 'es' ? 'DEMOSTRACIÓN MATEMÁTICA PASO A PASO' : 'STEP-BY-STEP MATHEMATICAL PROOF'}</span>
              </div>
              <button
                onClick={() => setShowProofModal(false)}
                className="text-slate-400 hover:text-slate-200 font-mono text-xs px-2 py-1 rounded hover:bg-slate-800"
              >
                ✕ {lang === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono text-slate-300 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 whitespace-pre-line leading-relaxed">
                <span className="text-cyan-400 font-bold">1. </span>
                {proof.step1}
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 whitespace-pre-line leading-relaxed">
                <span className="text-amber-400 font-bold">2. </span>
                {proof.step2}
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 whitespace-pre-line leading-relaxed">
                <span className="text-purple-400 font-bold">3. </span>
                {proof.step3}
              </div>

              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 whitespace-pre-line leading-relaxed">
                <span className="text-emerald-400 font-bold">4. </span>
                {proof.step4}
              </div>

              <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-800/40 text-cyan-200 leading-relaxed font-sans">
                <span className="font-bold font-mono">Conclusión: </span>
                {proof.conclusion}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowProofModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono text-xs rounded-lg transition-colors"
              >
                {lang === 'es' ? 'Entendido' : 'Understood'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
