import { z } from "zod";
import { faker } from "@faker-js/faker";
import { InstanceofGeneratorDefinition } from "../zocker.js";
import { Generator } from "../generate.js";
import { weighted_random_boolean } from "../utils/random.js";
import { InvalidSchemaException } from "../exceptions.js";
import { SemanticFlag } from "../semantics.js";

export type NumberGeneratorOptions = {
	extreme_value_chance: number;
};

const generate_number: Generator<z.ZodNumber> = (number_schema, ctx) => {
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

		return number_schema.parse(proposed_number);
	} catch (e) {}

	let is_extreme_value = weighted_random_boolean(
		ctx.number_options.extreme_value_chance
	);
	let is_int = get_number_checks(number_schema, "int").length !== 0;
	let is_finite = get_number_checks(number_schema, "finite").length !== 0;

	let min_checks = get_number_checks(number_schema, "min");
	let max_checks = get_number_checks(number_schema, "max");

	let min_check =
		min_checks.length === 0
			? null
			: min_checks.reduce((prev, curr) =>
					prev.value > curr.value ? prev : curr
			  );
	let max_check =
		max_checks.length === 0
			? null
			: max_checks.reduce((prev, curr) =>
					prev.value < curr.value ? prev : curr
			  );

	let inclusive_min = min_check?.inclusive ?? true;
	let inclusive_max = max_check?.inclusive ?? true;

	let min = min_check?.value ?? Number.MIN_SAFE_INTEGER / 2;
	let max = max_check?.value ?? Number.MAX_SAFE_INTEGER / 2;

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
			const use_lower_extreme = weighted_random_boolean(0.5);
			if (use_lower_extreme) value = is_finite ? -Infinity : min;
			else value = is_finite ? Infinity : max;
		}

		value = faker.number.float({ min, max });
	}

	if (value === undefined)
		throw new Error(
			"Failed to generate Number. This is a bug in the built-in generator"
		);

	let multipleof_checks = get_number_checks(number_schema, "multipleOf");
	let multipleof =
		multipleof_checks.length === 0
			? null
			: multipleof_checks.reduce((acc, check) => {
					return lcm(acc, check.value);
			  }, multipleof_checks[0]?.value!);

	if (multipleof !== null) {
		let next_higher = value + (multipleof - (value % multipleof));
		let next_lower = value - (value % multipleof);

		if (next_higher <= max) value = next_higher;
		else if (next_lower >= min) value = next_lower;
		else
			throw new InvalidSchemaException(
				`There exists no valid multiple of ${multipleof} between ${min} and ${max}.`
			);
	}

	return value;
};

//Get a check from a ZodNumber schema in a type-safe way
function get_number_checks<Kind extends z.ZodNumberCheck["kind"]>(
	schema: z.ZodNumber,
	kind: Kind
) {
	return schema._def.checks.filter((check) => check.kind === kind) as Extract<
		z.ZodNumberCheck,
		{ kind: Kind }
	>[];
}

//Calculate the step size for modifying a float value
function float_step_size(n: number) {
	return Math.max(
		Number.MIN_VALUE,
		2 ** Math.floor(Math.log2(n)) * Number.EPSILON
	);
}

function lcm<N extends bigint | number>(a: N, b: N): N {
	return ((a * b) / gcd<N>(a, b)) as N;
}

function gcd<N extends bigint | number>(a: N, b: N): N {
	if (b === 0n || b === 0) return a;
	return gcd<N>(b, (a % b) as N);
}

export const NumberGenerator: InstanceofGeneratorDefinition<z.ZodNumber> = {
	schema: z.ZodNumber as any,
	generator: generate_number,
	match: "instanceof"
};
