/**
 * Calculates the least common multiple (LCM) of two numbers.
 * @param a
 * @param b
 * @returns
 */
export function lcm<N extends bigint | number>(a: N, b: N): N {
	if (a === Number.MIN_VALUE || a == 0) return b as N;
	if (b === Number.MIN_VALUE || b == 0) return a as N;

	if (typeof a === "bigint") return bigintLCM(BigInt(a), BigInt(b)) as N;

	return lcmNonIntegers(a.toString(), b.toString()) as N;
}

/**
 * Calculates the greatest common divisor (GCD) of two numbers using the Euclidean algorithm.
 */
function bigintGCD(a: bigint, b: bigint): bigint {
	while (b !== 0n) {
		[a, b] = [b, a % b];
	}
	return a;
}

/**
 * Calculates the least common multiple (LCM) of two numbers.
 */
function bigintLCM(a: bigint, b: bigint) {
	return (a * b) / bigintGCD(a, b);
}

/**
 * Converts a decimal string to a fraction represented as a tuple of two bigints (numerator, denominator).
 * @param decimalStr Eg "0.75" or "1.5"
 * @returns A tuple where the first element is the numerator and the second element is the denominator.
 *
 * @example "0.75" -> [3n, 4n]
 */
function decimalToFraction(decimalStr: string): [bigint, bigint] {
	// Handle e-notation
	if (decimalStr.includes("e")) {
		const [base, exponent] = decimalStr.split("e");
		if (!base || !exponent)
			throw new Error(`Invalid number string: ${decimalStr}`);

		// get the fractional representation of the base
		const baseFraction = decimalToFraction(base);

		// the part after the 'e' is the exponent.
		// may be negative or positive
		const exponentValue = BigInt(exponent);

		// if the exponent is negative we scale the denominator up
		// if the exponent is positive we scale the numerator up
		if (exponentValue < 0n) {
			baseFraction[1] *= 10n ** -exponentValue; // Scale denominator
		} else {
			baseFraction[0] *= 10n ** exponentValue; // Scale numerator
		}

		return baseFraction;
	}

	// handle integers directly
	if (!decimalStr.includes(".")) return [BigInt(decimalStr), 1n];

	// Handle numbers with decimal points
	const parts = decimalStr.split(".");
	const intPart = parts[0];
	const fracPart = parts[1] ?? "";
	const scale = 10n ** BigInt(fracPart.length);
	const numerator = BigInt(intPart + fracPart);
	const denominator = scale;

	const divisor = bigintGCD(numerator, denominator);
	return [numerator / divisor, denominator / divisor];
}

/**
 *
 * @param aStr
 * @param bStr
 * @returns
 */
function lcmNonIntegers(aStr: string, bStr: string) {
	// Convert to fractions
	const [numA, denA] = decimalToFraction(aStr);
	const [numB, denB] = decimalToFraction(bStr);

	// Find LCM of denominators
	const lcmDen = bigintLCM(denA, denB);

	// Convert both numbers to integer equivalents
	const A = numA * (lcmDen / denA);
	const B = numB * (lcmDen / denB);

	// Find integer LCM
	const lcmInt = bigintLCM(A, B);

	// Divide back to get final result
	const result = Number(lcmInt) / Number(lcmDen);
	return Number(result.toString());
}
