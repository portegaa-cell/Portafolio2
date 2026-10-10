import { SportsCar, CarId } from '../types/telemetry';

export const SPORTS_CARS: SportsCar[] = [
  {
    id: 'ferrari_488',
    name: 'Ferrari 488 Pista',
    manufacturer: 'Ferrari',
    classTag: 'V8 Twin-Turbo Supercar',
    horsepower: 720,
    topSpeedKmh: 340,
    acceleration0to100: 2.85,
    signatureColor: '#ef4444', // Rosso Corsa Red
    secondaryColor: '#f59e0b',
    tagline: 'Precision Braking Dynamics & S-Duct Downforce',
    description: 'Bred directly from FIA WEC racing, utilizing parabolic braking trajectories and aggressive vortex downforce.',
    idealCurvatureRole: 'Braking distance and apex turn-in modeling with negative concavity deceleration arcs.',
  },
  {
    id: 'lambo_revuelto',
    name: 'Lamborghini Revuelto',
    manufacturer: 'Lamborghini',
    classTag: 'V12 HPEV Hybrid Hypercar',
    horsepower: 1015,
    topSpeedKmh: 350,
    acceleration0to100: 2.5,
    signatureColor: '#eab308', // Giallo Inti Yellow / Gold
    secondaryColor: '#f97316',
    tagline: 'Extreme Thrust Curve & Active Aerofoil Vectoring',
    description: 'Tri-motor hybrid architecture delivering instantaneous torque and hyperbolic corner exits.',
    idealCurvatureRole: 'High-downforce parabolic slingshots and rapid lateral acceleration gates.',
  },
  {
    id: 'porsche_gt3',
    name: 'Porsche 911 GT3 RS',
    manufacturer: 'Porsche',
    classTag: 'Naturally Aspirated Track Weapon',
    horsepower: 525,
    topSpeedKmh: 296,
    acceleration0to100: 3.2,
    signatureColor: '#10b981', // Lizard / Signal Green
    secondaryColor: '#06b6d4',
    tagline: 'Apex Perfectionist & DRS Airfoil Trajectory',
    description: 'Generates 860 kg of downforce at 285 km/h, clinging to the racing line like an authentic mathematical parabola.',
    idealCurvatureRole: 'High lateral grip sweeps and precise vertex apex compression.',
  },
  {
    id: 'nissan_gtr',
    name: 'Nissan GT-R Nismo (R35)',
    manufacturer: 'Nissan',
    classTag: 'Twin-Turbo AWD Godzilla',
    horsepower: 600,
    topSpeedKmh: 330,
    acceleration0to100: 2.7,
    signatureColor: '#06b6d4', // Bayside Neon Blue
    secondaryColor: '#ef4444',
    tagline: 'ATTESA E-TS All-Wheel Steering Vectoring',
    description: 'Telemetry masterclass with computer-regulated torque split executing complex obstacle avoidance parabolas.',
    idealCurvatureRole: 'Obstacle avoidance curves, dynamic chicane evasion, and twin-root runway passes.',
  },
  {
    id: 'bmw_m4',
    name: 'BMW M4 CSL',
    manufacturer: 'BMW M',
    classTag: 'Inline-6 TwinPower Lightweight',
    horsepower: 550,
    topSpeedKmh: 307,
    acceleration0to100: 3.7,
    signatureColor: '#6366f1', // Frozen Brooklyn Grey / Indigo
    secondaryColor: '#ec4899',
    tagline: 'Nürburgring Ringmeister Apex Precision',
    description: 'Laser-tuned chassis geometry optimized for hairpins, negative camber transitions, and symmetrical exit sweeps.',
    idealCurvatureRole: 'Symmetrical slalom arcs and axis-of-symmetry trajectory balancing.',
  },
  {
    id: 'mercedes_amg',
    name: 'Mercedes-AMG GT Black Series',
    manufacturer: 'Mercedes-AMG',
    classTag: 'Flat-Plane Crank V8 Track Monster',
    horsepower: 730,
    topSpeedKmh: 325,
    acceleration0to100: 3.2,
    signatureColor: '#f97316', // Magmabeam Orange
    secondaryColor: '#eab308',
    tagline: 'Carbon Aero Wings & Downforce Trajectories',
    description: 'Adjustable dual-plane rear wing producing parabolic aerodynamic pressure profiles through continuous sweeping turns.',
    idealCurvatureRole: 'High-speed sweeping arcs and parabolic decelerations with wide root spreads.',
  },
  {
    id: 'toyota_supra',
    name: 'Toyota Supra Turbo (Mk4)',
    manufacturer: 'Toyota',
    classTag: '2JZ-GTE Sequential Twin-Turbo Legend',
    horsepower: 600, // Tuned spec
    topSpeedKmh: 310,
    acceleration0to100: 3.4,
    signatureColor: '#ec4899', // Midnight Purple / Hot Fuchsia
    secondaryColor: '#06b6d4',
    tagline: 'Boost Curve Surge & High-RPM Drift Arcs',
    description: 'Iconic boost delivery modeled mathematically: exponential build up to a quadratic maximum boost ceiling.',
    idealCurvatureRole: 'Parabolic quarter-mile acceleration profiles and drift angle transitions.',
  },
];

export function getCarById(id: CarId): SportsCar {
  return SPORTS_CARS.find((c) => c.id === id) || SPORTS_CARS[0];
}
