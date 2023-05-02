import { z } from "zod";
import { faker } from "@faker-js/faker";
import { GeneratorDefinitionFactory } from "lib/zocker.js";
import { Generator } from "../generate.js";
import { weighted_random_boolean } from "../utils/random.js";
import { InvalidSchemaException } from "../exceptions.js";

type NumberGeneratorOptions = {
	extreme_value_chance: number;
};

const default_options: NumberGeneratorOptions = {
	extreme_value_chance: 0.3
};

export const NumberGenerator: GeneratorDefinitionFactory<
	z.ZodNumber,
	Partial<NumberGeneratorOptions>
> = (partial_options = {}) => {
	const options = { ...default_options, ...partial_options };

	const generate_number: Generator<z.ZodNumber> = (number_schema, ctx) => {
		let is_extreme_value = weighted_random_boolean(options.extreme_value_chance);
		let is_int = !!get_number_check(number_schema, "int");
		let is_finite = !!get_number_check(number_schema, "finite");

		let min_check = get_number_check(number_schema, "min") ?? null
		let max_check = get_number_check(number_schema, "max") ?? null;

		let inclusive_min = min_check?.inclusive ?? true;
		let inclusive_max = max_check?.inclusive ?? true;

		let min = min_check?.value ?? Number.MIN_SAFE_INTEGER / 2;
		let max = max_check?.value ?? Number.MAX_SAFE_INTEGER / 2;



		if (!inclusive_min) {
			const float_step = float_step_size(min)
			min += is_int ? 1 : float_step;
		}

		if (!inclusive_max) {
			const float_step = float_step_size(max)
			max -= is_int ? 1 : float_step;
		}

		if (max < min) {
			throw new InvalidSchemaException("max must be greater than min if specified");
		}

		if (is_int) {
			return faker.datatype.number({ min, max });
		} else {
			if (is_extreme_value) {
				const use_lower_extreme = weighted_random_boolean(0.5);
				if (use_lower_extreme)
					return is_finite ? -Infinity : min;
				else
					return is_finite ? Infinity : max;
			}

			return faker.datatype.float({ min, max });
		}
	};

	return {
		schema: options.schema ?? (z.ZodNumber as any),
		generator: generate_number,
		match: options.match ?? "instanceof"
	};
};

//Get a check from a ZodNumber schema in a type-safe way
function get_number_check<Kind extends z.ZodNumberCheck["kind"]>(
	schema: z.ZodNumber,
	kind: Kind
): Extract<z.ZodNumberCheck, { kind: Kind }> | undefined {
	const check = schema._def.checks.find((check) => check.kind === kind) as
		| Extract<z.ZodNumberCheck, { kind: Kind }>
		| undefined;

	return check;
}

//Calculate the step size for modifying a float value
function float_step_size(n: number) {
	return Math.max(Number.MIN_VALUE, 2 ** Math.floor(Math.log2(n)) * Number.EPSILON);
}