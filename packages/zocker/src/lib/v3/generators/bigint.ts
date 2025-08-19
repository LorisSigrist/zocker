import { faker } from "@faker-js/faker";
import { Generator } from "../generate.js";
import { z } from "zod/v3";
import { InstanceofGeneratorDefinition } from "../zocker.js";
import { InvalidSchemaException } from "../exceptions.js";

const generate_bigint: Generator<z.ZodBigInt> = (bigint_schema, ctx) => {
	const multiple_of_checks = get_bigint_checks(bigint_schema, "multipleOf");

	const min_checks = get_bigint_checks(bigint_schema, "min");
	const max_checks = get_bigint_checks(bigint_schema, "max");

	const min = min_checks.reduce((acc, check) => {
		if (check.value > acc) {
			return check.value;
		}
		return acc;
	}, BigInt(Number.MIN_SAFE_INTEGER));

	const max = max_checks.reduce((acc, check) => {
		if (check.value < acc) {
			return check.value;
		}
		return acc;
	}, BigInt(Number.MAX_SAFE_INTEGER));

	const multipleof = multiple_of_checks.reduce((acc, check) => {
		return lcm(acc, check.value);
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

function get_bigint_checks<Kind extends z.ZodBigIntCheck["kind"]>(
	schema: z.ZodBigInt,
	kind: Kind
): Extract<z.ZodBigIntCheck, { kind: Kind }>[] {
	return schema._def.checks.filter((check) => check.kind === kind) as Extract<
		z.ZodBigIntCheck,
		{ kind: Kind }
	>[];
}

function lcm(a: bigint, b: bigint) {
	return (a * b) / gcd(a, b);
}

function gcd(a: bigint, b: bigint): bigint {
	if (b === 0n) return a;
	return gcd(b, a % b);
}

export const BigintGenerator: InstanceofGeneratorDefinition<z.ZodBigInt> = {
	schema: z.ZodBigInt as any,
	generator: generate_bigint,
	match: "instanceof"
};
