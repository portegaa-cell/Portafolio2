export type CarId =
  | 'ferrari_488'
  | 'lambo_revuelto'
  | 'porsche_gt3'
  | 'nissan_gtr'
  | 'bmw_m4'
  | 'mercedes_amg'
  | 'toyota_supra';

export interface SportsCar {
  id: CarId;
  name: string;
  manufacturer: string;
  classTag: string;
  horsepower: number;
  topSpeedKmh: number;
  acceleration0to100: number; // seconds
  signatureColor: string; // hex
  secondaryColor: string; // hex
  tagline: string;
  description: string;
  idealCurvatureRole: string;
}

export interface QuadraticCoefficients {
  a: number;
  b: number;
  c: number;
}

export interface QuadraticAnalysis {
  a: number;
  b: number;
  c: number;
  discriminant: number; // delta = b^2 - 4ac
  vertexX: number; // -b / (2a)
  vertexY: number; // f(vertexX)
  yIntercept: number; // (0, c)
  axisOfSymmetry: number; // x = -b / (2a)
  rootType: 'two_real' | 'one_real' | 'no_real';
  roots: number[]; // real roots if any
  concavity: 'upward' | 'downward';
  equationStr: string;
  vertexFormStr: string;
  factoredFormStr: string | null;
}

export type ChallengeStep = 'coefficients' | 'discriminant' | 'roots' | 'completed';

export interface TelemetryProblem {
  id: string;
  carId: CarId;
  title: string;
  scenarioDescription: string;
  difficulty: 'Rookie' | 'Pro' | 'GrandPrix';
  coefficients: QuadraticCoefficients;
  questionPrompt: string;
  realWorldContext: string;
  unitX: string; // e.g. "meters", "seconds"
  unitY: string; // e.g. "track lateral position (m)", "velocity (m/s)"
}

export interface StepFeedback {
  isCorrect: boolean;
  message: string;
  diagnosticType?: 'sign_b' | 'square_negative' | 'sign_4ac' | 'denom_2a' | 'sqrt_error' | 'none';
  hint?: string;
  details?: string;
}

export interface AttemptLog {
  problemId: string;
  problemTitle: string;
  carName: string;
  difficulty: string;
  coefficients: QuadraticCoefficients;
  discriminant: number;
  roots: number[];
  userTimeSeconds: number;
  mistakesCount: number;
  diagnosticMistakes: string[];
  solved: boolean;
}

export interface OverallStats {
  problemsAttempted: number;
  problemsSolved: number;
  totalTimeSeconds: number;
  currentStreak: number;
  bestStreak: number;
  mistakeTypes: {
    sign_b: number;
    square_negative: number;
    sign_4ac: number;
    denom_2a: number;
    general: number;
  };
}

export type AppMode = 'simulator' | 'challenge' | 'time_attack';
export type AppLanguage = 'es' | 'en';
