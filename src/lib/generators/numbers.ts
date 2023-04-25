import { z } from "zod";
import { faker } from "@faker-js/faker";
import { GeneratorDefinitionFactory } from "lib/zocker.js";
import { Generator } from "../generate.js";

type NumberGeneratorOptions = {
	non_finite_chance: number
}

const default_options: NumberGeneratorOptions = {
	non_finite_chance: 0.3
}

export const NumberGenerator: GeneratorDefinitionFactory<z.ZodNumber, Partial<NumberGeneratorOptions>> = (partial_options = {}) => {
	const options = { ...default_options, ...partial_options }

	const generate_number: Generator<z.ZodNumber> = (number_schema, ctx) => {
		let min =
			get_number_check(number_schema, "min")?.value ??
			Number.MIN_SAFE_INTEGER / 2;
		let max =
			get_number_check(number_schema, "max")?.value ??
			Number.MAX_SAFE_INTEGER / 2;

		let finite = !!get_number_check(number_schema, "finite");
		let int = !!get_number_check(number_schema, "int");

		if (int) {
			return faker.datatype.number({ min, max });
		} else {
			return faker.datatype.float({ min, max });
		}
	}

	return {
		schema: options.schema ?? z.ZodNumber as any,
		generator: generate_number,
		match: options.match ?? "instanceof"
	}
}


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
