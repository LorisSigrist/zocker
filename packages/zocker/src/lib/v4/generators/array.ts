import { faker } from "@faker-js/faker";
import { Generator, generate } from "../generate.js";
import * as z from "zod/v4/core";
import {
	InvalidSchemaException,
	RecursionLimitReachedException
} from "../exceptions.js";
import { InstanceofGeneratorDefinition } from "../zocker.js";
import { getLengthConstraints } from "./string/length-constraints.js";

export type ArrayOptions = {
	/** The minimum number of elements, unless specified otherwise */
	min: number;
	/** The maximum number of elements, unless specified otherwise */
	max: number;
};

const generate_array: Generator<z.$ZodArray<any>> = (array_schema, ctx) => {
	const length_constraints = getLengthConstraints(array_schema);

	const min = Math.max(length_constraints.min, ctx.array_options.min);
	const max = Math.min(length_constraints.max, ctx.array_options.max);

	if (min > max)
		throw new InvalidSchemaException("min length is greater than max length");

	const length = length_constraints.exact ?? faker.number.int({ min, max });

	const generated_array = [];

	try {
		for (let i = 0; i < length; i++) {
			let generated_value;
			try {
				ctx.path.push(i);
				generated_value = generate(array_schema._zod.def.element, ctx);
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
		if (length_constraints.exact !== null && length_constraints.exact !== 0)
			throw error;
		return [];
	}
};

export const ArrayGenerator: InstanceofGeneratorDefinition<z.$ZodArray<any>> = {
	schema: z.$ZodArray as any,
	generator: generate_array,
	match: "instanceof"
};
