import * as z from "zod/v4/core";
import { z as z4 } from "zod/v4";
import { faker } from "@faker-js/faker";
import { InstanceofGeneratorDefinition } from "../zocker.js";
import { Generator } from "../generate.js";
import { lcm } from "../utils/lcm.js";
import { InvalidSchemaException } from "../exceptions.js";
import { SemanticFlag } from "../semantics.js";

export type NumberGeneratorOptions = {
	extreme_value_chance: number;
};

/**
 * Represents a minimum/maximum boundary for a number.
 * Format: `[number, is_inclusive]`
 *
 * Example: `[10, true]`
 */
type Boundary = [number, boolean];

const generate_number: Generator<z.$ZodNumber> = (number_schema, ctx) => {
	try {
		//Generate semantically meaningful number
		let proposed_number = NaN;

		const semantic_generators: {
			[flag in SemanticFlag]?: () => number;
		} = {
			age: () => faker.number.int({ min: 0, max: 120 }),
			year: () => faker.number.int({ min: 1200, max: 3000 }),
			month: () => faker.number.int({ min: 1, max: 12 }),
			"day-of-the-month": () => faker.number.int({ min: 1, max: 31 }),
			hour: () => faker.number.int({ min: 0, max: 23 }),
			minute: () => faker.number.int({ min: 0, max: 59 }),
			second: () => faker.number.int({ min: 0, max: 59 }),
			millisecond: () => faker.number.int({ min: 0, max: 999 }),
			weekday: () => faker.number.int({ min: 0, max: 6 })
		};

		const generator = semantic_generators[ctx.semantic_context];
		if (!generator)
			throw new Error(
				"No generator found for semantic context - Falling back to random number"
			);

		proposed_number = generator();

		const result = number_schema["~standard"].validate(proposed_number);
		if ("then" in result) throw new Error();
		if (result.issues) throw new Error();
		return result.value;
	} catch (e) {}

	let is_extreme_value = faker.datatype.boolean({
		probability: ctx.number_options.extreme_value_chance
	});

	const formatChecks: z.$ZodCheckNumberFormat[] =
		number_schema._zod.def.checks?.filter(
			(c) => c instanceof z.$ZodCheckNumberFormat
		) ?? [];

	// z.$ZodCheckNumberFormatDef
	if (Object.hasOwn(number_schema._zod.def, "format")) {
		formatChecks.push(number_schema as unknown as z.$ZodCheckNumberFormat);
	}

	let is_int = formatChecks.reduce(
		(acc, check) =>
			acc ||
			check._zod.def.format === "int32" ||
			check._zod.def.format === "safeint" ||
			check._zod.def.format === "uint32",
		false
	);

	const is_finite = true; // get_number_checks(number_schema, "finite").length !== 0;

	const min_checks =
		number_schema._zod.def.checks?.filter(
			(c) => c instanceof z.$ZodCheckGreaterThan
		) ?? [];
	const max_checks =
		number_schema._zod.def.checks?.filter(
			(c) => c instanceof z.$ZodCheckLessThan
		) ?? [];

	const min_boundary: Boundary = min_checks.reduce<Boundary>(
		(prev, curr) => {
			const proposedBoundary: Boundary = [
				curr._zod.def.value as number,
				curr._zod.def.inclusive
			];
			return proposedBoundary[0] > prev[0] ? proposedBoundary : prev;
		},
		[Number.MIN_SAFE_INTEGER / 2, true]
	);

	const max_boundary: Boundary = max_checks.reduce<Boundary>(
		(prev, curr) => {
			const proposedBoundary: Boundary = [
				curr._zod.def.value as number,
				curr._zod.def.inclusive
			];
			return proposedBoundary[0] < prev[0] ? proposedBoundary : prev;
		},
		[Number.MAX_SAFE_INTEGER / 2, true]
	);

	let inclusive_min = min_boundary[1];
	let inclusive_max = max_boundary[1];

	let min = min_boundary[0];
	let max = max_boundary[0];

	if (!inclusive_min) {
		const float_step = float_step_size(min);
		min += is_int ? 1 : float_step;
	}

	if (!inclusive_max) {
		const float_step = float_step_size(max);
		max -= is_int ? 1 : float_step;
	}

	if (max < min) {
		throw new InvalidSchemaException(
			"max must be greater than min if specified"
		);
	}

	let value: number;
	if (is_int) {
		value = faker.number.int({ min, max });
	} else {
		if (is_extreme_value) {
			const use_lower_extreme = faker.datatype.boolean({ probability: 0.5 });
			if (use_lower_extreme) value = is_finite ? -Infinity : min;
			else value = is_finite ? Infinity : max;
		}

		value = faker.number.float({ min, max });
	}

	if (value === undefined)
		throw new Error(
			"Failed to generate Number. This is a bug in the built-in generator"
		);

	const multipleof_checks =
		number_schema._zod.def.checks?.filter(
			(c) => c instanceof z.$ZodCheckMultipleOf
		) ?? [];

	const multipleof = multipleof_checks.reduce((acc, check) => {
		const multipleOf = check._zod.def.value as number;
		return lcm(acc, multipleOf);
	}, Number(multipleof_checks[0]?._zod.def.value ?? Number.MIN_VALUE));

	if (multipleof !== Number.MIN_VALUE) {
		value = is_int
			? faker.number.int({
					min,
					max,
					multipleOf: multipleof !== Number.MIN_VALUE ? multipleof : undefined
			  })
			: faker.number.float({
					min,
					max,
					multipleOf: multipleof !== Number.MIN_VALUE ? multipleof : undefined
			  });

		// Due to floating point precision issues the generated number might not symbolically be a multiple of the given value.
		// Eg: 2.30000000000000004 is not a multiple of 0.1, and zod won't accept it.
		// We have to check that the generated value is actually a multiple of the given value.
		// otherwise, try again.
		const result = z4.number().multipleOf(multipleof).safeParse(value);
		if (!result.success) return generate_number(number_schema, ctx);
	}

	return value;
};

//Calculate the step size for modifying a float value
function float_step_size(n: number) {
	return Math.max(
		Number.MIN_VALUE,
		2 ** Math.floor(Math.log2(n)) * Number.EPSILON
	);
}

export const NumberGenerator: InstanceofGeneratorDefinition<z.$ZodNumber> = {
	schema: z.$ZodNumber as any,
	generator: generate_number,
	match: "instanceof"
};
