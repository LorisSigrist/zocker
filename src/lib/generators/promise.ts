import { Generator, generate } from "../generate.js";
import { z } from "zod";
import { InstanceofGeneratorDefinition } from "../zocker.js";

const generate_promise: Generator<z.ZodPromise<any>> = (
	schema,
	generation_context
) => {
	return generate(schema._def.type, generation_context);
};

export const PromiseGenerator: InstanceofGeneratorDefinition<
	z.ZodPromise<any>
> = {
	schema: z.ZodPromise as any,
	generator: generate_promise,
	match: "instanceof"
};
