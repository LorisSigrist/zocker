import { faker } from "@faker-js/faker";
import { Generator, generate } from "../generate.js";
import { z } from "zod";
import { InvalidSchemaException, RecursionLimitReachedException } from "../exceptions.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";

export type ArrayOptions = {
	/** The minimum number of elements, unless specified otherwise */
	min: number;
	/** The maximum number of elements, unless specified otherwise */
	max: number;
};

const generate_array: Generator<z.ZodArray<any>> = (array_schema, ctx) => {
	const exact_length = array_schema._def.exactLength?.value ?? null;

	const min = array_schema._def.minLength
		? array_schema._def.minLength.value
		: ctx.array_options.min
	const max = array_schema._def.maxLength
		? array_schema._def.maxLength.value
		: ctx.array_options.max
	
	
	if (min > max) throw new InvalidSchemaException("min length is greater than max length");

	const length =
		exact_length !== null ? exact_length : faker.datatype.number({ min, max });

	const generated_array = [];

	try {
		for (let i = 0; i < length; i++) {
			let generated_value;
			try {
				ctx.path.push(i);
				generated_value = generate(array_schema.element, ctx);
			} finally {
				ctx.path.pop();
			}
			generated_array.push(generated_value);
		}
		return generated_array;
	} catch (error) {
		//If we hit the recursion limit, and there is no minimum length, return an empty array
		if (!(error instanceof RecursionLimitReachedException)) throw error;
		if (min !== 0) throw error;
		if (exact_length !== null && exact_length !== 0) throw error;
		return [];
	}
};

export const ArrayGenerator: InstanceofGeneratorDefinition<z.ZodArray<any>> = {
	schema: z.ZodArray as any,
	generator: generate_array,
	match: "instanceof"
};
