import { TelemetryProblem, CarId, QuadraticCoefficients } from '../types/telemetry';

export const CURATED_PROBLEMS: TelemetryProblem[] = [
  // 1. Rookie Cup - Ferrari 488 Pista
  {
    id: 'ferrari_braking_1',
    carId: 'ferrari_488',
    title: 'Ferrari 488 Pista: Monza Parabolica Braking Trajectory',
    scenarioDescription:
      'Approaching the iconic Curva Parabolica at Monza, the Ferrari telemetry computer models the car’s lateral deviation y (in meters) relative to the ideal center line over lateral distance x.',
    difficulty: 'Rookie',
    coefficients: { a: 1, b: -6, c: 5 }, // (x - 1)(x - 5) = 0 => x^2 - 6x + 5 = 0
    questionPrompt: 'Find the entry and exit track boundary points where the car intersects the racing telemetry centerline (y = 0).',
    realWorldContext: 'Trajectory formula: y = x² - 6x + 5. The car enters the braking envelope at x₁ and exits into the straightaway at x₂.',
    unitX: 'meters along corner zone',
    unitY: 'lateral line offset (m)',
  },

  // 2. Rookie Cup - Nissan GT-R Nismo
  {
    id: 'nissan_obstacle_1',
    carId: 'nissan_gtr',
    title: 'Nissan GT-R Nismo: Suzuka S-Curves Obstacle Avoidance',
    scenarioDescription:
      'Telemetry on the Suzuka S-Curves detects debris on the track. The GT-R’s ATTESA all-wheel computer executes a parabolic avoidance trajectory modeled by y = x² - 4x - 12.',
    difficulty: 'Rookie',
    coefficients: { a: 1, b: -4, c: -12 }, // (x - 6)(x + 2) = 0 => x^2 - 4x - 12 = 0
    questionPrompt: 'Compute the avoidance start and safe recovery points where the path returns to the track centerline.',
    realWorldContext: 'Trajectory equation: y = x² - 4x - 12. Determine the two real roots representing the obstacle avoidance window.',
    unitX: 'meters down the track',
    unitY: 'track centerline deviation (m)',
  },

  // 3. Rookie Cup - Porsche 911 GT3 RS
  {
    id: 'porsche_apex_1',
    carId: 'porsche_gt3',
    title: 'Porsche 911 GT3 RS: Nürburgring Karussell Apex Tangent',
    scenarioDescription:
      'Entering the banked Karussell corner, the Porsche’s downforce profile generates an exact parabolic tangent curve: y = x² - 6x + 9.',
    difficulty: 'Rookie',
    coefficients: { a: 1, b: -6, c: 9 }, // (x - 3)^2 = 0 => Discriminant = 0!
    questionPrompt: 'Calculate the discriminant Δ and locate the single apex contact point (double root) where the tires touch the concrete curb.',
    realWorldContext: 'Equation: y = x² - 6x + 9. Because Δ = 0, the trajectory touches the apex exactly once without crossing.',
    unitX: 'meters along curb',
    unitY: 'curb clearance (m)',
  },

  // 4. Pro Circuit - Lamborghini Revuelto
  {
    id: 'lambo_launch_2',
    carId: 'lambo_revuelto',
    title: 'Lamborghini Revuelto: Silverstone Maggotts Slingshot',
    scenarioDescription:
      'Navigating the ultra-high-speed Maggotts-Becketts complex, the 1015-hp Revuelto applies electric torque vectoring along y = -x² + 8x - 12.',
    difficulty: 'Pro',
    coefficients: { a: -1, b: 8, c: -12 }, // -(x - 2)(x - 6) = 0 => -x^2 + 8x - 12 = 0
    questionPrompt: 'With negative curvature (inverted parabola), determine the initial apex crossover and the high-speed exit gate.',
    realWorldContext: 'Equation: y = -x² + 8x - 12. Notice a = -1 (downward concavity). Be careful with signs when calculating roots!',
    unitX: 'meters through Becketts',
    unitY: 'lateral G-vector (G)',
  },

  // 5. Pro Circuit - Toyota Supra Turbo
  {
    id: 'supra_drift_2',
    carId: 'toyota_supra',
    title: 'Toyota Supra Turbo: Ebisu Minami Parabolic Drift Sweep',
    scenarioDescription:
      'At full 1.8 bar twin-turbo boost, the Supra sweeps through the Ebisu hairpin. Telemetry tracks lateral slip angle: y = 2x² - 8x + 6.',
    difficulty: 'Pro',
    coefficients: { a: 2, b: -8, c: 6 }, // 2(x^2 - 4x + 3) = 2(x - 1)(x - 3) = 0
    questionPrompt: 'Identify the entry drift initiation point x₁ and countersteer exit point x₂ where lateral slip angle returns to neutral.',
    realWorldContext: 'Equation: y = 2x² - 8x + 6. Note that coefficient a = 2, so the denominator in the quadratic formula is 2a = 4!',
    unitX: 'meters along transition',
    unitY: 'slip angle offset (deg)',
  },

  // 6. Pro Circuit - BMW M4 CSL
  {
    id: 'bmw_chicane_2',
    carId: 'bmw_m4',
    title: 'BMW M4 CSL: Spa-Francorchamps Bus Stop Chicane',
    scenarioDescription:
      'Heavy braking into the Spa Bus Stop Chicane produces a sharp directional shift modeled by y = x² - 2x + 5.',
    difficulty: 'Pro',
    coefficients: { a: 1, b: -2, c: 5 }, // Δ = 4 - 20 = -16 < 0 (No real roots!)
    questionPrompt: 'Evaluate the discriminant Δ to verify whether the M4’s trajectory crosses the inner rumble strip.',
    realWorldContext: 'Equation: y = x² - 2x + 5. The car stays entirely within track limits if the curve never intersects y = 0.',
    unitX: 'meters through chicane',
    unitY: 'rumble strip clearance (cm)',
  },

  // 7. Grand Prix - Mercedes-AMG GT Black Series
  {
    id: 'mercedes_gp_3',
    carId: 'mercedes_amg',
    title: 'Mercedes-AMG GT Black Series: Circuit de Spa Blanchimont',
    scenarioDescription:
      'Full-throttle 300 km/h sweep through Blanchimont. Aerodynamic telemetry models downforce lift balance: y = -2x² + 6x - 4.',
    difficulty: 'GrandPrix',
    coefficients: { a: -2, b: 6, c: -4 }, // -2(x^2 - 3x + 2) = -2(x - 1)(x - 2) = 0
    questionPrompt: 'Calculate the discriminant and both critical high-downforce threshold gates x₁ and x₂.',
    realWorldContext: 'Equation: y = -2x² + 6x - 4. Note: a = -2 (negative quadratic coefficient) and b = 6, c = -4.',
    unitX: 'meters of aero zone',
    unitY: 'downforce balance (kN)',
  },

  // 8. Grand Prix - Ferrari 488 Pista
  {
    id: 'ferrari_gp_3',
    carId: 'ferrari_488',
    title: 'Ferrari 488 Pista: Spa Eau Rouge Compression Apex',
    scenarioDescription:
      'Compression at the base of Eau Rouge. The suspension telemetry computer calculates the vertical load equation: y = 3x² - 12x + 9.',
    difficulty: 'GrandPrix',
    coefficients: { a: 3, b: -12, c: 9 }, // 3(x^2 - 4x + 3) = 0 => x = 1, x = 3
    questionPrompt: 'Derive the two compression equilibrium roots where suspension load equals baseline (y = 0).',
    realWorldContext: 'Equation: y = 3x² - 12x + 9. Watch out: a = 3, so denominator 2a = 6.',
    unitX: 'meters into Eau Rouge',
    unitY: 'suspension displacement (cm)',
  },
];

/**
 * Procedurally generates a fresh randomized problem adhering to realistic quadratic roots
 */
export function generateRandomProblem(
  carId: CarId,
  difficulty: 'Rookie' | 'Pro' | 'GrandPrix'
): TelemetryProblem {
  let a: number;
  let r1: number;
  let r2: number;
  let c: number;
  let b: number;

  const randInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  if (difficulty === 'Rookie') {
    // a = 1, simple distinct integers or perfect square
    a = 1;
    const isDouble = Math.random() < 0.25;
    if (isDouble) {
      r1 = randInt(-4, 5);
      r2 = r1;
    } else {
      r1 = randInt(-5, 3);
      r2 = r1 + randInt(1, 6);
    }
    b = -(r1 + r2);
    c = r1 * r2;
  } else if (difficulty === 'Pro') {
    // a can be -1 or 2, signs may alternate, or no real roots occasionally
    const noRoots = Math.random() < 0.2;
    if (noRoots) {
      a = Math.random() > 0.5 ? 1 : 2;
      b = randInt(-4, 4);
      c = Math.ceil((b * b) / (4 * a)) + randInt(1, 4); // ensures delta < 0
    } else {
      a = Math.random() > 0.5 ? -1 : 2;
      r1 = randInt(-4, 4);
      r2 = r1 + randInt(1, 5);
      b = -a * (r1 + r2);
      c = a * (r1 * r2);
    }
  } else {
    // Grand Prix: a in {-2, 3, -3}, interesting numbers
    const aOptions = [-2, 2, 3, -3];
    a = aOptions[Math.floor(Math.random() * aOptions.length)];
    const noRoots = Math.random() < 0.25;
    if (noRoots) {
      b = randInt(-6, 6);
      if (a > 0) {
        c = Math.ceil((b * b) / (4 * a)) + randInt(1, 3);
      } else {
        c = Math.floor((b * b) / (4 * a)) - randInt(1, 3);
      }
    } else {
      r1 = randInt(-3, 3);
      r2 = r1 + randInt(1, 4);
      b = -a * (r1 + r2);
      c = a * (r1 * r2);
    }
  }

  // Format equation nicely
  const signB = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
  const signC = c >= 0 ? `+ ${c}` : `- ${Math.abs(c)}`;
  const aStr = a === 1 ? '' : a === -1 ? '-' : `${a}`;
  const eq = `${aStr}x² ${b !== 0 ? `${signB}x ` : ''}${c !== 0 ? `${signC} ` : ''}= 0`;

  const titles = [
    'Telemetry Apex Tuning Gate',
    'High-Speed Aerodynamic Trajectory',
    'Corner Exit Slingshot Calculation',
    'Track Limit Margin Optimization',
    'Braking Zone Boundary Envelope',
    'Turbulent Wake Bypass Arc',
  ];

  const randomTitle = titles[Math.floor(Math.random() * titles.length)];

  return {
    id: `dyn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    carId,
    title: `${randomTitle}`,
    scenarioDescription: `The telemetry computer receives real-time track sensor readings modeling the vehicle path as: ${eq}. Solve the pit stop diagnostic sequence.`,
    difficulty,
    coefficients: { a, b, c },
    questionPrompt: 'Verify telemetry coefficients, calculate the discriminant Δ, and compute the trajectory boundary roots.',
    realWorldContext: `Live Formula: ${eq}. Ensure precision in signage and formula denominator.`,
    unitX: 'track meters',
    unitY: 'lateral offset (m)',
  };
}
