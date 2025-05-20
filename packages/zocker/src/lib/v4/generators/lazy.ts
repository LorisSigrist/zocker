import { InstanceofGeneratorDefinition } from "../zocker.js";
import { Generator, generate } from "../generate.js";
import * as z from "zod/v4/core";

const generate_lazy: Generator<z.$ZodLazy<any>> = (
	schema,
	generation_context
) => {
	const getter = schema._zod.def.getter();
	return generate(getter, generation_context);
};

export const LazyGenerator: InstanceofGeneratorDefinition<z.$ZodLazy<any>> = {
	schema: z.$ZodLazy as any,
	generator: generate_lazy,
	match: "instanceof"
};
