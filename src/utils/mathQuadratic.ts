import { QuadraticCoefficients, QuadraticAnalysis } from '../types/telemetry';

export function analyzeQuadratic(coefs: QuadraticCoefficients): QuadraticAnalysis {
  const { a, b, c } = coefs;
  const discriminant = b * b - 4 * a * c;
  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;
  const yIntercept = c;
  const axisOfSymmetry = vertexX;

  let rootType: 'two_real' | 'one_real' | 'no_real' = 'no_real';
  const roots: number[] = [];

  const EPS = 1e-9;
  if (discriminant > EPS) {
    rootType = 'two_real';
    const sqrtDisc = Math.sqrt(discriminant);
    const r1 = (-b + sqrtDisc) / (2 * a);
    const r2 = (-b - sqrtDisc) / (2 * a);
    roots.push(Number(Math.min(r1, r2).toFixed(3)));
    roots.push(Number(Math.max(r1, r2).toFixed(3)));
  } else if (Math.abs(discriminant) <= EPS) {
    rootType = 'one_real';
    roots.push(Number(vertexX.toFixed(3)));
  } else {
    rootType = 'no_real';
  }

  // Formatting equation string
  const termA = a === 1 ? 'x²' : a === -1 ? '-x²' : `${a}x²`;
  let termB = '';
  if (b !== 0) {
    if (b > 0) {
      termB = b === 1 ? ' + x' : ` + ${b}x`;
    } else {
      termB = b === -1 ? ' - x' : ` - ${Math.abs(b)}x`;
    }
  }
  let termC = '';
  if (c !== 0) {
    termC = c > 0 ? ` + ${c}` : ` - ${Math.abs(c)}`;
  }
  const equationStr = `${termA}${termB}${termC} = 0`;

  // Vertex form: a(x - h)² + k
  const h = Number(vertexX.toFixed(2));
  const k = Number(vertexY.toFixed(2));
  const hSign = h >= 0 ? `- ${h}` : `+ ${Math.abs(h)}`;
  const kSign = k >= 0 ? `+ ${k}` : `- ${Math.abs(k)}`;
  const aPrefix = a === 1 ? '' : a === -1 ? '-' : `${a}`;
  const vertexFormStr = `f(x) = ${aPrefix}(x ${hSign})² ${kSign}`;

  // Factored form if real roots exist
  let factoredFormStr: string | null = null;
  if (roots.length === 2) {
    const r1 = roots[0];
    const r2 = roots[1];
    const r1Str = r1 >= 0 ? `- ${r1}` : `+ ${Math.abs(r1)}`;
    const r2Str = r2 >= 0 ? `- ${r2}` : `+ ${Math.abs(r2)}`;
    factoredFormStr = `f(x) = ${aPrefix}(x ${r1Str})(x ${r2Str})`;
  } else if (roots.length === 1) {
    const r1 = roots[0];
    const r1Str = r1 >= 0 ? `- ${r1}` : `+ ${Math.abs(r1)}`;
    factoredFormStr = `f(x) = ${aPrefix}(x ${r1Str})²`;
  }

  return {
    a,
    b,
    c,
    discriminant,
    vertexX: Number(vertexX.toFixed(3)),
    vertexY: Number(vertexY.toFixed(3)),
    yIntercept,
    axisOfSymmetry: Number(axisOfSymmetry.toFixed(3)),
    rootType,
    roots,
    concavity: a > 0 ? 'upward' : 'downward',
    equationStr,
    vertexFormStr,
    factoredFormStr,
  };
}

export function evaluateQuadratic(coefs: QuadraticCoefficients, x: number): number {
  return coefs.a * x * x + coefs.b * x + coefs.c;
}

export function evaluateDerivative(coefs: QuadraticCoefficients, x: number): number {
  return 2 * coefs.a * x + coefs.b;
}

/**
 * Diagnostic analysis for Step 1: Coefficients
 */
export function diagnoseCoefficients(
  user: { a: number | null; b: number | null; c: number | null },
  target: QuadraticCoefficients,
  lang: 'es' | 'en'
): { isCorrect: boolean; message: string; diagnosticType: 'sign_b' | 'none'; details?: string } {
  if (user.a === null || user.b === null || user.c === null) {
    return {
      isCorrect: false,
      message: lang === 'es' ? 'Faltan parámetros de telemetría por ingresar.' : 'Missing telemetry parameters.',
      diagnosticType: 'none',
    };
  }

  if (user.a === target.a && user.b === target.b && user.c === target.c) {
    return {
      isCorrect: true,
      message:
        lang === 'es'
          ? '¡Telemetría verificada! Los coeficientes a, b y c corresponden exactamente a la trayectoria del vehículo.'
          : 'Telemetry verified! Coefficients a, b, and c match the vehicle trajectory precisely.',
      diagnosticType: 'none',
    };
  }

  // Check specific sign traps
  if (user.a === target.a && user.b === -target.b && target.b !== 0) {
    return {
      isCorrect: false,
      message:
        lang === 'es'
          ? `¡Alerta de telemetría en curva! Revisa el signo de b: en la ecuación el término lineal es ${target.b > 0 ? '+' : ''}${target.b}x, por lo que b = ${target.b}, no ${user.b}.`
          : `Apex telemetry alert! Check your sign on b: the linear term is ${target.b > 0 ? '+' : ''}${target.b}x, so b = ${target.b}, not ${user.b}.`,
      diagnosticType: 'sign_b',
    };
  }

  if (user.a === -target.a) {
    return {
      isCorrect: false,
      message:
        lang === 'es'
          ? `Alerta de aerodinámica: la concavidad requiere a = ${target.a}. Cuidado con el signo negativo del coeficiente cuadrático.`
          : `Aerodynamics warning: Curvature requires a = ${target.a}. Watch the negative sign on the quadratic term.`,
      diagnosticType: 'none',
    };
  }

  return {
    isCorrect: false,
    message:
      lang === 'es'
        ? `Valores incorrectos. Recuerda: a acompaña a x², b acompaña a x, y c es el término independiente (elevación inicial).`
        : `Incorrect values. Remember: a is before x², b is before x, and c is the constant term (starting elevation).`,
    diagnosticType: 'none',
  };
}

/**
 * Diagnostic analysis for Step 2: Discriminant
 */
export function diagnoseDiscriminant(
  userDisc: number | null,
  userRootType: string | null,
  target: QuadraticCoefficients,
  lang: 'es' | 'en'
): {
  isCorrect: boolean;
  message: string;
  diagnosticType: 'sign_4ac' | 'square_negative' | 'none';
  details?: string;
} {
  const { a, b, c } = target;
  const trueDisc = b * b - 4 * a * c;

  if (userDisc === null) {
    return {
      isCorrect: false,
      message: lang === 'es' ? 'Ingresa el valor calculado del discriminante Δ.' : 'Enter your calculated discriminant Δ.',
      diagnosticType: 'none',
    };
  }

  // Did the user treat (-b)^2 as negative? i.e. - (b^2) - 4ac
  const wrongSquare = -Math.abs(b * b) - 4 * a * c;
  if (userDisc === wrongSquare && b < 0) {
    return {
      isCorrect: false,
      message:
        lang === 'es'
          ? `¡Trampa clásica de pit-stop! Al elevar un número negativo al cuadrado, siempre resulta positivo: (${b})² = ${b * b}, ¡no -${b * b}!`
          : `Classic pit-stop trap! Squaring a negative number always yields a positive: (${b})² = ${b * b}, not -${b * b}!`,
      diagnosticType: 'square_negative',
    };
  }

  // Did the user mess up the subtraction of 4ac? (e.g. b^2 + 4ac)
  const wrongSign4ac = b * b + 4 * a * c;
  if (userDisc === wrongSign4ac && a * c !== 0) {
    return {
      isCorrect: false,
      message:
        lang === 'es'
          ? `¡Cuidado con la trampa de frenado en -4ac! La fórmula es b² - 4ac. Como 4ac = ${4 * a * c}, al restar obtienes ${b * b} - (${4 * a * c}) = ${trueDisc}.`
          : `Watch the braking sign trap on -4ac! The formula is b² - 4ac. Since 4ac = ${4 * a * c}, subtracting gives ${b * b} - (${4 * a * c}) = ${trueDisc}.`,
      diagnosticType: 'sign_4ac',
    };
  }

  if (userDisc !== trueDisc) {
    return {
      isCorrect: false,
      message:
        lang === 'es'
          ? `El valor de Δ = ${userDisc} no coincide. Desglose del sensor: b² = (${b})² = ${b * b}, y 4ac = 4·(${a})·(${c}) = ${4 * a * c}. Por tanto Δ = ${b * b} - (${4 * a * c}) = ${trueDisc}.`
          : `Discriminant Δ = ${userDisc} is incorrect. Sensor breakdown: b² = (${b})² = ${b * b}, and 4ac = 4·(${a})·(${c}) = ${4 * a * c}. Thus Δ = ${b * b} - (${4 * a * c}) = ${trueDisc}.`,
      diagnosticType: 'none',
    };
  }

  // Check root nature selection if provided
  let expectedType = 'two_real';
  if (trueDisc === 0) expectedType = 'one_real';
  if (trueDisc < 0) expectedType = 'no_real';

  if (userRootType && userRootType !== expectedType) {
    return {
      isCorrect: false,
      message:
        lang === 'es'
          ? `Calculaste bien Δ = ${trueDisc}, pero la conclusión de trayectoria es errónea. ` +
            (trueDisc > 0
              ? 'Como Δ > 0, el auto cruza el eje en DOS puntos reales (2 raíces).'
              : trueDisc === 0
              ? 'Como Δ = 0, el auto hace un toque tangente perfecto (1 raíz doble).'
              : 'Como Δ < 0, la trayectoria no toca el asfalto (0 raíces reales / no cruza el eje).')
          : `Δ = ${trueDisc} is correct, but your trajectory conclusion is off. ` +
            (trueDisc > 0
              ? 'Since Δ > 0, the car intersects the track at TWO real points (2 roots).'
              : trueDisc === 0
              ? 'Since Δ = 0, the car grazes the apex tangent (1 double root).'
              : 'Since Δ < 0, trajectory is airborne or clears the track (0 real roots).'),
      diagnosticType: 'none',
    };
  }

  return {
    isCorrect: true,
    message:
      lang === 'es'
        ? `¡Discriminante calibrado con éxito! Δ = ${trueDisc} confirma ${
            trueDisc > 0
              ? 'dos intersecciones de pista reales (2 raíces).'
              : trueDisc === 0
              ? 'un ápice tangente único en la pista (1 raíz doble).'
              : 'trayectoria aérea sin cruce de pista (sin raíces reales).'
          }`
        : `Discriminant calibrated successfully! Δ = ${trueDisc} confirms ${
            trueDisc > 0
              ? 'two real track intersections (2 roots).'
              : trueDisc === 0
              ? 'a single apex tangent point on the track (1 double root).'
              : 'trajectory clears track with zero real roots.'
          }`,
    diagnosticType: 'none',
  };
}

/**
 * Diagnostic analysis for Step 3: Roots
 */
export function diagnoseRoots(
  userR1: number | null,
  userR2: number | null,
  userHasNoRoots: boolean,
  target: QuadraticCoefficients,
  lang: 'es' | 'en'
): {
  isCorrect: boolean;
  message: string;
  diagnosticType: 'sign_b' | 'denom_2a' | 'sqrt_error' | 'none';
  details?: string;
} {
  const { a, b, c } = target;
  const discriminant = b * b - 4 * a * c;

  // Case 1: No real roots
  if (discriminant < 0) {
    if (userHasNoRoots) {
      return {
        isCorrect: true,
        message:
          lang === 'es'
            ? '¡Correcto! Como Δ < 0, la raíz cuadrada de un número negativo no existe en los números reales. La trayectoria no toca la línea de meta.'
            : 'Correct! Since Δ < 0, the square root of a negative number has no real solution. The trajectory clears the finish line without intersection.',
        diagnosticType: 'none',
      };
    } else {
      return {
        isCorrect: false,
        message:
          lang === 'es'
            ? `¡Alerta de telemetría! Como Δ = ${discriminant} < 0, esta ecuación NO tiene soluciones reales en el asfalto. Marca la casilla "Sin soluciones reales".`
            : `Telemetry alert! Since Δ = ${discriminant} < 0, this equation has NO real roots. Select "No real roots".`,
        diagnosticType: 'none',
      };
    }
  }

  if (userHasNoRoots) {
    return {
      isCorrect: false,
      message:
        lang === 'es'
          ? `¡Alto en pits! Δ = ${discriminant} ≥ 0, por lo que SÍ existen raíces reales para esta trayectoria.`
          : `Pit stop alert! Δ = ${discriminant} ≥ 0, which means real roots DO exist for this trajectory.`,
      diagnosticType: 'none',
    };
  }

  // Case 2: One double root
  if (discriminant === 0) {
    const trueRoot = Number((-b / (2 * a)).toFixed(2));
    if (userR1 === null) {
      return {
        isCorrect: false,
        message: lang === 'es' ? 'Ingresa el valor de la raíz única x.' : 'Enter the value of single root x.',
        diagnosticType: 'none',
      };
    }

    // Check sign of -b error
    const wrongSignRoot = Number((b / (2 * a)).toFixed(2));
    if (Math.abs(userR1 - wrongSignRoot) < 0.05 && b !== 0) {
      return {
        isCorrect: false,
        message:
          lang === 'es'
            ? `¡Revisa el ángulo de dirección! -b debe ser ${-b} (porque b = ${b}). Tu resultado tiene el signo invertido.`
            : `Check your steering angle: -b should be ${-b} (since b = ${b}). Your result has the opposite sign.`,
        diagnosticType: 'sign_b',
      };
    }

    if (Math.abs(userR1 - trueRoot) < 0.05) {
      return {
        isCorrect: true,
        message:
          lang === 'es'
            ? `¡Perfecto! Raíz doble x = ${trueRoot}. El vehículo toca exactamente el vértice de la curva.`
            : `Perfect! Double root x = ${trueRoot}. The car touches precisely at the curve vertex.`,
        diagnosticType: 'none',
      };
    }

    return {
      isCorrect: false,
      message:
        lang === 'es'
          ? `Cálculo inexacto. Como Δ = 0, x = -b / (2a) = -(${b}) / (2·${a}) = ${trueRoot}.`
          : `Inaccurate calculation. Since Δ = 0, x = -b / (2a) = -(${b}) / (2·${a}) = ${trueRoot}.`,
      diagnosticType: 'none',
    };
  }

  // Case 3: Two distinct roots
  const sqrtDisc = Math.sqrt(discriminant);
  const r1 = Number(((-b - sqrtDisc) / (2 * a)).toFixed(2));
  const r2 = Number(((-b + sqrtDisc) / (2 * a)).toFixed(2));
  const trueMin = Math.min(r1, r2);
  const trueMax = Math.max(r1, r2);

  if (userR1 === null || userR2 === null) {
    return {
      isCorrect: false,
      message:
        lang === 'es'
          ? 'Ingresa ambas raíces x₁ y x₂ calculadas con la fórmula cuadrática.'
          : 'Enter both roots x₁ and x₂ calculated via the quadratic formula.',
      diagnosticType: 'none',
    };
  }

  const uMin = Math.min(userR1, userR2);
  const uMax = Math.max(userR1, userR2);

  // Check sign error in -b
  // Suppose user used +b instead of -b: (b +- sqrtDisc)/(2a)
  const wrongSignR1 = Number(((b - sqrtDisc) / (2 * a)).toFixed(2));
  const wrongSignR2 = Number(((b + sqrtDisc) / (2 * a)).toFixed(2));
  const wrongMin = Math.min(wrongSignR1, wrongSignR2);
  const wrongMax = Math.max(wrongSignR1, wrongSignR2);

  if (Math.abs(uMin - wrongMin) < 0.05 && Math.abs(uMax - wrongMax) < 0.05 && b !== 0) {
    return {
      isCorrect: false,
      message:
        lang === 'es'
          ? `¡Alerta de telemetría! ¡Error en el signo de -b! Si b = ${b}, entonces -b es ${-b > 0 ? '+' : ''}${-b}. Recuerda cambiar el signo de b al inicio del numerador.`
          : `Telemetry alert! Sign error in -b! Since b = ${b}, -b must be ${-b > 0 ? '+' : ''}${-b}. Remember to invert the sign of b in the numerator!`,
      diagnosticType: 'sign_b',
    };
  }

  // Check denominator error: divided by a instead of 2a
  const wrongDenomR1 = Number(((-b - sqrtDisc) / a).toFixed(2));
  const wrongDenomR2 = Number(((-b + sqrtDisc) / a).toFixed(2));
  const wDMin = Math.min(wrongDenomR1, wrongDenomR2);
  const wDMax = Math.max(wrongDenomR1, wrongDenomR2);

  if (Math.abs(uMin - wDMin) < 0.05 && Math.abs(uMax - wDMax) < 0.05 && a !== 1) {
    return {
      isCorrect: false,
      message:
        lang === 'es'
          ? `¡Cuidado en los pits con el denominador! El denominador es 2a = 2·(${a}) = ${2 * a}, ¡no simplemente a!`
          : `Watch the denominator in the pit lane! The denominator is 2a = 2·(${a}) = ${2 * a}, not simply a!`,
      diagnosticType: 'denom_2a',
    };
  }

  // Check correct match
  if (Math.abs(uMin - trueMin) < 0.05 && Math.abs(uMax - trueMax) < 0.05) {
    return {
      isCorrect: true,
      message:
        lang === 'es'
          ? `¡Curva conquistada! Ambas raíces coinciden: x₁ = ${trueMin}, x₂ = ${trueMax}. La computadora de a bordo confirma la trayectoria ideal.`
          : `Apex conquered! Both roots verified: x₁ = ${trueMin}, x₂ = ${trueMax}. On-board telemetry confirms ideal racing line.`,
      diagnosticType: 'none',
    };
  }

  return {
    isCorrect: false,
    message:
      lang === 'es'
        ? `Las raíces no coinciden. Fórmula: x = [-(${b}) ± √${discriminant}] / (2·${a}) = [${-b} ± ${Number(sqrtDisc.toFixed(2))}] / ${2 * a}. Raíces correctas: ${trueMin} y ${trueMax}.`
        : `Roots do not match. Formula: x = [-(${b}) ± √${discriminant}] / (2·${a}) = [${-b} ± ${Number(sqrtDisc.toFixed(2))}] / ${2 * a}. Target roots: ${trueMin} and ${trueMax}.`,
    diagnosticType: 'none',
  };
}

/**
 * Generates step-by-step mathematical proof / derivation for performance report
 */
export function generateMathematicalProof(
  coefs: QuadraticCoefficients,
  lang: 'es' | 'en'
): {
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  conclusion: string;
} {
  const { a, b, c } = coefs;
  const analysis = analyzeQuadratic(coefs);
  const d = analysis.discriminant;

  if (lang === 'es') {
    return {
      step1: `Identificación de coeficientes estándar (ax² + bx + c = 0):\n• a = ${a} (curvatura y aceleración)\n• b = ${b} (desvío lateral / ángulo)\n• c = ${c} (elevación inicial)`,
      step2: `Cálculo riguroso del Discriminante Δ = b² - 4ac:\nΔ = (${b})² - 4·(${a})·(${c})\nΔ = ${b * b} - (${4 * a * c}) = ${d}`,
      step3: `Análisis de la naturaleza de la trayectoria según Δ:\n${
        d > 0
          ? `Como Δ = ${d} > 0, existen DOS raíces reales distintas (la trayectoria corta el eje dos veces).`
          : d === 0
          ? `Como Δ = 0, existe UNA raíz real doble (el vehículo roza el asfalto en el vértice de la curva).`
          : `Como Δ = ${d} < 0, NO existen raíces reales (la parábola no corta el eje en los reales, trayectoria aérea o libre).`
      }`,
      step4:
        d >= 0
          ? `Aplicación de la Fórmula General x = [-b ± √Δ] / (2a):\nx = [-(${b}) ± √${d}] / [2·(${a})]\nx = [${-b} ± ${Number(Math.sqrt(d).toFixed(3))}] / ${2 * a}\nRaíces calculadas: ${analysis.roots.join(', ')}`
          : `Como Δ = ${d} < 0, √(${d}) ∉ ℝ. No se producen cortes con el eje horizontal.`,
      conclusion: `Vértice de máxima compresión / altura: V(${analysis.vertexX}, ${analysis.vertexY}). Eje de simetría: x = ${analysis.axisOfSymmetry}.`,
    };
  }

  return {
    step1: `Telemetry coefficient identification (ax² + bx + c = 0):\n• a = ${a} (downforce / curvature)\n• b = ${b} (lateral steering drift)\n• c = ${c} (initial elevation)`,
    step2: `Discriminant derivation Δ = b² - 4ac:\nΔ = (${b})² - 4·(${a})·(${c})\nΔ = ${b * b} - (${4 * a * c}) = ${d}`,
    step3: `Trajectory classification via Δ:\n${
      d > 0
        ? `Since Δ = ${d} > 0, there are TWO distinct real roots (intersects track twice).`
        : d === 0
        ? `Since Δ = 0, exactly ONE real double root exists (trajectory grazes apex tangent).`
        : `Since Δ = ${d} < 0, NO real roots exist in ℝ (trajectory clears ground plane entirely).`
    }`,
    step4:
      d >= 0
        ? `Application of Quadratic Formula x = [-b ± √Δ] / (2a):\nx = [-(${b}) ± √${d}] / [2·(${a})]\nx = [${-b} ± ${Number(Math.sqrt(d).toFixed(3))}] / ${2 * a}\nRoots: ${analysis.roots.join(', ')}`
        : `Since Δ = ${d} < 0, √(${d}) ∉ ℝ. No horizontal ground intersections.`,
    conclusion: `Trajectory vertex apex: V(${analysis.vertexX}, ${analysis.vertexY}). Axis of symmetry: x = ${analysis.axisOfSymmetry}.`,
  };
}
