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
		let is_int = get_number_checks(number_schema, "int").length !== 0
		let is_finite = get_number_checks(number_schema, "finite").length !== 0

		let min_checks = get_number_checks(number_schema, "min");
		let max_checks = get_number_checks(number_schema, "max");

		let min_check = min_checks.length === 0 ? null : min_checks.reduce((prev, curr) => prev.value > curr.value ? prev : curr);
		let max_check = max_checks.length === 0 ? null : max_checks.reduce((prev, curr) => prev.value < curr.value ? prev : curr);

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

		let value : number;

		if (is_int) {
			value = faker.datatype.number({ min, max });
		} else {
			if (is_extreme_value) {
				const use_lower_extreme = weighted_random_boolean(0.5);
				if (use_lower_extreme)
					value =  is_finite ? -Infinity : min;
				else
					value =  is_finite ? Infinity : max;
			}

			value = faker.datatype.float({ min, max });
		}

		if (value === undefined) throw new Error("Failed to generate Number. This is a bug in the built-in generator");
		
		let multipleof_checks = get_number_checks(number_schema, "multipleOf");
		let multipleof = multipleof_checks.length === 0 ? null : multipleof_checks[0]?.value!;

		if (multipleof !== null) {
			let next_higher = value + (multipleof - (value % multipleof));
			let next_lower = value - (value % multipleof);

			if (next_higher <= max) value = next_higher;
			else if (next_lower >= min) value = next_lower;
			else throw new InvalidSchemaException("No valid multipleOf value found");
		}

		return value;
	};

	return {
		schema: options.schema ?? (z.ZodNumber as any),
		generator: generate_number,
		match: options.match ?? "instanceof"
	};
};

//Get a check from a ZodNumber schema in a type-safe way
function get_number_checks<Kind extends z.ZodNumberCheck["kind"]>(
	schema: z.ZodNumber,
	kind: Kind
){
	return schema._def.checks.filter((check) => check.kind === kind) as Extract<z.ZodNumberCheck, { kind: Kind }>[] 
}

//Calculate the step size for modifying a float value
function float_step_size(n: number) {
	return Math.max(Number.MIN_VALUE, 2 ** Math.floor(Math.log2(n)) * Number.EPSILON);
}