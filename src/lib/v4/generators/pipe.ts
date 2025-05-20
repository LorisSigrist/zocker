import { InstanceofGeneratorDefinition } from "../zocker.js";
import { generate, Generator } from "../generate.js";
import * as z from "zod/v4/core";

const pipe_generator: Generator<z.$ZodPipe> = (schema, ctx) => {
	const first = schema._zod.def.in;
	const second = schema._zod.def.out;

	if (!(second instanceof z.$ZodTransform)) {
		// this is likely `z.preprocess`. Generate a value for the second parameter
		return generate(second, ctx);
	}

	const transform_function = second._zod.def.transform;

	const value = generate(first, ctx);
	const transformed = transform_function(value, { issues: [], value });

	return transformed;
};

export const PipeGenerator: InstanceofGeneratorDefinition<z.$ZodPipe> = {
	schema: z.$ZodPipe as any,
	generator: pipe_generator,
	match: "instanceof"
};
