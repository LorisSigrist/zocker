import * as z from "zod/v4/core";
import { faker } from "@faker-js/faker";
import { Generator } from "../generate.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";
import { InvalidSchemaException } from "../exceptions.js";

const generate_bigint: Generator<z.$ZodBigInt> = (bigint_schema, ctx) => {
	const multiple_of_checks =
		bigint_schema._zod.def.checks?.filter(
			(c) => c instanceof z.$ZodCheckMultipleOf
		) ?? [];

	const min_checks =
		bigint_schema._zod.def.checks?.filter(
			(c) => c instanceof z.$ZodCheckGreaterThan
		) ?? [];
	const max_checks =
		bigint_schema._zod.def.checks?.filter(
			(c) => c instanceof z.$ZodCheckLessThan
		) ?? [];

	const min = min_checks.reduce((acc, check) => {
		const min = check._zod.def.value as bigint;
		return min > acc ? min : acc;
	}, BigInt(Number.MIN_SAFE_INTEGER));

	const max = max_checks.reduce((acc, check) => {
		const max = check._zod.def.value as bigint;
		return max < acc ? max : acc;
	}, BigInt(Number.MAX_SAFE_INTEGER));

	const multipleof = multiple_of_checks.reduce((acc, check) => {
		const multipleOf = check._zod.def.value as bigint;
		return lcm(acc, multipleOf);
	}, 1n);

	let value = faker.number.bigInt({ min, max });
	const next_larger_multiple = value + (multipleof - (value % multipleof));
	const next_smaller_multiple = value - (value % multipleof);

	if (next_larger_multiple <= max) value = next_larger_multiple;
	else if (next_smaller_multiple >= min) value = next_smaller_multiple;
	else
		throw new InvalidSchemaException(
			"Cannot generate a valid BigInt that satisfies the constraints"
		);

	return value;
};

function lcm(a: bigint, b: bigint) {
	return (a * b) / gcd(a, b);
}

function gcd(a: bigint, b: bigint): bigint {
	if (b === 0n) return a;
	return gcd(b, a % b);
}

export const BigintGenerator: InstanceofGeneratorDefinition<z.$ZodBigInt> = {
	schema: z.$ZodBigInt as any,
	generator: generate_bigint,
	match: "instanceof"
};
