import { Generator, generate } from "../generate.js";
import * as z from "zod/v4/core";
import { InstanceofGeneratorDefinition } from "../zocker.js";

const generate_promise: Generator<z.$ZodPromise<any>> = (
	schema,
	generation_context
) => {
	return generate(schema._zod.def.innerType, generation_context);
};

export const PromiseGenerator: InstanceofGeneratorDefinition<
	z.$ZodPromise<any>
> = {
	schema: z.$ZodPromise as any,
	generator: generate_promise,
	match: "instanceof"
};
