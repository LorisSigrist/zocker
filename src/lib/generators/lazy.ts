import { GeneratorDefinitionFactory } from "lib/zocker.js";
import { Generator, generate } from "../generate.js";
import { z } from "zod";

export const LazyGenerator: GeneratorDefinitionFactory<z.ZodLazy<any>> = (
	options = {}
) => {
	return {
		schema: options.schema ?? (z.ZodLazy as any),
		generator: generate_lazy,
		match: options.match ?? "instanceof"
	};
};

const generate_lazy: Generator<z.ZodLazy<any>> = (
	schema,
	generation_context
) => {
	const getter = schema._def.getter();
	return generate(getter, generation_context);
};
