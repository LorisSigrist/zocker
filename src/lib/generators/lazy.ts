import { InstanceofGeneratorDefinition } from "lib/zocker.js";
import { Generator, generate } from "../generate.js";
import { z } from "zod";

const generate_lazy: Generator<z.ZodLazy<any>> = (
	schema,
	generation_context
) => {
	const getter = schema._def.getter();
	return generate(getter, generation_context);
};

export const LazyGenerator: InstanceofGeneratorDefinition<z.ZodLazy<any>> = {
	schema: z.ZodLazy as any,
	generator: generate_lazy,
	match: "instanceof"
};
